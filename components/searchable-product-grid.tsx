"use client"

import ProductGrid from "./product-grid"
import type { Product } from "@/lib/types"

export default function SearchableProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="w-full">
      {products.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg">No products found matching your search.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  )
}
