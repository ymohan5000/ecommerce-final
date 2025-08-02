"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search, ArrowLeft } from 'lucide-react';

export default function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/orders/tracking/${trackingNumber.trim()}`);
      const data = await response.json();

      if (data.success) {
        router.push(`/order-tracking/${trackingNumber.trim()}`);
      } else {
        alert('Order not found. Please check your tracking number.');
      }
    } catch (error) {
      alert('Error tracking order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Track Your Order
              </CardTitle>
            </div>
            <p className="text-sm text-gray-500">
              Enter your tracking number to check the status of your order
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="mt-1"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !trackingNumber.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Tracking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track Order
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-sm mb-2">Need Help?</h3>
              <p className="text-xs text-gray-600">
                Your tracking number can be found in your order confirmation email 
                or on your order details page. It typically starts with "TRK".
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 