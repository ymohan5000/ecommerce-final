"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Package, Truck, Home, Clock, MapPin, User, Mail, Phone } from 'lucide-react';
import Image from 'next/image';

interface OrderData {
  _id: string;
  orderNumber: string;
  trackingNumber: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdAt: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  products: Array<{
    product: {
      name: string;
      image: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  shippingInfo?: {
    carrier: string;
    trackingUrl: string;
    estimatedDelivery: string;
  };
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/tracking/${trackingNumber}`);
        const data = await response.json();

        if (data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Order not found');
        }
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchOrder();
    }
  }, [trackingNumber]);

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4">Loading order details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-4">{error || 'Unable to find order with this tracking number.'}</p>
              <Button onClick={() => window.history.back()}>
                <Home className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Order Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order #{order.orderNumber}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Tracking: {order.trackingNumber}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Order Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className={`text-sm mt-2 text-center ${
                      isCurrent ? 'font-semibold text-primary' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-full h-1 mt-4 ${
                        isCompleted ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{order.customerInfo.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{order.customerInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{order.customerInfo.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p>{order.customerInfo.address}</p>
                  <p>{order.customerInfo.city}, {order.customerInfo.state} {order.customerInfo.zipCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">${order.totalPrice.toFixed(2)}</span>
                </div>
                {order.shippingInfo && (
                  <>
                    <div className="flex justify-between">
                      <span>Carrier:</span>
                      <span>{order.shippingInfo.carrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Delivery:</span>
                      <span>{new Date(order.shippingInfo.estimatedDelivery).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.products.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <Image
                      src={item.product.image || '/placeholder.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => window.history.back()} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          {order.shippingInfo?.trackingUrl && (
            <Button asChild>
              <a href={order.shippingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                <Truck className="h-4 w-4 mr-2" />
                Track Shipment
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 