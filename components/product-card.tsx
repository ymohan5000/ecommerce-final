"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { StarIcon, ShoppingCartIcon } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="p-0 relative">
        <Image
          src={(product.image || "/placeholder.svg").trimEnd()}
          alt={product.name}
          width={400}
          height={300}
          className="w-full aspect-[4/3] object-contain rounded-t-lg group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3  text-xs font-semibold px-3 py-1 rounded-full shadow-sm bg-orange-400 text-gray-100">
          {product.category}
        </div>
        {/* Optional cart icon button on image, like for the Smart Watch */}
        {
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 rounded-full w-9 h-9 bg-yellow-400 hover:bg-yellow-500 text-black"
            onClick={() => addToCart(product)}
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span className="sr-only">Add to cart</span>
          </Button>
        }
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-50">
          {product.name}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`w-4 h-4 ${i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-2">({5})</span>
        </div>
        <div className="text-xl font-bold text-green-600 dark:text-green-400">
          ${product.price.toFixed(2)}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end">
        <Button
          className="bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-900"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
