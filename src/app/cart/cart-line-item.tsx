"use client";

import React, { useTransition } from "react";
import { updateCartLine, removeFromCart } from "@/lib/cart-actions";
import type { CartLine } from "@/lib/shopify-types";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";

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
    <tr className={`border-b border-slate-800 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {line.merchandise.image && (
            <img
              src={line.merchandise.image.url}
              alt={line.merchandise.image.altText || line.merchandise.product.title}
              className="w-12 h-12 object-cover rounded bg-slate-900 border border-slate-700"
            />
          )}
          <div>
            <div className="font-semibold text-white text-sm">
              {line.merchandise.product.title}
            </div>
            {line.merchandise.title !== "Default Title" && (
              <div className="text-xs text-slate-400">
                {line.merchandise.title}
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="py-4 px-4 text-slate-300 text-sm font-mono">
        ${parseFloat(line.merchandise.price.amount).toFixed(2)}
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => handleUpdateQuantity(line.quantity - 1)}
            disabled={isPending}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <span className="text-xs font-mono font-bold text-white px-2">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => handleUpdateQuantity(line.quantity + 1)}
            disabled={isPending}
            className="p-1 hover:bg-slate-700 rounded text-slate-300 disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
        </div>
      </td>

      <td className="py-4 px-4 text-emerald-400 font-bold font-mono text-sm">
        ${parseFloat(line.cost.totalAmount.amount).toFixed(2)}
      </td>

      <td className="py-4 px-4 text-right">
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
          title="Remove line item"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </td>
    </tr>
  );
}

export default CartLineItem;
