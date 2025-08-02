"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/cart-context';
import { Loader2, CreditCard, CheckCircle, User, MapPin } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  onSuccess: (orderData: any) => void;
  onCancel: () => void;
}

function PaymentForm({ onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { getTotalPrice, clearCart, cartItems } = useCart();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent with metadata
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getTotalPrice(),
          currency: 'usd',
          metadata: {
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            customerAddress: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          },
        }),
      });

      const { clientSecret, error: intentError } = await response.json();

      if (intentError) {
        setError(intentError);
        setIsLoading(false);
        return;
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zipCode,
            },
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      // Create order in database
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: getTotalPrice(),
          customerInfo: formData,
          paymentStatus: 'completed',
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        // Payment successful
        clearCart();
        toast({
          title: "Payment successful!",
          description: `Order #${orderData.orderId} has been placed successfully.`,
        });
        onSuccess(orderData);
      } else {
        setError('Order creation failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Payment error:', err);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Main St"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="New York"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="NY"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="10001"
            />
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <Label>Payment Information</Label>
        <div className="p-4 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
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

interface StripePaymentProps {
  onSuccess: (orderData: any) => void;
  onCancel: () => void;
}

export function StripePayment({ onSuccess, onCancel }: StripePaymentProps) {
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment & Shipping Information
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
          <PaymentForm onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </CardContent>
    </Card>
  );
} 