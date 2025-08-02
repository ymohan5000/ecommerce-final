import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { withAdminAuth } from "@/lib/middleware/auth";

export const runtime = "nodejs";

/**
 * GET /api/orders
 *
 * Retrieves all orders with optional status filtering.
 * Only accessible by admin users.
 *
 * Authentication:
 * - Requires Bearer token in Authorization header
 * - Token must belong to an admin user
 *
 * Query Parameters:
 * ?status=<status> - Filter orders by status
 * Valid status values: 'pending', 'delivered', 'cancelled'
 *
 * Example Request:
 * GET /api/orders?status=pending
 * Headers:
 * {
 *   "Authorization": "Bearer <admin_token>"
 * }
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "_id": "order_id",
 *       "user": {
 *         "_id": "user_id",
 *         "email": "user@example.com"
 *       },
 *       "products": [
 *         {
 *           "product": {
 *             "name": "Product Name",
 *             "image": "product_image_url",
 *             "price": 99.99
 *           },
 *           "quantity": 2,
 *           "price": 199.98
 *         }
 *       ],
 *       "totalPrice": 199.98,
 *       "status": "pending",
 *       "createdAt": "2025-07-29T10:00:00.000Z",
 *       "address": "123 Main St",
 *       "phoneNo": 1234567890
 *     }
 *   ]
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
 * Response (500 - Server Error):
 * {
 *   "success": false,
 *   "error": "Failed to fetch orders"
 * }
 */
export const GET = withAdminAuth(async (request: Request) => {
  try {
    // Connect to the database
    await dbConnect();

    // Parse query parameters for status filter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build filter object
    const filter: any = {};
    if (status && ["pending", "delivered", "cancelled"].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    // Initialize required models
    require("@/models/Product");
    require("@/models/User");
    require("@/models/Order");

    // Fetch orders with populated user and product details
    const orders = await Order.find(filter)
      .populate({ path: "user", select: "email", strictPopulate: false })
      .populate("products.product", "name image price")
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
});
