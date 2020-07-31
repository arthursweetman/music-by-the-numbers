import axios from 'axios';

export const getSubscriptionStatus = async (isSubscribed, artist, db, setSubStatus, setSubInfo) => {

    // Obtain customer ID from Firebase
    const customer_id = await db.collection("musicians").doc(artist).get()
        .then(function(doc) {
            return doc.data().customer ? doc.data().customer.id : null;
        });

    // Obtain customer object from Stripe using the customer ID
    const customer = customer_id !== null ?
        await axios.get('https://us-central1-musician-ai.cloudfunctions.net/paymentFunctions/retrieveCustomer', {
            params: {
                'customer_id': customer_id,
            }
        }) :
        null; // customer === null if they have never subscribed before

    // Set status variable to correct value
    // Record the subscription ID for if the user chooses to end their subscription in profile.js
    // We also want to know if they are in a period where they will be ending their subscription - used in profile.js
    var status;
    var sub_id;
    var subIsEnding;
    if(customer !== null) {
        if(customer.data.customer.subscriptions.data.length > 0) {
            status = customer.data.customer.subscriptions.data[0].status;
            sub_id = customer.data.customer.subscriptions.data[0].id;
            subIsEnding = customer.data.customer.subscriptions.data[0].cancel_at_period_end;
        } else {
            status = "Subscription has ended";
            subIsEnding = false;
        }
    } else {
        status = "Never subscribed before";
        subIsEnding = false;
    }
    console.log("status: " + status);

    // Conclude whether user is subscribed or not
    setSubStatus(status === "active" || status === "trialing")

    if(setSubInfo){
        const subEndDate = subIsEnding ? (customer.data.customer.subscriptions.data[0].cancel_at) : null;
        console.log("SubIsEnding?: " + subIsEnding);
        setSubInfo(sub_id, subIsEnding, subEndDate);
    }
    
}