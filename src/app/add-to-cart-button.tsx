"use client";

import { useTransition } from "react";
import { addToCart } from "@/lib/cart-actions";

export function AddToCartButton({
  variantId,
  availableForSale,
}: {
  variantId: string;
  availableForSale: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await addToCart(variantId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={!availableForSale || isPending}
      className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
    >
      {!availableForSale
        ? "Sold Out"
        : isPending
          ? "Adding..."
          : "Add to Cart"}
    </button>
  );
}
