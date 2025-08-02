import {CheckoutProvider} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51RkbcOPrII6HE1FjCArTwodXWNKpZFydvoSNVaBREpycqDV54fqdTV26SR7fCaqELwZaXjBs6IDAiNK5hh87x6YJ00QTddCMCR');

const fetchClientSecret = () => {
  return fetch('/create-checkout-session', {method: 'POST'})
    .then((response) => response.json())
    .then((json) => json.checkoutSessionClientSecret)
};

export default function App() {
  return (
    <CheckoutProvider stripe={stripePromise} options={{fetchClientSecret}}>
      <CheckoutForm />
    </CheckoutProvider>
  );
}