"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart-context";
import { MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { StripePayment } from "@/components/stripe-payment";

export default function CartDrawer() {
  const { cartItems, getTotalItems, getTotalPrice, updateQuantity, removeFromCart, clearCart } =
    useCart();
  const router = useRouter();
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState("");
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  const handlePlaceOrder = async () => {
    const token = getToken();

    if (!phoneNo || !address || !token) {
      toast.error("Please provide your phone number and address.");
      return;
    }

    try {
      const res = await axios.post(
        "/api/orders/user",
        {
          cartItems,
          totalPrice: getTotalPrice(),
          phoneNo,
          address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Order Placed Successfully!");
        clearCart();
        setCheckoutOpen(false);

        // setPhoneNo("");
        // setAddress("");
      } else {
        toast.error(res.data.error || "There was an issue placing your order. Please try again.");
      }
    } catch (error: any) {
      console.error("Order placement error:", error);
      toast.error(
        error.response?.data?.error ||
          "Could not place your order. Please check your connection and try again."
      );
    }
  };

  const handleProceedToCheckout = () => {
    const token = getToken();

    if (!token) {
      toast.error("Please login or sign up to proceed to checkout.");
      router.push("/login");
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (orderData: any) => {
    setShowPayment(false);
    toast.success(`Payment successful! Order #${orderData.orderNumber} has been placed.`);
    router.push(`/order-tracking/${orderData.trackingNumber}`);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative hover:bg-gray-100 p-2 rounded-sm cursor-pointer flex gap-2 items-center font-medium text-sm  ">
          <ShoppingCartIcon className="h-6 w-6 " />
          My Cart
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {getTotalItems()}
            </span>
          )}
          <span className="sr-only">View cart</span>
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col ">
        <SheetHeader>
          <SheetTitle>Your Cart ({getTotalItems()})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center text-muted-foreground ">
            <ShoppingCartIcon className="w-12 h-12 mb-4" />
            <p>Your cart is empty.</p>
            <Link href="/" passHref>
              <Button variant="link" className="mt-2">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="flex-grow w-[102%]">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-4 border bg-gray-50 border-b p-2 shadow-sm rounded-md "
                >
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div className="grid flex-grow gap-2">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    <p className="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      >
                        <MinusIcon className="h-4 w-4" />
                        <span className="sr-only">Decrease quantity</span>
                      </Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span className="sr-only">Increase quantity</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator className="mt-auto " />
        <SheetFooter className="mt-4">
          <div className="flex  items-center w-full mb-4 gap-1">
            <span className="text-lg font-semibold">Total: {`  `} </span>
            <span className="text-lg font-bold">${getTotalPrice().toFixed(2)}</span>
          </div>
          <Button
            onClick={handleProceedToCheckout}
            className="w-full"
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </Button>
          <Dialog open={showPayment} onOpenChange={setShowPayment}>
            <DialogContent className="bg-white dark:bg-gray-900 max-w-md">
              <DialogHeader>
                <DialogTitle>Secure Payment</DialogTitle>
              </DialogHeader>
              <StripePayment
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </DialogContent>
          </Dialog>
          {/* {cartItems.length > 0 && (
            <Button variant="ghost" onClick={clearCart} className="w-full mt-2">
              Clear Cart
            </Button>
          )} */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
