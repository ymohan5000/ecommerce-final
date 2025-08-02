// lib/stripe.ts

import Stripe from 'stripe';

// Initialize Stripe with your secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // or the latest stable one
});

// Get the Stripe publishable key for client-side use
export const getStripePublishableKey = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Missing Stripe publishable key in env');
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Create a PaymentIntent for client-side payments (e.g., Stripe Elements)
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    throw error;
  }
};

// Create a Stripe Checkout session for redirect-based payment
export const createCheckoutSession = async (
  items: { name: string; image: string; price: number; quantity: number }[],
  successUrl: string,
  cancelUrl: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    throw error;
  }
};
