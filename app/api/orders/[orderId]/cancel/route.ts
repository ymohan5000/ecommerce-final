import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import { withAuth } from "@/lib/middleware/auth";

/**
 * PATCH /api/orders/[orderId]/cancel
 *
 * Cancel a pending order. Users can only cancel their own orders,
 * and only orders with "pending" status can be cancelled.
 *
 * Authentication:
 * - Requires Bearer token in Authorization header
 *
 * URL Parameters:
 * - orderId: The ID of the order to cancel
 *
 * Example Request:
 * PATCH /api/orders/order_12345/cancel
 * Headers:
 * {
 *   "Authorization": "Bearer <user_token>"
 * }
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "message": "Order cancelled successfully",
 *   "order": {
 *     "id": "order_12345",
 *     "status": "cancelled",
 *     "updatedAt": "2025-07-29T10:00:00.000Z"
 *   }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "success": false,
 *   "error": "Cannot cancel order with status: delivered. Only pending orders can be cancelled."
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "success": false,
 *   "error": "Authentication token is missing or invalid"
 * }
 *
 * Response (403 - Forbidden):
 * {
 *   "success": false,
 *   "error": "You can only cancel your own orders"
 * }
 *
 * Response (404 - Not Found):
 * {
 *   "success": false,
 *   "error": "Order not found"
 * }
 *
 * Response (500 - Server Error):
 * {
 *   "success": false,
 *   "error": "Failed to cancel order"
 * }
 */
export const PATCH = withAuth(async (req: Request & { user?: any }, context?: any) => {
  try {
    await dbConnect();

    const { params } = context;
    const { orderId } = params;
    const user = req.user;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user
    if (order.user.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if the order can be cancelled (only pending orders can be cancelled)
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`,
        },
        { status: 400 }
      );
    }

    // Update the order status to cancelled
    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ success: false, error: "Failed to cancel order" }, { status: 500 });
  }
});

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await dbConnect();
    const { orderId } = params;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (order.status === "cancelled") {
      return NextResponse.json({ success: false, error: "Order already cancelled" }, { status: 400 });
    }
    if (order.status === "delivered") {
      return NextResponse.json({ success: false, error: "Delivered orders cannot be cancelled" }, { status: 400 });
    }

    order.status = "cancelled";
    await order.save();

    return NextResponse.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ success: false, error: "Failed to cancel order" }, { status: 500 });
  }
}
