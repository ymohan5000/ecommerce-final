"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Package, Calendar, MapPin, Phone, X } from "lucide-react";
import { toast } from "sonner";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  totalPrice: number;
  status: string;
  createdAt: string;
  address: string;
  phoneNo: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  const cancelOrder = async (orderId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to cancel your order.");
      return;
    }

    setCancellingOrder(orderId);

    try {
      const response = await axios.patch(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Order cancelled successfully!");

        // Update the order status in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
      } else {
        toast.error(response.data.error || "Failed to cancel the order.");
      }
    } catch (error: any) {
      console.error("Order cancellation error:", error);
      toast.error(error.response?.data?.error || "Could not cancel the order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-4 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your order history</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 text-center">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-gray-100 border-b">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {order.phoneNo}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                        <MapPin className="h-5 w-5 mt-1" />
                        {order.address}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      <p className="text-lg font-bold mt-1">${order.totalPrice.toFixed(2)}</p>
                      {order.status.toLowerCase() === "pending" && (
                        <Button
                          variant="outline"
                          size="default"
                          className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => cancelOrder(order._id)}
                          disabled={cancellingOrder === order._id}
                        >
                          <X className="h-4 w-4 mr-1 text-sm" />
                          {cancellingOrder === order._id ? "Cancelling..." : "Cancel Order"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Items Ordered</h4>
                  <div className="space-y-4">
                    {order.products.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{item.product.name}</h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
