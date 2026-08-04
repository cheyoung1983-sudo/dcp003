import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopify Storefront",
  description: "A Next.js Shopify storefront",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <nav
          className="flex justify-between items-center p-4 border-b border-gray-200"
        >
          <a href="/" className="text-xl font-bold">
            Store
          </a>
          <a href="/cart" className="text-lg">
            Cart
          </a>
        </nav>
        <main className="flex-1" style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
