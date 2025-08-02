"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/products",
        {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          image: form.image,
          category: form.category,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Product added successfully!");
        router.push("/dashboard/products");
      } else {
        toast.error(res.data.error || "Failed to add product.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add product.");
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Add Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
            required
            type="number"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            required
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </main>
  );
}
