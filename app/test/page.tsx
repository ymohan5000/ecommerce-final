"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Database, CheckCircle } from 'lucide-react';

export default function TestPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, getTotalPrice } = useCart();
  const { toast } = useToast();

  const testDatabase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, database: data.length > 0 ? '✅ Connected' : '⚠️ No products found' }));
      toast({
        title: "Database Test",
        description: data.length > 0 ? `Found ${data.length} products` : "No products in database",
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, database: '❌ Connection failed' }));
      toast({
        title: "Database Test Failed",
        description: "Could not connect to database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testStripe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 10, currency: 'usd' }),
      });
      const data = await response.json();
      
      if (data.clientSecret) {
        setTestResults(prev => ({ ...prev, stripe: '✅ Connected' }));
        toast({
          title: "Stripe Test",
          description: "Payment intent created successfully",
        });
      } else {
        setTestResults(prev => ({ ...prev, stripe: '❌ Failed to create payment intent' }));
        toast({
          title: "Stripe Test Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, stripe: '❌ Connection failed' }));
      toast({
        title: "Stripe Test Failed",
        description: "Could not connect to Stripe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTestProduct = () => {
    const testProduct = {
      _id: 'test-product-' + Date.now(),
      name: 'Test Product',
      description: 'This is a test product',
      price: 29.99,
      image: '/placeholder.jpg',
      category: 'Test',
      rating: { stars: 5, count: 1 }
    };
    
    addToCart(testProduct);
    toast({
      title: "Test Product Added",
      description: "Added test product to cart",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Integration Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={testDatabase}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Test Database
              </Button>
              
              <Button
                onClick={testStripe}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Test Stripe
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              <div className="space-y-1">
                <p><strong>Database:</strong> {testResults.database || 'Not tested'}</p>
                <p><strong>Stripe:</strong> {testResults.stripe || 'Not tested'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Cart Test:</h3>
              <div className="space-y-2">
                <Button onClick={addTestProduct} variant="outline">
                  Add Test Product to Cart
                </Button>
                <p><strong>Cart Total:</strong> ${getTotalPrice().toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Environment Variables:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Stripe Secret Key:</strong> {process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>Stripe Publishable Key:</strong> {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>MongoDB URI:</strong> {process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 