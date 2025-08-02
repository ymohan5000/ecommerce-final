import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import User from "@/models/User";

/**
 * POST /api/auth/signup
 *
 * Creates a new user.
 *
 * Request Body:
 * {
 *   "email": "newuser@example.com",
 *   "password": "password123"
 * }
 *
 * Response (201 - Created):
 * {
 *   "success": true,
 *   "user": {
 *     "id": "new_user_id",
 *     "email": "newuser@example.com",
 *     "role": "customer"
 *   }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "error": "Email and password are required"
 * }
 *
 * Response (409 - Conflict):
 * {
 *   "error": "User already exists"
 * }
 */

export async function POST(request: Request) {
  await dbConnect();
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const user = await User.create({ email, password, role: "customer" });
  return NextResponse.json(
    { success: true, user: { id: user._id, email: user.email, role: user?.role } },
    { status: 201 }
  );
}
