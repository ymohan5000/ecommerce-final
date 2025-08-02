# Stripe Payment Gateway Setup

This guide will help you set up Stripe payment gateway in your ecommerce website.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Your Stripe API keys

## Environment Variables

Create a `.env.local` file in your project root and add the following variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001
```

## Getting Your Stripe Keys

1. **Publishable Key**: Go to your Stripe Dashboard → Developers → API keys
2. **Secret Key**: Use the test secret key for development
3. **Webhook Secret**: Create a webhook endpoint in your Stripe Dashboard

## Setting Up Webhooks

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/payment/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the webhook signing secret to your `.env.local` file

## Features Implemented

### 1. Payment Intent API (`/api/payment/create-payment-intent`)
- Creates payment intents for secure card payments
- Handles amount validation and currency conversion

### 2. Checkout Session API (`/api/payment/create-checkout-session`)
- Creates Stripe Checkout sessions for redirect-based payments
- Supports multiple payment methods

### 3. Webhook Handler (`/api/payment/webhook`)
- Processes Stripe events securely
- Handles payment success/failure events
- Updates order status automatically

### 4. Stripe Checkout Component (`components/stripe-checkout.tsx`)
- Modern, responsive payment form
- Real-time validation and error handling
- Loading states and success feedback

### 5. Checkout Page (`/checkout`)
- Complete checkout experience
- Order summary with cart items
- Integrated payment form
- Tax and shipping calculations

### 6. Success Page (`/payment/success`)
- Confirmation page after successful payment
- Order tracking information
- Navigation to continue shopping

## Usage

1. **Add items to cart** from your product pages
2. **Click "Proceed to Checkout"** in the cart drawer
3. **Fill in payment details** using the secure Stripe form
4. **Complete payment** and get redirected to success page

## Testing

Use Stripe's test card numbers for testing:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## Security Features

- ✅ Secure payment processing with Stripe Elements
- ✅ Webhook signature verification
- ✅ Server-side payment intent creation
- ✅ Client-side payment confirmation
- ✅ Error handling and validation
- ✅ PCI compliance through Stripe

## Customization

You can customize the payment form appearance by modifying the `appearance` object in `components/stripe-checkout.tsx`:

```typescript
appearance: {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0f172a',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
  },
}
```

## Support

For issues with Stripe integration, check:
1. Stripe Dashboard for payment status
2. Browser console for client-side errors
3. Server logs for API errors
4. Webhook delivery status in Stripe Dashboard 