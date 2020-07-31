import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from 'recharts';
import './Home.css';
import firebase, {db} from '../Firebase/config';
import {TwitterShareButton, TwitterIcon, FacebookShareButton, FacebookIcon, LinkedinShareButton, LinkedinIcon, FacebookMessengerShareButton, FacebookMessengerIcon} from "react-share";
//MUI
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
        return (
            <div className='tooltipContent'>
                <p>{`${payload[0].payload.payload.key} : ${payload[0].payload.payload.value}`}</p>
            </div>
        )
    }
}

export const Discoverability = (props) => {

    const [signedInTwitter, setTwitterSignedIn] = useState(false);
    const [numLinkShares, setNumLinkShares] = useState(0);
    const [twitterSignInOpen, setTwitterSignInOpen] = useState(false);
    const [twitterHandle, setTwitterHandle] = useState("");

    const bearer_token = "AAAAAAAAAAAAAAAAAAAAAPqDGAEAAAAAkkS31hJazgbDpgFRmyoWFmQvAcM%3D8DQ9kTwI3QqABLIMAEGOZvJeNZR3cEdqQYpgTZbZuFumQ5T14s";
    const disc = props.discoverabilityData; //Make data easier to access
    const colors = ['#A19347','#8C9BF5','#152161','#FB4080', '#3F51B5'];

    useEffect(() => { //componentDidMount()
        //Check twitter sign in status
        getTwitterSignedInStatus();
    },[]);

    async function getTwitterSignedInStatus() {
        const twitter = await db.collection('musicians').doc(props.artist).get()
            .then(function(snapshot) {
                return snapshot.data().twitter;
            })
            .catch((error) => {
                console.log("Trouble obtaining Twitter handle from Firebase: " + error);
            })
        if(twitter !== undefined && twitter !== null && twitter !== "") {
            setTwitterHandle(twitter);
            setTwitterSignedIn(true);
            //Calculate number of link shares
            calculateNumLinkShares(twitter); //Pass the handle directly to avoid state errors
        } else {
            setTwitterSignedIn(false);
        }
    }

    async function calculateNumLinkShares(twitterHandle) {
        
        const tweets = await axios.post('https://us-central1-musician-ai.cloudfunctions.net/twitter/getTwitterData', {
            twitterHandle: twitterHandle,
            artist: props.artist,
        });
        setNumLinkShares(tweets.data.results.length);
    }

    function handleTwitterSignInOpen() {
        setTwitterSignInOpen(true);
    }

    function handleTwitterSignInClose() {
        setTwitterSignInOpen(false);
    }

    async function handleSubmit() {
        if(twitterHandle !== "") {
            const editedHandle = twitterHandle.charAt(0) !== '@' ? '@' + twitterHandle : twitterHandle;
            setTwitterHandle(editedHandle);
            await db.collection('musicians').doc(props.artist).update({
                twitter: editedHandle,
            });
            setTwitterSignInOpen(false);
            setTwitterSignedIn(true);
        }
        
    }

    const ButtonArray = () => {
        return(
            <div>
            <FacebookShareButton
                url={"https://alexa4musicians.com/get-started/"+props.artist.split(" ").join("%20")+"/facebook"}
            >
                <FacebookIcon size={32} round/>
            </FacebookShareButton>
            <LinkedinShareButton
                url={"https://alexa4musicians.com/get-started/"+props.artist.split(" ").join("%20")+"/linkedin"}
            >
                <LinkedinIcon size={32} round />
            </LinkedinShareButton>
            <TwitterShareButton 
                url={"https://alexa4musicians.com/get-started/"+props.artist.split(" ").join("%20")+"/twitter"}
                hashtags={["alexa4musicians"]}
            >
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <FacebookMessengerShareButton
                url={"https://alexa4musicians.com/get-started/"+props.artist.split(" ").join("%20")+"/facebookmessenger"}
            >
                <FacebookMessengerIcon size={32} round />
            </FacebookMessengerShareButton>
            </div>
        )
    }

    function toTitleCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return(
        <div>
            <Typography variant='h5'>Top 5 ways your fans have discovered your skill:</Typography>
            <ButtonArray />
            {disc.length > 0 ? // Ternary operator in case artist has no discoverability data yet
                <div>
                    <ol>
                        {disc[0] ? <li>{toTitleCase(disc[0].key) + ' - ' + disc[0].value}</li> : null}
                        {disc[1] ? <li>{toTitleCase(disc[1].key) + ' - ' + disc[1].value}</li> : null}
                        {disc[2] ? <li>{toTitleCase(disc[2].key) + ' - ' + disc[2].value}</li> : null}
                        {disc[3] ? <li>{toTitleCase(disc[3].key) + ' - ' + disc[3].value}</li> : null}
                        {disc[4] ? <li>{toTitleCase(disc[4].key) + ' - ' + disc[4].value}</li> : null}
                    </ol>
                    <ResponsiveContainer
                        minHeight={180}
                        minWidth={90}
                    >
                        <PieChart>
                            <Pie data={disc} dataKey="value" nameKey="name" innerRadius={'50%'}>
                                {
                                    disc.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index]}/>
                                    ))
                                }
                            </Pie>
                            <Tooltip content={CustomTooltip} />
                        </PieChart>
                    </ResponsiveContainer>
                    {signedInTwitter ? 
                        <div>
                            <Typography>{twitterHandle}, you have shared your link {numLinkShares} times on Twitter.</Typography>
                            <TwitterShareButton 
                                url={"https://alexa4musicians.com/get-started/"+props.artist.split(" ").join("%20")+"/twitter"}
                                hashtags={["alexa4musicians"]}
                            >
                                <TwitterIcon style={{margin: '1em'}}size={32} round />
                            </TwitterShareButton>
                        </div>
                        :
                        <Button style={{margin: '1em', backgroundColor: '#00ACEE'}} variant='contained' color='primary' onClick={handleTwitterSignInOpen}>Sign in to Twitter</Button>
                    }
                    <Dialog
                        open={twitterSignInOpen}
                        onClose={handleTwitterSignInClose}
                    >
                        <DialogTitle>Provide Twitter handle to display your data</DialogTitle>
                        <DialogContent>
                            <TextField
                                label='Twitter Handle'
                                placeholder='@VoiceFirstAI'
                                margin='normal'
                                variant='outlined'
                                type='name'
                                required
                                onChange={(e) => setTwitterHandle(e.target.value)}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button style={{color: '#00ACEE'}} color='primary' onClick={handleSubmit}>
                                Submit
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            :
                <Typography variant='h4' style={{margin: '1em'}}>No data to display! :(</Typography>
            }
            
        </div>
    )
}
Discoverability.propTypes = {
    discoverabilityData: PropTypes.array.isRequired,
    artist: PropTypes.string.isRequired,
}
export default Discoverability;