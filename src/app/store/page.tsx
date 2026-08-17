import Image from "next/image";
import { shopifyFetch } from "@/lib/shopify";
import { PRODUCTS_QUERY } from "@/lib/shopify-queries";
import type { Product } from "@/lib/shopify-types";
import { AddToCartButton } from "../add-to-cart-button";

export default async function StorePage() {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(
    PRODUCTS_QUERY,
    { first: 12 }
  );

  const products = data.products.nodes;

  return (
    <main className="max-w-7xl mx-auto py-20 px-6 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-playfair font-black text-slate-900">Laboratory Inventory</h1>
        <p className="text-slate-500 max-w-2xl">
          Sourcing high-precision components and certified hardware for Spokane on-site repairs and enterprise deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 mb-6">
              {product.featuredImage ? (
                <Image
                  src={product.featuredImage.url}
                  alt={product.featuredImage.altText ?? product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image Available
                </div>
              )}
            </div>

            <div className="space-y-2 mb-6">
              <h2 className="font-bold text-slate-900 line-clamp-1">{product.title}</h2>
              <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{product.description}</p>
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  ${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {product.priceRange.minVariantPrice.currencyCode}
                </span>
              </div>
            </div>

            {product.variants.nodes.length > 0 && (
              <AddToCartButton
                variantId={product.variants.nodes[0].id}
                availableForSale={product.availableForSale}
              />
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
