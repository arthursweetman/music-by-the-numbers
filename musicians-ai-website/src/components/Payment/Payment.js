import React from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import Checkout from './Checkout';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe("pk_test_51GwpPUE3mP6KyaqS7Qd9oLtTkq0JFI9hbDsJkA8bYCcXfuyqx00CkCvhcliiXHScJX8mOD9unLSwngIRmKF5D5D900tUgtgFjm");

export default function Payment() {
  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  );
};