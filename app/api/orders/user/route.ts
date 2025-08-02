import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import { withAuth } from "@/lib/middleware/auth";

/**
 * POST /api/orders/user
 *
 * Creates a new order.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header.
 *
 * Request Body:
 * {
 *   "cartItems": [
 *     { "product": "product_id", "quantity": 1, "price": 99.99 }
 *   ],
 *   "totalPrice": 99.99,
 *   "phoneNo": "1234567890",
 *   "address": "123 Main St, Anytown, USA"
 * }
 *
 * Response (201 - Created):
 * {
 *   "success": true,
 *   "message": "Order placed successfully",
 *   "order": { ...order_details }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "error": "Failed to create order"
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Access denied. No token provided."
 * }
 */
export const POST = withAuth(async (request) => {
  const userId = request.user?.id;
  const { cartItems, totalPrice, phoneNo, address } = await request.json();

  if (!cartItems || cartItems.length === 0 || !totalPrice || !phoneNo || !address) {
    return NextResponse.json({ error: "Missing required order information" }, { status: 400 });
  }

  try {
    await dbConnect();

    const newOrder = new Order({
      user: userId,
      products: cartItems.map((item: any) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice,
      phoneNo,
      address,
    });

    const savedOrder = await newOrder.save();

    return NextResponse.json(
      { success: true, message: "Order placed successfully", order: savedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
});

/**
 * GET /api/orders/user
 *
 * Retrieves orders placed by the authenticated user.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header.
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "orders": [
 *     {
 *       "_id": "order_id",
 *       "products": [
 *         {
 *           "product": { "_id": "product_id", "name": "Product Name", "image": "image_url", "price": 99.99 },
 *           "quantity": 1,
 *           "price": 99.99
 *         }
 *       ],
 *       "totalPrice": 99.99,
 *       "status": "pending",
 *       "createdAt": "2024-01-01T00:00:00.000Z",
 *       "phoneNo": "1234567890",
 *       "address": "123 Main St, Anytown, USA"
 *     }
 *   ]
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Access denied. No token provided."
 * }
 *
 * Response (500 - Server Error):
 * {
 *   "error": "Failed to fetch orders"
 * }
 */
export const GET = withAuth(async (request) => {
  const userId = request.user?.id;

  try {
    await dbConnect();

    const orders = await Order.find({ user: userId })
      .populate({
        path: "products.product",
        select: "name image price",
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
});
