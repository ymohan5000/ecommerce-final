import mongoose, { Document, Schema } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  userId: mongoose.Schema.Types.ObjectId;
}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Product || mongoose.model<ProductDocument>("Product", productSchema);
