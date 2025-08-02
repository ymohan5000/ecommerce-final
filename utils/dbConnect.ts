import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;
if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose
      .connect(MONGO_URI as string, opts)
      .then((mongoose) => {
        console.log("✅ Database connected successfully to MongoDB Atlas");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Database connection failed:", error.message);
        cached.promise = null; // Reset promise so it can be retried
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("❌ Error awaiting database connection:", error);
    cached.promise = null; // Reset promise for retry
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
