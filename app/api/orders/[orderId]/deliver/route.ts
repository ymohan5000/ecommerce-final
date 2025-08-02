import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import { withAdminAuth } from "@/lib/middleware/auth";

export const runtime = "nodejs";

/**
 * PATCH /api/orders/[orderId]/deliver
 *
 * Mark an order as delivered. Only accessible by admin users.
 * Only pending orders can be marked as delivered.
 *
 * Authentication:
 * - Requires Bearer token in Authorization header
 * - Token must belong to an admin user
 *
 * URL Parameters:
 * - orderId: The ID of the order to mark as delivered
 *
 * Example Request:
 * PATCH /api/orders/order_12345/deliver
 * Headers:
 * {
 *   "Authorization": "Bearer <admin_token>"
 * }
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "message": "Order marked as delivered",
 *   "order": {
 *     "id": "order_12345",
 *     "status": "delivered",
 *     "updatedAt": "2025-07-29T10:00:00.000Z"
 *   }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "success": false,
 *   "error": "Cannot mark order as delivered. Order status is cancelled."
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
 *   "error": "Admin access required"
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
 *   "error": "Failed to update order"
 * }
 */
export const PATCH = withAdminAuth(async (request: Request, context: any) => {
  try {
    await dbConnect();

    const { params } = context;
    const { orderId } = params;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Check if the order can be marked as delivered (only pending orders can be delivered)
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot mark order as delivered. Order status is ${order.status}.`,
        },
        { status: 400 }
      );
    }

    // Update the order status to delivered
    order.status = "delivered";
    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order marked as delivered",
      order: {
        id: order._id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Order delivery update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update order",
      },
      { status: 500 }
    );
  }
});
