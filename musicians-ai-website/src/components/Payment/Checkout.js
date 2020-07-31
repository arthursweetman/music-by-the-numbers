import React, {useState} from 'react';
import axios from 'axios';
import { useHistory } from "react-router-dom";
// MUI Components
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
// Util imports
import {makeStyles} from '@material-ui/core/styles';
//Stripe
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
//Custom Components
import CardInput from './CardInput';
import LoadingScreen from '../Home/LoadingScreen';
//Firebase
import firebase, { db } from '../Firebase/config';
import {getSubscriptionStatus} from './StripeStatus';
import { Typography, CircularProgress } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    maxWidth: 500,
    margin: '30vh auto',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'flex-start',
  },
  div: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'space-between',
  },
  cardButton: {
    margin: '2em auto 1em',
  },
  returnButton: {
    marginLeft: '1em',
    marginTop: '1em',
  },
  hidden: {
    display: 'none',
  },
  text: {
      textAlign: 'center',
  }
});

function Checkout() {
    const classes = useStyles();
    let history = useHistory();
    // State
    const [email, setEmail] = useState('');
    const [artist, setArtist] = useState('');
    const [name, setName] = useState('');
    const [isSubscribed, setSubStatus] = useState(undefined);
    const [open, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const stripe = useStripe();
    const elements = useElements();

    //Retrieve ARTIST NAME from Firebase
    if(artist == '') {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) { // User is signed in.
                // Check if USER has existing artist.
                db.collection('users').doc(user.uid).get().then(function (userDoc) {
                    if (userDoc.exists) {
                        const artist = userDoc.data().artist;
                        if (artist) {//USER has existing artist.
                            setArtist(artist);
                        }
                    }
                }).catch(function (error) {
                    console.log("Error getting artist document:", error);
                });
            }
        })
    }

    //Retrieve Subscription status from Stripe
    if(isSubscribed === undefined && artist !== ''){
        getSubscriptionStatus(isSubscribed, artist, db, setSubStatus);
    }

    //Handle "Subscribe" Click
    const handleSubmitSub = async (event) => {

        setLoading(true); // This triggers the loading icon in the dialog box

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const result = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
            billing_details: {
                email: email,
            },
        });

        if(result.error) {
            console.log(result.error.message);
        } else {
            const res = await axios.post('https://us-central1-musician-ai.cloudfunctions.net/paymentFunctions/sub', 
                {
                    'email': email,
                    'artist': artist,
                    'name': name,
                    'payment_method': result.paymentMethod.id,
                });
            console.log(res.data);
            const {client_secret, status, customerId} = res.data;

            //Record customer data in firebase
            axios.post('https://us-central1-musician-ai.cloudfunctions.net/paymentFunctions/pushCustomerDataToFirebase',
                {
                    'customer_id': customerId,
                    'artist': artist,
                });
    
            if(status === 'requires_action') {
                stripe.confirmCardPayment(client_secret).then(function(result) {
                    if(result.error) {
                        // Show error message to the customer
                        console.log('There was an issue!');
                        console.log(result.error.message);
                    } else {
                        // Success message to the customer
                        console.log('Subscription successful!');
                    }
                });
            } else {
                console.log('Subscription successful!');
                // No additional information was needed
                // Show a success message to the customer
            }
        }

        setSubStatus(true);
            
    };

    const handleOpenDialogue = () => {
        setOpen(true);
    }

    const handleCloseDialogue = () => {
        setOpen(false);
    }

    //Handle "Return to dashboard" button click
    const handleDashNav = async (event) => {
        history.push('./home');
    }

    //Screen to show when the user is already subscribed
    const finishScreen = (
        <Card className={classes.root}>
            <CardContent className={classes.content}>
                <Typography variant="h4" className={classes.text}>
                    Congratulations! You can now enjoy all the benefits of premium features!
                </Typography>
                <Typography variant='h6' className={classes.text}>
                    You can unsubscribe anytime under the "Profile" tab
                </Typography>
                <div className={classes.div}>
                    <Button variant="contained" color="primary" className={classes.cardButton} onClick={handleDashNav}>
                        Return to Dashboard
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const paymentScreen = (
        <div>
        <Button variant="contained" color="primary" className={classes.returnButton} onClick={handleDashNav}>
            Back to Home
        </Button>
        <Card className={classes.root}>
        <CardContent className={classes.content}>
            <TextField
                label='Name'
                id='outlined-name-input'
                helperText={`Your name`}
                margin='normal'
                variant='outlined'
                type='name'
                required
                onChange={(e) => setName(e.target.value)}
                fullWidth
            />
            <TextField
                label='Email'
                id='outlined-email-input'
                helperText={`Email you'll recive updates and receipts on`}
                margin='normal'
                variant='outlined'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
            />
            <CardInput />
            <div className={classes.div}>
            <Button variant="contained" color="primary" className={classes.cardButton} onClick={handleOpenDialogue}>
                Subscribe
            </Button>
            </div>
        </CardContent>
        </Card>

        {/* Confirmation Dialog Popup */}
        <Dialog
            open={open}
            onClose={handleCloseDialogue}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle>Confirm Subscription?</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    After you click the button below you will be automatically billed every month using the information you have provided. You will recieve a confirmation email when your payment goes through.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {isLoading ? 
                    <CircularProgress size={24} />
                    :
                    <div>
                        <Button onClick={handleCloseDialogue} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitSub} color="primary" autoFocus>
                            Continue
                        </Button>
                    </div>
                }
            </DialogActions>
        </Dialog>
        </div>
    )

    if(isSubscribed === undefined) {
        return <LoadingScreen />;
    } else if (isSubscribed === true) {
        return finishScreen;
    } else { // isSubscribed === false
        return paymentScreen;
    }
}

export default Checkout;