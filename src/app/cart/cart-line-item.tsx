"use client";

import { useTransition } from "react";
import { updateCartLine, removeFromCart } from "@/lib/cart-actions";
import type { CartLine } from "@/lib/shopify-types";

export function CartLineItem({ line }: { line: CartLine }) {
  const [isPending, startTransition] = useTransition();

  function handleUpdateQuantity(newQuantity: number) {
    startTransition(async () => {
      if (newQuantity <= 0) {
        await removeFromCart(line.id);
      } else {
        await updateCartLine(line.id, newQuantity);
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeFromCart(line.id);
    });
  }

  return (
    <tr className={`border-b border-slate-50 transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
      <td className="py-6">
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{line.merchandise.product.title}</span>
          {line.merchandise.title !== "Default Title" && (
            <span className="text-xs text-slate-400 font-medium">{line.merchandise.title}</span>
          )}
        </div>
      </td>
      <td className="py-6 text-right font-mono text-sm">
        ${parseFloat(line.merchandise.price.amount).toFixed(2)}
      </td>
      <td className="py-6">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handleUpdateQuantity(line.quantity - 1)}
            disabled={isPending}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            -
          </button>
          <span className="font-mono font-bold w-4 text-center">{line.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(line.quantity + 1)}
            disabled={isPending}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      </td>
      <td className="py-6 text-right font-bold text-slate-900">
        ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
      </td>
      <td className="py-6 text-right">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}
