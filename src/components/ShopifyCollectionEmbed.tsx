'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';

interface ShopifyCollectionEmbedProps {
  collectionId?: string;
  domain?: string;
  storefrontAccessToken?: string;
  className?: string;
}

declare global {
  interface Window {
    ShopifyBuy: any;
  }
}

export function ShopifyCollectionEmbed({
  collectionId = '516532371775',
  domain = 'vercel-store-34d604b7-q6ui4f53.myshopify.com',
  storefrontAccessToken = 'ec135574a177579679f4e4da5eb1a126',
  className = '',
}: ShopifyCollectionEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

    function initShopify() {
      if (!window.ShopifyBuy || !window.ShopifyBuy.UI) return;
      if (!containerRef.current) return;

      try {
        // Clear previous children if any to prevent duplicate renders on re-mount
        containerRef.current.innerHTML = '';

        const client = window.ShopifyBuy.buildClient({
          domain: domain,
          storefrontAccessToken: storefrontAccessToken,
        });

        window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
          if (!isMounted || !containerRef.current) return;

          ui.createComponent('collection', {
            id: collectionId,
            node: containerRef.current,
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              product: {
                styles: {
                  product: {
                    '@media (min-width: 601px)': {
                      'max-width': 'calc(25% - 20px)',
                      'margin-left': '20px',
                      'margin-bottom': '50px',
                      width: 'calc(25% - 20px)',
                    },
                    img: {
                      height: 'calc(100% - 15px)',
                      position: 'absolute',
                      left: '0',
                      right: '0',
                      top: '0',
                    },
                    imgWrapper: {
                      'padding-top': 'calc(75% + 15px)',
                      position: 'relative',
                      height: '0',
                    },
                    button: {
                      'background-color': '#2563eb',
                      ':hover': {
                        'background-color': '#1d4ed8',
                      },
                      'border-radius': '10px',
                      'font-weight': '600',
                      'padding-left': '20px',
                      'padding-right': '20px',
                    },
                  },
                },
                text: {
                  button: 'Add to cart',
                },
              },
              productSet: {
                styles: {
                  products: {
                    '@media (min-width: 601px)': {
                      'margin-left': '-20px',
                    },
                  },
                },
              },
              modalProduct: {
                contents: {
                  img: false,
                  imgWithCarousel: true,
                  button: false,
                  buttonWithQuantity: true,
                },
                styles: {
                  product: {
                    '@media (min-width: 601px)': {
                      'max-width': '100%',
                      'margin-left': '0px',
                      'margin-bottom': '0px',
                    },
                  },
                },
                text: {
                  button: 'Add to cart',
                },
              },
              option: {},
              cart: {
                text: {
                  total: 'Subtotal',
                  button: 'Checkout',
                },
                styles: {
                  button: {
                    'background-color': '#2563eb',
                    ':hover': {
                      'background-color': '#1d4ed8',
                    },
                    'border-radius': '10px',
                  },
                },
              },
              toggle: {
                styles: {
                  count: {
                    'background-color': '#2563eb',
                  },
                  iconPath: {
                    fill: '#ffffff',
                  },
                },
              },
            },
          });
          if (isMounted) {
            setLoading(false);
          }
        }).catch((err: any) => {
          console.error('Shopify Buy Button UI error:', err);
          if (isMounted) {
            setError(err?.message || 'Failed to initialize Shopify Buy Button UI');
            setLoading(false);
          }
        });
      } catch (err: any) {
        console.error('Shopify Buy Button error:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to initialize Shopify Buy Button client');
          setLoading(false);
        }
      }
    }

    if (window.ShopifyBuy && window.ShopifyBuy.UI) {
      initShopify();
    } else {
      const existingScript = document.querySelector(`script[src="${scriptURL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', initShopify);
      } else {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = scriptURL;
        script.onload = initShopify;
        script.onerror = () => {
          if (isMounted) {
            setError('Failed to load Shopify Buy Button SDK');
            setLoading(false);
          }
        };
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [collectionId, domain, storefrontAccessToken]);

  return (
    <div className={`w-full min-h-[350px] relative ${className}`}>
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-mono text-slate-400">Loading Live Shopify Collection ({collectionId})...</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center my-4">
          <p className="font-semibold">Shopify Live Embed Notice</p>
          <p className="text-slate-400 mt-1">{error}</p>
        </div>
      )}

      {/* Target node for Shopify Buy Button Collection */}
      <div
        id="collection-component-1787194358662"
        ref={containerRef}
        className={`w-full transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}

export default ShopifyCollectionEmbed;
