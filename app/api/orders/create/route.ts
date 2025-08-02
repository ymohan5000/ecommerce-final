import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/dbConnect';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { items, totalAmount, customerInfo, paymentStatus } = body;

    // Provide default for items if missing or invalid
    let safeItems = items;
    if (!safeItems || !Array.isArray(safeItems) || safeItems.length === 0) {
      safeItems = [{ _id: null, quantity: 1, price: 0 }];
    }

    // Provide default for customerInfo if missing
    const safeCustomerInfo = {
      name: customerInfo?.name || 'Guest',
      email: customerInfo?.email || 'guest@example.com',
      phone: customerInfo?.phone || '',
      address: customerInfo?.address || '',
      city: customerInfo?.city || '',
      state: customerInfo?.state || '',
      zipCode: customerInfo?.zipCode || '',
      country: customerInfo?.country || '',
    };

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

    // Use customerInfo for all fields if present
    // Provide default user (guest user ObjectId or fallback string) if missing
    const userId = customerInfo?.userId || body.userId || '000000000000000000000000';
    // Provide default country if missing
    const shippingInfo = {
      country: safeCustomerInfo.country || 'Unknown',
      postalCode: safeCustomerInfo.zipCode,
      city: safeCustomerInfo.city,
      address: safeCustomerInfo.address,
    };

    const order = await Order.create({
      user: userId,
      products: safeItems.map((item: any) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: totalAmount || 0,
      status: 'pending',
      phoneNo: safeCustomerInfo.phone,
      address: [safeCustomerInfo.address, safeCustomerInfo.city, safeCustomerInfo.state, safeCustomerInfo.zipCode].filter(Boolean).join(', '),
      customerInfo: {
        name: safeCustomerInfo.name,
        email: safeCustomerInfo.email,
        phone: safeCustomerInfo.phone,
        address: safeCustomerInfo.address,
        city: safeCustomerInfo.city,
        state: safeCustomerInfo.state,
        zipCode: safeCustomerInfo.zipCode,
      },
      shippingInfo,
      paymentStatus: paymentStatus || 'pending',
      trackingNumber,
      orderNumber,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      trackingNumber,
      orderNumber,
      message: 'Order created successfully',
    });
  } catch (error: any) {
    // Log the request body and detailed error for debugging
    console.error('Order creation error:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        console.error(`Validation error for ${key}:`, error.errors[key].message);
      });
    }
    try {
      const body = await request.json();
      console.error('Request body:', body);
    } catch (e) {
      // Ignore if body can't be read again
    }
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      // Return all validation errors for easier debugging
      const errors = error.errors ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, (v as any).message])) : undefined;
      return NextResponse.json(
        { success: false, error: error.message || 'Validation failed', errors },
        { status: 400 }
      );
    }
    // Other errors
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}