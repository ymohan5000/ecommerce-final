"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Package, Mail } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // You can add analytics tracking here
    console.log('Payment successful - tracking event');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold mb-4">
              Payment Successful!
            </CardTitle>
            
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <Package className="h-4 w-4" />
                <span>Order confirmation sent to your email</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>Tracking information will be sent soon</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/orders')}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 