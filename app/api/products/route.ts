import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { withAdminAuth } from "@/lib/middleware/auth";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const products = await Product.find({});
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

/**
 * POST /api/products
 *
 * Creates a new product. Only accessible by admins.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header for a user with an 'admin' role.
 *
 * Request Body:
 * {
 *   "name": "Sample Product",
 *   "description": "This is a sample product.",
 *   "price": 99.99,
 *   "image": "image_url",
 *   "category": "Electronics"
 * }
 *
 * Response (201 - Created):
 * {
 *   "success": true,
 *   "data": {
 *     "_id": "product_id",
 *     "name": "Sample Product",
 *     "description": "This is a sample product.",
 *     "price": 99.99,
 *     "image": "image_url",
 *     "category": "Electronics",
 *     "userId": "authenticated_admin_user_id"
 *   }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "success": false,
 *   "error": "Failed to create product"
 * }
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
 */
export const POST = withAdminAuth(async (request) => {
  await dbConnect();
  const body = await request.json();
  const userId = request.user.id; // Get userId from middleware

  try {
    // Add userId to the product data
    const productData = { ...body, userId };
    console.log(productData);
    const product = await Product.create(productData);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 400 }
    );
  }
});
