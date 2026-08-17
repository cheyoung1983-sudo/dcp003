import Image from "next/image";
import { getProduct } from "@/lib/shopify/operations/products";
import { AddToCartButton } from "../../add-to-cart-button";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto py-20 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner">
            {product.featuredImage ? (
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                No Image Available
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="aspect-square relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                  <Image src={img.url} alt={img.altText || product.title} fill className="object-cover opacity-60 hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-playfair font-black text-slate-900 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-black text-blue-600">
                ${parseFloat(product.priceRange?.minVariantPrice.amount || "0").toFixed(2)}
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full border border-blue-100">
                {product.priceRange?.minVariantPrice.currencyCode}
              </span>
            </div>
          </div>

          <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed">
            <p>{product.description}</p>
          </div>

          <div className="pt-8 border-t border-slate-100 space-y-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Availability</span>
              <span className={`text-sm font-bold ${product.availableForSale ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.availableForSale ? '● In Stock: Ready for Dispatch' : '○ Out of Stock'}
              </span>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="w-full max-w-sm">
                <AddToCartButton
                  variantId={product.variants[0].id}
                  availableForSale={product.availableForSale}
                />
              </div>
            )}

            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Certified Laboratory Component • Genuine Quality Guaranteed
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
