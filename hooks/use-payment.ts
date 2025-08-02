import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentOptions {
  amount: number;
  currency?: string;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  clientSecret?: string;
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPaymentIntent = async (options: PaymentOptions): Promise<PaymentResult> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency || 'usd',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return {
        success: true,
        clientSecret: data.clientSecret,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const createCheckoutSession = async (items: any[], successUrl: string, cancelUrl: string): Promise<PaymentResult> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          successUrl,
          cancelUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }

      return {
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPaymentIntent,
    createCheckoutSession,
    isLoading,
  };
} 