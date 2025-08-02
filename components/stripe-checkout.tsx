"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { Loader2, CreditCard, CheckCircle } from 'lucide-react';

// Load Stripe outside of component to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setIsLoading(false);
      return;
    }

    // Create payment intent
    try {
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalPrice(),
          currency: 'usd',
        }),
      });

      const { clientSecret, error: intentError } = await response.json();

      if (intentError) {
        setError(intentError);
        setIsLoading(false);
        return;
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      // Payment successful
      clearCart();
      toast({
        title: "Payment successful!",
        description: "Your order has been placed successfully.",
      });
      onSuccess();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${getTotalPrice().toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface StripeCheckoutProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({ onSuccess, onCancel }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalPrice, cartItems } = useCart();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: getTotalPrice(),
            currency: 'usd',
          }),
        });

        const { clientSecret, error } = await response.json();

        if (error) {
          console.error('Error creating payment intent:', error);
          return;
        }

        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (cartItems.length > 0) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [getTotalPrice, cartItems.length]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Unable to initialize payment. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#0f172a',
              },
            },
          }}
        >
          <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </CardContent>
    </Card>
  );
} 