import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/login
 *
 * Authenticates a user and returns a JWT token.
 *
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "token": "jwt_token",
 *   "user": {
 *     "id": "user_id",
 *     "email": "user@example.com",
 *     "role": "customer"
 *   }
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Invalid credentials"
 * }
 */

export async function POST(request: Request) {
  await dbConnect();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user || user.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  return NextResponse.json({
    success: true,
    token,
    user: { id: user._id, email: user.email, role: user?.role },
  });
}
