"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/my-products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      // Check if data is an array, if not set empty array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        setError("Invalid data format received from server");
      }
    } catch (error: any) {
      console.error("Error fetching products:", error);
      setError(error.response?.data?.error || error.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    toast("Are you sure you want to delete this product?", {
      description: "This action cannot be undone.",
      action: {
        label: <p className="bg-red-500 text-white px-2 text- py-1 rounded-sm">Delete</p>,
        onClick: () => confirmDelete(productId),
      },
      cancel: {
        label: <p className="bg-gray-500 text-white px-2 text py-1 rounded-sm">Cancel</p>,
        onClick: () => {},
      },
    });
  };

  const confirmDelete = async (productId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh the product list by filtering out the deleted product
      setProducts(products.filter((p) => p._id !== productId));
      toast.success("Product deleted successfully!");
    } catch (err: any) {
      console.error("Failed to delete product", err);
      const errorMessage = err.response?.data?.error || "Failed to delete product.";
      // setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setEditLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `/api/products/${editingProduct._id}`,
        {
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          category: editForm.category,
          image: editForm.image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the product in the list
      setProducts(products.map((p) => (p._id === editingProduct._id ? response.data.product : p)));

      setIsEditModalOpen(false);
      setEditingProduct(null);
      setError(null);
      toast.success("Product updated successfully!");
    } catch (err: any) {
      console.error("Failed to update product", err);
      const errorMessage = err.response?.data?.error || "Failed to update product.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditForm({
      name: "",
      description: "",
      price: "",
      category: "",
      image: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <ShoppingBag className="mr-2 h-6 w-6" />
                Products Management
              </h1>
            </div>
            <div className="flex items-center">
              <Link
                href="/dashboard/add-product"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading products</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      className="w-full h-48 object-contain"
                      src={product.image}
                      alt={product.name}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">${product.price}</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              <Link
                href="/dashboard/add-product"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="edit-price"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    step="0.01"
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    id="edit-category"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-image" className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    id="edit-image"
                    value={editForm.image}
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? "Updating..." : "Update Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
