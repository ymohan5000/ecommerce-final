import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import { withAuth } from "@/lib/middleware/auth";

/**
 * PUT /api/products/{productId}
 *
 * Updates a product by its ID.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header.
 *   The user must be the owner of the product.
 *
 * URL Parameters:
 *   - productId: The ID of the product to update.
 *
 * Request Body:
 * {
 *   "name": "Updated Product Name",
 *   "description": "Updated product description",
 *   "price": 99.99,
 *   "category": "Updated Category",
 *   "image": "https://example.com/updated-image.jpg",
 *   "stock": 50
 * }
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "message": "Product updated successfully",
 *   "product": { ... }
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "error": "Product ID is required" | "Invalid product data"
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Access denied. No token provided."
 * }
 *
 * Response (404 - Not Found):
 * {
 *   "error": "Product not found or you do not have permission to update it"
 * }
 *
 * Response (500 - Server Error):
 * {
 *   "error": "Failed to update product"
 * }
 */

export const PUT = withAuth(async (request, { params }) => {
  const { productId } = params;
  const userId = request.user.id;

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const body = await request.json();
    const { name, description, price, category, image } = body;

    // Validate required fields
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: "Name, description, price, and category are required" },
        { status: 400 }
      );
    }

    // Validate price is a number
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    // Find the product and ensure the user owns it
    const product = await Product.findOne({ _id: productId, userId });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you do not have permission to update it" },
        { status: 404 }
      );
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price: Number(price),
        category,
        image: image || product.image, // Keep existing image if not provided
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
});

/**
 * DELETE /api/products/{productId}
 *
 * Deletes a product by its ID.
 *
 * Authentication:
 *   Requires a valid Bearer token in the Authorization header.
 *   The user must be the owner of the product.
 *
 * URL Parameters:
 *   - productId: The ID of the product to delete.
 *
 * Response (200 - Success):
 * {
 *   "success": true,
 *   "message": "Product deleted successfully"
 * }
 *
 * Response (400 - Bad Request):
 * {
 *   "error": "Product ID is required"
 * }
 *
 * Response (401 - Unauthorized):
 * {
 *   "error": "Access denied. No token provided."
 * }
 *
 * Response (404 - Not Found):
 * {
 *   "error": "Product not found or you do not have permission to delete it"
 * }
 *
 * Response (500 - Server Error):
 * {
 *   "error": "Failed to delete product"
 * }
 */

export const DELETE = withAuth(async (request, { params }) => {
  const { productId } = params;
  const userId = request.user.id;

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const product = await Product.findOne({ _id: productId, userId });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    await Product.deleteOne({ _id: productId });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
});
