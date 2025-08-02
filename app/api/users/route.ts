import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import { withAdminAuth } from "@/lib/middleware/auth";

export const runtime = "nodejs";

/**
 * GET /api/users
 *
 * Fetch all users. Only accessible by admin users.
 *
 * Authentication:
 * - Requires Bearer token in Authorization header
 * - Token must belong to an admin user
 *
 * Example Request:
 * GET /api/users
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
 *       "id": "user_12345",
 *       "email": "user@example.com",
 *       "name": "John Doe",
 *       "role": "user",
 *       "createdAt": "2025-07-29T10:00:00.000Z"
 *     },
 *     ...
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
 *   "error": "Failed to fetch users"
 * }
 */
export const GET = withAdminAuth(async () => {
  try {
    await dbConnect();

    // Fetch all users (excluding sensitive information)
    const users = await User.find({}).select("-password -__v").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch users",
      },
      { status: 500 }
    );
  }
});
