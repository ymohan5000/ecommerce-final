import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';

export async function GET(request: NextRequest, context: { params: { trackingNumber: string } }) {
  try {
    await dbConnect();

    const trackingNumber = context.params?.trackingNumber;

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Find order by trackingNumber and populate product details inside products array
    const order = await Order.findOne({ trackingNumber })
      .populate({ path: "products.product", select: "name image price" })
      .populate({ path: "user", select: "email", strictPopulate: false })
      .lean();

    // Defensive: If order is not found or is an array (shouldn't be), return 404
    if (!order || Array.isArray(order)) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Defensive: Ensure products is always an array
    const products = Array.isArray(order.products) ? order.products : [];

    // Return order data with default email fallback
    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        customerInfo: order.customerInfo,
        products,
        shippingInfo: order.shippingInfo ?? null,
        email: order.customerInfo?.email ?? "guest@mohan.com",
        user: order.user ?? null,
      },
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}