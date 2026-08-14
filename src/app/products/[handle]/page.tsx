import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/lib/shopify/operations/products";
import AddToCartButton from "@/components/AddToCartButton";
import {
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Tag,
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: "Product Not Found | DisplayCellPros Store",
    };
  }

  return {
    title: `${product.title} | DisplayCellPros Store`,
    description: product.description || `Buy ${product.title} at DisplayCellPros. Certified parts and equipment.`,
    openGraph: {
      title: `${product.title} | DisplayCellPros Store`,
      description: product.description || `Buy ${product.title} at DisplayCellPros.`,
      images: product.featuredImage?.url ? [{ url: product.featuredImage.url }] : [],
    },
  };
}

export async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle, params);

  if (!product) {
    notFound();
    return null;
  }

  const primaryVariant = product.variants?.[0];
  const priceAmount = parseFloat(
    product.priceRange?.minVariantPrice?.amount ||
      primaryVariant?.price?.amount ||
      "0"
  ).toFixed(2);
  const currencyCode =
    product.priceRange?.minVariantPrice?.currencyCode ||
    primaryVariant?.price?.currencyCode ||
    "USD";

  const images = product.images && product.images.length > 0
    ? product.images
    : product.featuredImage
    ? [product.featuredImage]
    : [];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/store" className="hover:text-white transition-colors">
              Store
            </Link>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-xs sm:max-w-md">
              {product.title}
            </span>
          </nav>
          <Link
            href="/store"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Media Section */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-square relative shadow-2xl flex items-center justify-center">
              {images.length > 0 && images[0]?.url ? (
                <Image
                  src={images[0].url}
                  alt={images[0].altText || product.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
                  <ShoppingBag size={64} />
                  <span className="text-xs font-mono">No Image Available</span>
                </div>
              )}
              <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-emerald-400 border border-slate-700">
                In Stock & Certified
              </div>
            </div>

            {/* Thumbnail Gallery if multiple images */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 flex-shrink-0 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.title} image ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions Section */}
          <div className="flex flex-col space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                <Tag size={12} />
                <span>Certified OEM Grade Component</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {product.title}
              </h1>
            </div>

            {/* Price block */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
                  Unit Price
                </span>
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  ${priceAmount}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    {currencyCode}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 size={16} />
                <span>Ready for fulfillment</span>
              </div>
            </div>

            {/* Variants listing if any */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Available Variants:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs flex justify-between items-center"
                    >
                      <span className="text-slate-200 font-medium">{variant.title}</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        ${parseFloat(variant.price.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart action */}
            {primaryVariant && (
              <div className="pt-2">
                <AddToCartButton
                  variantId={primaryVariant.id}
                  availableForSale={true}
                  className="w-full py-3.5 text-base font-bold rounded-xl shadow-lg"
                />
              </div>
            )}

            {/* Description */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Product Overview
              </h2>
              {product.descriptionHtml ? (
                <div
                  className="text-sm text-slate-300 leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {product.description ||
                    "This certified component is verified by DisplayCellPros logistics and diagnostic bench testing."}
                </p>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                <ShieldCheck size={18} className="text-blue-400 flex-shrink-0" />
                <span>Verified Diagnostic Standards</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                <Truck size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Expedited Regional Dispatch</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-800/60">
                <RotateCcw size={18} className="text-purple-400 flex-shrink-0" />
                <span>B2B Return Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductPage;
