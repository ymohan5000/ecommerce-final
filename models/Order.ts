import mongoose, { Schema, model, models } from 'mongoose';

const ShippingInfoSchema = new Schema({
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
});

const OrderSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  phoneNo: { type: String },
  address: { type: String },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },
  shippingInfo: { type: ShippingInfoSchema, required: false },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'completed'],
    default: 'pending',
  },
  trackingNumber: { type: String, unique: true },
  orderNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = models.Order || model('Order', OrderSchema);
export default Order;
