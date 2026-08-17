import { getCart } from "@/lib/cart-actions";
import { CartLineItem } from "./cart-line-item";
import Link from "next/link";

export default async function CartPage() {
  const cart = await getCart();

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <main className="max-w-4xl mx-auto py-20 px-6 space-y-6">
        <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
        <p className="text-slate-500">Your cart is empty.</p>
        <Link href="/store" className="text-blue-600 font-bold hover:underline">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-20 px-6 space-y-12">
      <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-4 font-black uppercase text-xs tracking-widest text-slate-400">Product</th>
              <th className="py-4 font-black uppercase text-xs tracking-widest text-slate-400 text-right">Price</th>
              <th className="py-4 font-black uppercase text-xs tracking-widest text-slate-400 text-center">Quantity</th>
              <th className="py-4 font-black uppercase text-xs tracking-widest text-slate-400 text-right">Total</th>
              <th className="py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cart.lines.nodes.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-8 border-t border-slate-200 flex flex-col items-end gap-4">
        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">Subtotal</p>
          <p className="text-3xl font-black text-slate-900">
            ${parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)}{" "}
            <span className="text-sm text-slate-400">{cart.cost.subtotalAmount.currencyCode}</span>
          </p>
        </div>
        <a
          href={cart.checkoutUrl}
          className="px-10 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all text-center"
        >
          Proceed to Checkout
        </a>
        <Link href="/store" className="text-sm text-slate-400 font-bold hover:text-slate-600">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
