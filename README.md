# Installing pnpm using npm

pnpm is a fast, disk space-efficient package manager. You can install it using npm on various operating systems. Follow the instructions below for your platform.

## Prerequisites

- Ensure you have Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

## Installation Steps

### macOS and Linux

1. Open your terminal.
2. Run the following command to install pnpm globally:
   ```bash
   npm install -g pnpm
   ```
3. Verify the installation by checking the pnpm version:
   ```bash
   pnpm --version
   ```

### Windows

1. Open Command Prompt or PowerShell.
2. Run the following command to install pnpm globally:
   ```cmd
   npm install -g pnpm
   ```
3. Verify the installation by checking the pnpm version:
   ```cmd
   pnpm --version
   ```

## Additional Notes

- If you encounter permission issues during installation, you may need to use `sudo` on macOS/Linux:
  ```bash
  sudo npm install -g pnpm
  ```
- On Windows, ensure you run the terminal as an administrator if you face permission issues.

For more details, visit the [pnpm documentation](https://pnpm.io/).

# Project Requirements

This project has specific requirements for Node.js, React, and Next.js versions. Ensure your environment meets these requirements before proceeding.

## Required Versions

- **Node.js**: `^18.0.0`
- **React**: `^19.0.0`
- **Next.js**: `^15.2.4`

## Checking Your Environment

To check your current Node.js version, run:

```bash
node --version
```

To check your npm version, run:

```bash
npm --version
```

If you need to update Node.js, visit the [Node.js official website](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm).

For React and Next.js, ensure the versions in your `package.json` match the required versions listed above.

# E-Commerce API Documentation

This section documents all the available API endpoints in the e-commerce application.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token passed in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Middleware
This application uses a custom JWT authentication middleware system located in `/lib/middleware/auth.ts` that provides:

#### JWT Token Verification
- Validates JWT tokens from `Authorization: Bearer <token>` or `x-auth-token` headers
- Verifies token signature using `JWT_SECRET` environment variable
- Checks token expiration automatically
- Looks up user in database to ensure user still exists

#### Role-Based Authorization
The middleware provides different levels of access:

- **`withAuth`** - Basic authentication required
  - Verifies JWT token
  - Attaches user object to request
  - Used for user-specific endpoints

- **`withAdminAuth`** - Admin-only access
  - Extends `withAuth` functionality
  - Checks if user role is "admin"
  - Returns 403 Forbidden for non-admin users
  - Used for administrative endpoints

#### User Object Structure
After successful authentication, the user object is attached to the request:
```typescript
{
  id: string,        // User's database ID
  email: string,     // User's email address
  name: string,      // User's display name
  role: string       // User's role (user/admin)
}
```

#### Error Handling
The middleware handles various authentication scenarios:
- **401 Unauthorized**: Missing token, invalid token, expired token, user not found
- **403 Forbidden**: Valid user but insufficient privileges (admin-only endpoints)
- **500 Internal Server Error**: Database connection issues

## Quick Reference - All API Endpoints

### Authentication

| Method | Endpoint                                      | Description       | Auth Required |
| ------ | --------------------------------------------- | ----------------- | ------------- |
| POST   | [`/api/auth/login`](#post-apiauthlogin)       | User login        | No            |
| POST   | [`/api/auth/register`](#post-apiauthregister) | User registration | No            |

### Users

| Method | Endpoint                      | Description   | Auth Required |
| ------ | ----------------------------- | ------------- | ------------- |
| GET    | [`/api/users`](#get-apiusers) | Get all users | Admin only    |

### Products

| Method | Endpoint                                                    | Description         | Auth Required |
| ------ | ----------------------------------------------------------- | ------------------- | ------------- |
| GET    | [`/api/products`](#get-apiproducts)                         | Get all products    | No            |
| POST   | [`/api/products`](#post-apiproducts)                        | Create new product  | Yes           |
| PUT    | [`/api/products/[productId]`](#put-apiproductsproductid)    | Update product      | Yes (Admin)   |
| DELETE | [`/api/products/[productId]`](#delete-apiproductsproductid) | Delete product      | Yes (Admin)   |
| GET    | [`/api/my-products`](#get-apimy-products)                   | Get user's products | Yes           |

### Orders

| Method | Endpoint                                                          | Description             | Auth Required |
| ------ | ----------------------------------------------------------------- | ----------------------- | ------------- |
| GET    | [`/api/orders`](#get-apiorders)                                   | Get all orders          | Admin / User  |
| POST   | [`/api/orders`](#post-apiorders)                                  | Create new order        | Yes           |
| GET    | [`/api/orders/user`](#get-apiordersuser)                          | Get user's orders       | Yes           |
| PATCH  | [`/api/orders/[orderId]/deliver`](#patch-apiordersorderiddeliver) | Mark order as delivered | Admin only    |

---

## API Endpoints

### Authentication

#### POST /api/auth/login

**Description:** Authenticate user and return JWT token

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response (200 - Success):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Response (401 - Invalid Credentials):**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### POST /api/auth/register

**Description:** Register a new user account

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response (201 - Success):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

**Response (400 - Validation Error):**

```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### Users

#### GET /api/users

**Description:** Fetch all users (Admin only)

**Authentication:** Required (Admin role)

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200 - Success):**

```json
{
  "success": true,
  "data": [
    {
      "id": "user_12345",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "createdAt": "2025-07-29T10:00:00.000Z"
    }
  ]
}
```

**Response (403 - Forbidden):**

```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

### Products

#### GET /api/products

**Description:** Get all products with optional filtering

**Query Parameters:**

- `category` (optional): Filter by product category
- `search` (optional): Search products by name or description

**Example Request:**

```
GET /api/products?category=electronics&search=phone
```

**Response (200 - Success):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "product_12345",
      "name": "iPhone 14",
      "description": "Latest iPhone model",
      "price": 999.99,
      "image": "https://example.com/iphone14.jpg",
      "category": "electronics",
      "createdAt": "2025-07-29T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/products

**Description:** Create a new product (Authenticated users only)

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "iPhone 14",
  "description": "Latest iPhone model",
  "price": 999.99,
  "image": "https://example.com/iphone14.jpg",
  "category": "electronics"
}
```

**Response (201 - Success):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "product_12345",
    "name": "iPhone 14",
    "description": "Latest iPhone model",
    "price": 999.99,
    "image": "https://example.com/iphone14.jpg",
    "category": "electronics",
    "userId": "user_12345",
    "createdAt": "2025-07-29T10:00:00.000Z"
  }
}
```

#### PUT /api/products/[productId]

**Description:** Update an existing product (Owner only)

**Authentication:** Required (Product owner)

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "iPhone 14 Pro",
  "description": "Updated iPhone model",
  "price": 1099.99,
  "image": "https://example.com/iphone14pro.jpg",
  "category": "electronics"
}
```

**Response (200 - Success):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "product_12345",
    "name": "iPhone 14 Pro",
    "description": "Updated iPhone model",
    "price": 1099.99,
    "image": "https://example.com/iphone14pro.jpg",
    "category": "electronics",
    "updatedAt": "2025-07-29T11:00:00.000Z"
  }
}
```

#### DELETE /api/products/[productId]

**Description:** Delete a product (Owner only)

**Authentication:** Required (Product owner)

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response (200 - Success):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### GET /api/my-products

**Description:** Get products created by the authenticated user

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response (200 - Success):**

```json
[
  {
    "_id": "product_12345",
    "name": "iPhone 14",
    "description": "Latest iPhone model",
    "price": 999.99,
    "image": "https://example.com/iphone14.jpg",
    "category": "electronics",
    "createdAt": "2025-07-29T10:00:00.000Z"
  }
]
```

---

### Orders

#### GET /api/orders

**Description:** Get all orders (Admin only) or user's orders with optional status filtering

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `status` (optional): Filter by order status (pending, delivered, cancelled)

**Example Request:**

```
GET /api/orders?status=pending
```

**Response (200 - Success):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "order_12345",
      "user": {
        "_id": "user_12345",
        "email": "user@example.com"
      },
      "products": [
        {
          "product": {
            "_id": "product_12345",
            "name": "iPhone 14",
            "image": "https://example.com/iphone14.jpg",
            "price": 999.99
          },
          "quantity": 1,
          "price": 999.99
        }
      ],
      "totalPrice": 999.99,
      "status": "pending",
      "address": "123 Main St, City, State",
      "phoneNo": 1234567890,
      "createdAt": "2025-07-29T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/orders

**Description:** Create a new order

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "products": [
    {
      "productId": "product_12345",
      "quantity": 1
    }
  ],
  "address": "123 Main St, City, State",
  "phoneNo": 1234567890
}
```

**Response (201 - Success):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "order_12345",
    "user": "user_12345",
    "products": [
      {
        "product": "product_12345",
        "quantity": 1,
        "price": 999.99
      }
    ],
    "totalPrice": 999.99,
    "status": "pending",
    "address": "123 Main St, City, State",
    "phoneNo": 1234567890,
    "createdAt": "2025-07-29T10:00:00.000Z"
  }
}
```

#### GET /api/orders/user

**Description:** Get orders for the authenticated user

**Authentication:** Required

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response (200 - Success):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "order_12345",
      "products": [
        {
          "product": {
            "_id": "product_12345",
            "name": "iPhone 14",
            "image": "https://example.com/iphone14.jpg",
            "price": 999.99
          },
          "quantity": 1,
          "price": 999.99
        }
      ],
      "totalPrice": 999.99,
      "status": "pending",
      "address": "123 Main St, City, State",
      "phoneNo": 1234567890,
      "createdAt": "2025-07-29T10:00:00.000Z"
    }
  ]
}
```

#### PATCH /api/orders/[orderId]/deliver

**Description:** Mark an order as delivered (Admin only)

**Authentication:** Required (Admin role)

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response (200 - Success):**

```json
{
  "success": true,
  "message": "Order marked as delivered",
  "order": {
    "id": "order_12345",
    "status": "delivered",
    "updatedAt": "2025-07-29T11:00:00.000Z"
  }
}
```

**Response (400 - Bad Request):**

```json
{
  "success": false,
  "error": "Cannot mark order as delivered. Order status is cancelled."
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are subject to rate limiting. If you exceed the limit, you'll receive a `429 Too Many Requests` response.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for web applications running on different domains.
