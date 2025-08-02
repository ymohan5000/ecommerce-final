export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: {
    stars: number;
    count: number;
  };
};

export type CartItem = Product & {
  quantity: number;
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
};

export type CheckoutSession = {
  id: string;
  url: string;
  status: string;
};

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';
