"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { StripeCheckout } from '@/components/stripe-checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Package, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const handlePaymentSuccess = () => {
    setIsPaymentComplete(true);
    // You can redirect to a success page or show a success message
    setTimeout(() => {
      router.push('/payment/success');
    }, 2000);
  };

  const handlePaymentCancel = () => {
    router.push('/');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-4">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Button onClick={() => router.push('/')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPaymentComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-gray-500">
              Redirecting you to the success page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-500 mt-2">
            Complete your purchase securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary ({getTotalItems()} items)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <StripeCheckout
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 