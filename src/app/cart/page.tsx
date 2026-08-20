import React from "react";
import Link from "next/link";
import { getCart } from "@/lib/cart-actions";
import { CartLineItem } from "./cart-line-item";
import { ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";

export const revalidate = 0; // Dynamic server component

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || !cart.lines.nodes || cart.lines.nodes.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white">Your Cart is Empty</h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          You haven&apos;t added any equipment or certified components to your cart yet.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Explore Logistics & Store
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          href="/store"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
        >
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full min-w-[600px] overflow-x-auto shadow-xl">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.lines.nodes.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Subtotal</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)}{" "}
            <span className="text-xs text-slate-400 font-normal">{cart.cost.subtotalAmount.currencyCode}</span>
          </div>
        </div>

        <a
          href={cart.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
        >
          Proceed to Checkout
          <ExternalLink size={16} />
        </a>
      </div>
    </main>
  );
}
