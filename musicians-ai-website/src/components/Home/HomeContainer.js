import React, { Component } from 'react';
import firebase, { db } from '../Firebase/config';
import * as d3 from "d3";
import Home from './Home';
import HomeNotSubscribed from './HomeNotSubscribed';
import LoadingScreen from './LoadingScreen';
import axios from 'axios';
import {getSubscriptionStatus} from '../Payment/StripeStatus';

export class HomeContainer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            artist: "",
            dailyData: [],
            yearData: [],
            monthData: [],
            weekData: [],
            // isFetching: false, // Possibly use this state for re-fetching data every 30 seconds
            totalSessions: 0,
            totalUsers: 0,
            users30Days: 0,
            sessions30Days: 0,
            usersPrev30Days: 0,
            sessionsPrev30Days: 0,
            histogram: [],
            intents: [],
            isLoading: true,
            discoverabilityData: [],
            fanData: [],
            isSubscribed: undefined,
        }
        this.setSubStatus = this.setSubStatus.bind(this);
    }

    componentDidMount() {
        let that = this;
        //Retrieve ARTIST NAME from Firebase
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) { // User is signed in.
                // Check if USER has existing artist.
                db.collection('users').doc(user.uid).get().then(async function (userDoc) {
                    if (userDoc.exists) {
                        const artist = userDoc.data().artist;
                        if (artist) {//USER has existing artist.
                            that.setState({
                                artist: artist,
                            });
                            await getSubscriptionStatus(that.state.isSubscribed, artist, db, that.setSubStatus);
                            that.fetchData(artist); // Obtain artist data from firebase
                            that.getSmapiStatus()

                        } else {//USER missing artist
                            that.props.history.push('/createartist');
                        }
                    }
                }).catch(function (error) {
                    console.log("Error getting document:", error);
                });
            } else { // No user is signed in.
                that.props.history.push('/signin');
            }
        });
    }

    setSubStatus(status) {
        this.setState({
            isSubscribed: status
        })
    }

    async fetchData(artist) {
        let that = this;
        
        //make API call for daily data
        const req = new XMLHttpRequest();
        var url = 'https://us-central1-musician-ai.cloudfunctions.net/retrieve/getDailyMusicianData?musician='+artist;
        req.open("POST",url,true);
        req.send();
        req.onload = function(){
            if(JSON.parse(req.responseText).length > 0) {
                that.manipulateDailyData(JSON.parse(req.responseText));
            }
        }

        //Make API call for Discoverability Data
        const res = await axios.post('https://us-central1-musician-ai.cloudfunctions.net/retrieve/getDiscoverabilityData',
            {
                musician: artist,
            });
        this.manipulateDiscoverabilityData(res.data);

        //Make API call for fan data
        const res2 = await axios.post('https://us-central1-musician-ai.cloudfunctions.net/retrieve/getFanData',
            {
                musician: artist,
            });
        this.manipulateFanData(res2.data);

        //Make API call for request data
        const req2 = new XMLHttpRequest();
        var url2 = 'https://us-central1-musician-ai.cloudfunctions.net/retrieve/getRequestData?musician='+artist;
        req2.open("POST",url2,true);
        req2.send();
        req2.onload = function(){
            that.manipulateRequestData(JSON.parse(req2.responseText))
        }
    }

    manipulateFanData(fanData) {
        // Desired format:
        // const result = [
        //     {
        //         state: "Ohio",
        //         value: 8,
        //     }
        // ]
        const numInEachState = d3.nest()
            .key(function(d) { return d.location; })
            .rollup(function(v) { return v.length; })
            .entries(fanData);

        this.setState({
            fanData: numInEachState,
        })
    }

    manipulateDiscoverabilityData(discoverabilityData) {

        //List of valid social medias (we can expand or remove this)
        const validTerms = ['facebook', 'linkedin', 'instagram', 'tiktok', 'twitter', 'youtube', 'facebookmessenger'];
        const newData = d3.nest()
            .key(function(d) { return d.socialMedia; })
            .rollup(function(v) { return v.length; })
            .entries(discoverabilityData);

        // Make sure all social medias are valid
        for(var i = 0 ; i < newData.length ; i++) {
            if(!validTerms.includes(newData[i].key)) {
                newData.splice(i);
            }
        }

        const sortedData = newData.slice().sort((a, b) => d3.descending(a.value, b.value));

        this.setState({
            discoverabilityData: sortedData,
        });
        
    }

    manipulateRequestData(requestData) {
        var totalUsers;
        var uniqueSessions;
        var totalSessions;
        var prev30DaysRequests;
        var past30DaysRequests;
        var users30Days;
        var sessions30Days;
        var usersPrev30Days;
        var sessionsPrev30Days;
        var sessionLengths;
        var intents;
        var uniqueDevices;

        // Calculate request data for different time spans
        const _30DaysAgo = new Date((new Date())-(30*24*60*60*1000)); // today's date minus 30 days in milliseconds
        const _60DaysAgo = new Date((new Date())-(60*24*60*60*1000)); // today's date minus 60 days in milliseconds
        prev30DaysRequests = requestData.filter(function(d) {
            const dateOfRequest = new Date(d.timestamp);
            return(dateOfRequest < _30DaysAgo && dateOfRequest > _60DaysAgo);
        })
        past30DaysRequests = requestData.filter(function(d) {
            const dateOfRequest = new Date(d.timestamp);
            return(dateOfRequest > _30DaysAgo);
        })
        // Get number of unique users
        totalUsers = this.numUserTypes(totalUsers, 'userID', requestData).length;
        // Unique users prev 30 days
        usersPrev30Days = this.numUserTypes(usersPrev30Days, 'userID', prev30DaysRequests).length;
        // Unique users past 30 days
        users30Days = this.numUserTypes(users30Days, 'userID', past30DaysRequests).length;
        // Get total number of sessions
        uniqueSessions = this.numUserTypes(totalSessions, 'sessionId', requestData); //We use uniqueSession down below
        totalSessions = uniqueSessions.length;
        // Total Sessions prev 30 days
        sessionsPrev30Days = this.numUserTypes(sessionsPrev30Days, 'sessionId', prev30DaysRequests).length;
        // Total sessions past 30 days
        sessions30Days = this.numUserTypes(sessions30Days, 'sessionId', past30DaysRequests).length;
        
        // Get session lengths
        uniqueSessions.forEach(d => {
            d.values[0].formattedTime = new Date(d.values[0].timestamp);
            d.values[d.values.length-1].formattedTime = new Date(d.values[d.values.length-1].timestamp);
            d.sessionLength = (d.values[d.values.length-1].formattedTime - d.values[0].formattedTime)/1000;
        });
        sessionLengths = uniqueSessions.map(d => d.sessionLength )
        
        // Find maximum session length
        const maxSessionLength = d3.max(sessionLengths);
        const numBins = 30; // 30 bins is typical for a histogram
        // Initialize a new array with correct number of bins and proper labels ("key")
        var histogram = new Array(numBins);
        for(var i = 0 ; i < numBins ; i++) {
            histogram[i] = {
                "key": Math.round(i*maxSessionLength/numBins), 
                "value": 0
            }
        }
        // Loop through all session lengths and increment the appropriate bin's value
        sessionLengths.forEach(d => {
            const binNumber = Math.round(d/(maxSessionLength/(numBins-1)));
            histogram[binNumber].value++;
        })

        //Calculate number of various intents used
        intents = d3.nest()
            .key(function(d) { return d.intent; })
            .rollup(function(v) { return v.length; })
            .entries(requestData)
        //Keep only useful intents
        intents = intents.filter(function(d){ 
            return (d.key == "WhereCanIFindYourMusic" || d.key == "ConnectIntent" || 
                    d.key == "PlaySongIntent" || d.key == "CaptureIntent") 
        })
        
        // Set state with new data
        this.setState({
            totalUsers: totalUsers,
            totalSessions: totalSessions,
            users30Days: users30Days,
            sessions30Days: sessions30Days,
            usersPrev30Days: usersPrev30Days,
            sessionsPrev30Days: sessionsPrev30Days,
            histogram: histogram,
            intents: intents,
            isLoading: false, // Not loading anymore
        })

    }

    manipulateDailyData(dailyData) {
        var formatTime = d3.timeFormat("%b %d"); // Declare date format ("abb DD")
        dailyData.forEach(function(d) {
            var date = formatTime(new Date(d.timestamp*1000)); // Create a new Date object formatted as specified above
            d.date = date;
        });
        // Calculate cumulative number of sessions
        for(var i = 0 ; i < dailyData.length ; i++) {
            dailyData[i].cumulativeSessions = (i == 0) ? (dailyData[0].totalSessions) : dailyData[i].totalSessions + dailyData[i-1].cumulativeSessions;
        }

        // Create copies of data for filtering
        var yearData = JSON.parse(JSON.stringify(dailyData));
        var monthData = JSON.parse(JSON.stringify(dailyData));
        var weekData = JSON.parse(JSON.stringify(dailyData));

        // Filter by year, month, and week
        const _1YearAgo = new Date((new Date())-(365*24*60*60*1000));
        const _1MonthAgo = new Date((new Date())-(30*24*60*60*1000));
        const _1WeekAgo = new Date((new Date())-(7*24*60*60*1000));

        // Year
        yearData = yearData.filter(function(d) {
            const dateOfRequest = new Date(d.timestamp*1000);
            return(dateOfRequest > _1YearAgo);
        });
        const yearInitialQuantity = yearData[0] ? yearData[0].cumulativeSessions : 0; // Ternary logic only necessary for when data collection stops working properly
        yearData.forEach(d => {
            d.cumulativeSessions = d.cumulativeSessions-yearInitialQuantity;
        });

        // Month
        monthData = monthData.filter(function(d) {
            const dateOfRequest = new Date(d.timestamp*1000);
            return(dateOfRequest > _1MonthAgo);
        });
        const monthInitialQuantity = monthData[0] ? monthData[0].cumulativeSessions : 0; // Ternary logic only necessary for when data collection stops working properly
        monthData.forEach(d => {
            d.cumulativeSessions = d.cumulativeSessions-monthInitialQuantity;
        });

        // Week
        weekData = weekData.filter(function(d) {
            const dateOfRequest = new Date(d.timestamp*1000);
            return(dateOfRequest > _1WeekAgo);
        });
        const weekInitialQuantity = weekData[0] ? weekData[0].cumulativeSessions : 0; // Ternary logic only necessary for when data collection stops working properly
        weekData.forEach(function(d) {
            d.cumulativeSessions = d.cumulativeSessions-weekInitialQuantity;
        });
        
        // Set State
        this.setState({
            dailyData: dailyData,
            yearData: yearData,
            monthData: monthData,
            weekData: weekData,
        })
    }

    // Function used in "manipulateRequestData()" that is called many times
    numUserTypes(name, type, timeSpan) {
        name = d3.nest()
            .key(function(d) { return d[type]; })
            .entries(timeSpan)
        // Filter out all users that are not actually users (i.e. Amazon)
        name = name.filter(function(d) {
            return(d.values[0].deviceName != "ALEXA_UNSPECIFIED_SCREEN" &&
                    d.values.length > 1)
        })
        return(name);
    }

    getSmapiStatus = () => {
        // create a new XMLHttpRequest
        var xhr = new XMLHttpRequest()

        // get a callback when the server responds
        xhr.addEventListener('load', () => {
            // update the state of the component with the result here
            console.log("SMAPI RESPONSE")
            console.log(xhr.responseText)
            // alert(xhr.responseText.substring(xhr.responseText.indexOf('status') + 10, xhr.responseText.indexOf('skill_submission_timestamp') - 4))
        })
        // open the request with the verb and the url
        xhr.open('POST', 'https://us-central1-musician-ai.cloudfunctions.net/certificationStatusAlexaSkill')
        // send the request
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({ 
            name: this.state.artist
        }))
    }

    render() {
        if (this.state.isLoading){
            return <LoadingScreen />;
        } else if(this.state.isSubscribed){
            return (
                <div>
                    <Home 
                        artist={this.state.artist}
                        dailyData={this.state.dailyData}
                        yearData={this.state.yearData}
                        monthData={this.state.monthData}
                        weekData={this.state.weekData}
                        totalUsers={this.state.totalUsers}
                        totalSessions={this.state.totalSessions}
                        histogram={this.state.histogram}
                        intents={this.state.intents}
                        users30Days={this.state.users30Days}
                        sessions30Days={this.state.sessions30Days}
                        usersPrev30Days={this.state.usersPrev30Days}
                        sessionsPrev30Days={this.state.sessionsPrev30Days}
                        discoverabilityData={this.state.discoverabilityData}
                        fanData={this.state.fanData}
                    />
                </div>
            )
        } else {// Not subscribed
            return (
                <HomeNotSubscribed 
                    artist={this.state.artist}
                    dailyData={this.state.dailyData}
                    yearData={this.state.yearData}
                    monthData={this.state.monthData}
                    weekData={this.state.weekData}
                    totalUsers={this.state.totalUsers}
                    totalSessions={this.state.totalSessions}
                    users30Days={this.state.users30Days}
                    sessions30Days={this.state.sessions30Days}
                    usersPrev30Days={this.state.usersPrev30Days}
                    sessionsPrev30Days={this.state.sessionsPrev30Days}
                />
            )
        }
        
    }
}

export default HomeContainer;
