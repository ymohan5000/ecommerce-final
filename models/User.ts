import mongoose, { Document, Schema } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: "customer" | "admin";
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
});

export default mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
