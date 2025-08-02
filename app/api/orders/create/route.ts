import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';

interface Item {
  _id: string;
  quantity: number;
  price: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { items, totalAmount, customerInfo, paymentStatus } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided' },
        { status: 400 }
      );
    }

    // Validate customer info
    if (!customerInfo?.name || !customerInfo?.email) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Generate tracking and order number
    const timestamp = Date.now().toString().slice(-8);
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const trackingNumber = `TRK${timestamp}${randomPart}`;
    const orderNumber = `ORD${timestamp}`;

    // Prepare address string safely
    const addressParts = [
      customerInfo.address || '',
      customerInfo.city || '',
      customerInfo.state || '',
      customerInfo.zipCode || '',
    ].filter(Boolean).join(', ');

    const order = await Order.create({
      products: items.map((item: Item) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: totalAmount,
      status: 'pending',
      phoneNo: customerInfo.phone || '',
      address: addressParts,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone || '',
        address: customerInfo.address || '',
        city: customerInfo.city || '',
        state: customerInfo.state || '',
        zipCode: customerInfo.zipCode || '',
      },
      paymentStatus: paymentStatus || 'pending',
      trackingNumber,
      orderNumber,
      createdAt: new Date(),
    });

    console.log(`Order created: ${order._id} (${orderNumber})`);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      trackingNumber,
      orderNumber,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
