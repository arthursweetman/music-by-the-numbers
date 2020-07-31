import React, { Component } from 'react';
import axios from 'axios';
import { Layout, Header, Drawer, Grid, Cell } from 'react-mdl';
import { Link } from 'react-router-dom';
import firebase, { db } from '../Firebase/config';
import MusicNavigation from '../Landing/MusicNavigation';
import ImageUploader from './ImageUploader';
import {getSubscriptionStatus} from '../Payment/StripeStatus';
// MUI
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';

export class Profile extends Component{
    constructor(props) {
        super(props);
        this.state = {
            artist: "your favorite artist",
            customer: null,
            isSubscribed: undefined,
            sub_id: '',
            customer_id: '',
            open: false,
            openSuccessMessage: false,
            subIsEnding: false,
            subEndDate: null,
            isLoading: false,
        }
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleOpenDialogue = this.handleOpenDialogue.bind(this);
        this.handleCloseDialogue = this.handleCloseDialogue.bind(this);
        this.handleSubmitUnsub = this.handleSubmitUnsub.bind(this);
        this.handleCloseSuccessMessage = this.handleCloseSuccessMessage.bind(this);
        this.setSubStatus = this.setSubStatus.bind(this);
        this.setSubInfo = this.setSubInfo.bind(this);
    }
    
    componentDidMount() {
        const that = this;
        //Retrieve ARTIST NAME from Firebase
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) { // User is signed in.
                // Check if USER has existing artist.
                db.collection('users').doc(user.uid).get().then(async function(userDoc) {
                    if (userDoc.exists) {
                        const artist = userDoc.data().artist;
                        if (artist) {//USER has existing artist.
                            that.setState({
                                artist: artist
                            })
                            //Check Subscription status
                            await getSubscriptionStatus(that.state.isSubscribed, artist, db, that.setSubStatus, that.setSubInfo);
                            
                        } else {//USER missing artist
                            that.props.history.push('/createartist');
                        }                       
                    }
                }).catch(function(error) {
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

    setSubInfo(sub_id, subIsEnding, subEndDate) {
        this.setState({
            sub_id: sub_id,
            subIsEnding: subIsEnding,
            subEndDate: subEndDate,
        })
    }

    handleButtonClick() {
        this.state.isSubscribed ?
            this.handleOpenDialogue() :
            this.props.history.push('/payment');
    }

    handleOpenDialogue() {
        this.setState({open: true,});
    }

    handleCloseDialogue() {
        this.setState({open: false,});
    }

    handleCloseSuccessMessage() {
        this.setState({openSuccessMessage: false,});
    }

    //Handle "Unsubscribe" click
    async handleSubmitUnsub() {

        this.setState({isLoading: true,});

        await axios.post('https://us-central1-musician-ai.cloudfunctions.net/paymentFunctions/unsub',{
            'sub_id': this.state.sub_id,
        });

        // After they unsubscribe we need to update their subscription status on the page
        await getSubscriptionStatus(this.state.isSubscribed, this.state.artist, db, this.setSubStatus, this.setSubInfo);

        this.setState({
            open: false,
            openSuccessMessage: true, // This is the "handleOpenSuccessMessage()"
        });
    }

    render() {
        return (
            <div>
                <Layout style={{color:'#fb4080'}} fixedHeader>
                    <Header className="header-color" title={<Link style={{ textDecoration: 'none', color: 'white' }} to='/'>Interactive Albums</Link>} scroll>
                        <Cell hidePhone hideTablet>
                            <MusicNavigation></MusicNavigation>
                        </Cell>
                    </Header>
                    <Drawer title="Interactive Albums">
                        <MusicNavigation></MusicNavigation>
                    </Drawer>
                    <Grid className="upload-grid">
                        <Cell col={12}>
                            {this.state.isSubscribed !== undefined ? 
                                <div>

                                <Typography variant="h4" style={{color: 'black'}}>
                                    Subscription Status: 
                                </Typography>
                                <Typography variant="h4">
                                    {this.state.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                                </Typography> 
                                {this.state.subIsEnding ? 
                                    <Typography>
                                        Subscription ends on {new Date(this.state.subEndDate*1000).toString()}
                                    </Typography> 
                                    :
                                    <Button variant='contained' color='primary' onClick={this.handleButtonClick} >
                                        {this.state.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
                                    </Button>
                                }

                                {/* Unsubscribe Confirmation Popup */}
                                <Dialog
                                    open={this.state.open}
                                    onClose={this.handleCloseDialogue}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle>Are you sure you would like to unsubscribe?</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                        This will remove all access to premium features until the end of your current billing period, are you sure you would like to continue?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        {this.state.isLoading ?
                                            <CircularProgress size={24} />
                                            :
                                            <div>
                                                <Button onClick={this.handleCloseDialogue} color="primary">
                                                    No
                                                </Button>
                                                <Button onClick={this.handleSubmitUnsub} color="primary" autoFocus>
                                                    Yes, I want to unsubscribe
                                                </Button>
                                            </div>
                                        }
                                        
                                    </DialogActions>
                                </Dialog>

                                {/* Unsubscribe Success Message */}
                                <Dialog
                                    open={this.state.openSuccessMessage}
                                    onClose={this.handleCloseSuccessMessage}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogContent>
                                        <DialogContentText>
                                            You have successfully been unsubscribed from Alexa4Musicians. If you change your mind, you can always resubscribe at any point.
                                        </DialogContentText>
                                    </DialogContent>
                                </Dialog>

                                </div>
                                : 
                                <CircularProgress />
                            }

                            <ImageUploader musician={this.state.artist}></ImageUploader>
                        </Cell>
                    </Grid>
                </Layout>
            </div>   
        )
    }
}
export default Profile