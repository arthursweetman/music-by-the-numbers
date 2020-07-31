let admin = require("firebase-admin");
const db = require("../db/db").db;
const express = require("express");
const app = express();
const cors = require("cors")({
  origin: true,
});
app.use(cors);
const stripe = require('stripe')('sk_test_51GwpPUE3mP6KyaqSkek8rc36ckXSqZwJBGhXsNJVPE4RJRc7UJ3aoEKzLEYxx9jbMwIJtKBK90jRqnxkOu6Ha07G00NYTzApRd', {apiVersion: ''});

app.post('/sub', async (req, res) => {
  const {email, artist, name, payment_method} = req.body;

  const customer = await stripe.customers.create({
    payment_method: payment_method,
    email: email,
    name: name,
    invoice_settings: {
      default_payment_method: payment_method,
    },
    metadata: {'artist': artist},
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: "price_1GwpoGE3mP6KyaqS9pn2CnSE" }],
    expand: ['latest_invoice.payment_intent']
  });

  const status = subscription['latest_invoice']['payment_intent']['status'];
  const client_secret = subscription['latest_invoice']['payment_intent']['client_secret'];

  res.json({'client_secret': client_secret, 'status': status, 'customerId': customer.id}); //Return Customer ID which is used later to upload customer data to firebase
});

app.post('/unsub', async (req, res) => {
  const {sub_id} = req.body;
  stripe.subscriptions.update(sub_id, {cancel_at_period_end: true});
  res.status(200).send("Unsubscribed from stripe");
});

app.get('/retrieveCustomer', async (req, res) => {
  let customer_id = req.body.customer_id || req.query.customer_id || null;
  stripe.customers.retrieve(
    customer_id,
    function(err, customer) {
      if(customer === null){
        res.status(412).send("Customer does not exist");
      } else {
        res.status(200).json({'customer': customer});
      }
    }
  );
});

app.post('/pushCustomerDataToFirebase', async (req, res) => {
  let { customer_id, artist } = req.body;
  stripe.customers.retrieve(
    customer_id,
    async function(err, customer) {
      console.log(err);
      await db
        .collection("musicians").doc(artist).update({'customer': customer})
        .catch(err => {
          res.status(400).send('Error getting documents', err);
        })
    }
  );
});

module.exports={app,};