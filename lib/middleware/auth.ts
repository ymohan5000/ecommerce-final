import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnect";

/**
 * Authenticate a request using JWT
 * @param {Request} request - The Next.js request object
 * @returns {Object} Auth result with user or error
 */
export async function auth(request: Request) {
  console.log("Auth middleware running");

  try {
    await dbConnect();
    // Get token from header
    const token =
      request.headers.get("x-auth-token") ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return {
        error: true,
        status: 401,
        message: "Access denied. No token provided.",
      };
    }

    // Token validation
    if (token.includes(".") && token.split(".").length >= 3) {
      try {
        // Standard JWT handling
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;

        // Check token expiration
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
          throw new Error("Token expired");
        }

        // Find and associate user from database
        try {
          const user = await User.findOne({
            $or: [{ _id: decoded.user?.id || decoded.id }],
          });

          if (user) {
            return {
              error: false,
              user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
              },
            };
          } else {
            console.log("User not found in database:", decoded.user?.id || decoded.id);
            return {
              error: true,
              status: 401,
              message: "User not found.",
            };
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          return {
            error: true,
            status: 500,
            message: "Database error.",
          };
        }
      } catch (jwtError: any) {
        console.error("JWT verification failed:", jwtError.message);

        if (jwtError.message === "Token expired") {
          return {
            error: true,
            status: 401,
            message: "Token expired. Please log in again.",
          };
        }

        return {
          error: true,
          status: 401,
          message: "Invalid token.",
        };
      }
    } else {
      return {
        error: true,
        status: 401,
        message: "Invalid token format.",
      };
    }
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return {
      error: true,
      status: 401,
      message: "Invalid token. Please log in again.",
    };
  }
}

/**
 * Middleware adapter for Next.js API routes
 * @param {Function} handler - The route handler function
 * @returns {Function} Next.js API route handler with auth
 */
export function withAuth(
  handler: (request: Request & { user?: any }, context?: any) => Promise<Response>
) {
  return async (request: Request, context?: any) => {
    const authResult = await auth(request);

    if (authResult.error) {
      return NextResponse.json({ error: authResult.message }, { status: authResult.status });
    }

    // Create a new request object with the user added
    // @ts-ignore
    request.user = authResult.user;

    // Call the handler with the modified request
    return handler(request, context);
  };
}

/**
 * Middleware adapter for Next.js API routes that require admin privileges
 * @param {Function} handler - The route handler function
 * @returns {Function} Next.js API route handler with admin auth
 */
export function withAdminAuth(
  handler: (request: Request & { user?: any }, context?: any) => Promise<Response>
) {
  return withAuth(async (request, context) => {
    if (request.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You do not have admin privileges." },
        { status: 403 }
      );
    }
    return handler(request, context);
  });
}

export default withAuth;
