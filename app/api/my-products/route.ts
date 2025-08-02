import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { withAdminAuth } from "@/lib/middleware/auth";

/**
 * GET /api/my-products
 *
 * Retrieves products created by the authenticated admin user.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header for a user with an 'admin' role.
 *
 * Response (200 - Success):
 * [
 *   {
 *     "_id": "product_id",
 *     "name": "Sample Product",
 *     "description": "This is a sample product.",
 *     "price": 99.99,
 *     "image": "image_url",
 *     "category": "Electronics",
 *     "userId": "authenticated_admin_user_id"
 *   }
 * ]
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Access denied. No token provided."
 * }
 *
 * Response (403 - Forbidden):
 * {
 *   "error": "Forbidden: You do not have admin privileges."
 * }
 *
 * Response (500 - Server Error):
 * {
 *   "error": "Failed to fetch products"
 * }
 */
export const GET = withAdminAuth(async (request) => {
  const userId = request.user?.id;
  try {
    await dbConnect();
    // Get products created by the authenticated user

    const products = await Product.find({ userId: userId });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
});
