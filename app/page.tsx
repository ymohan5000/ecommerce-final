"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "@/components/header";
import SearchableProductGrid from "@/components/searchable-product-grid";
import { getProducts } from "@/lib/data";
import type { Product } from "@/lib/types";
import axios from "axios";//

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); ///

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await axios.get("/api/products");
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
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [products, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <main className="flex-1 container mx-auto px-4 py-12 md:px-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <main className="flex-1 container mx-auto px-4 py-12 md:px-6">
        <SearchableProductGrid products={filteredProducts} />
      </main>
      <footer className="w-full py-6 text-center text-sm text-gray-500 border-t bg-white dark:bg-gray-950">
        © {new Date().getFullYear()} EliteShop. All rights reserved.
      </footer>
    </div>
  );
}
