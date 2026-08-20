'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    ShopifyBuy?: any;
  }
}

interface ShopifyProductEmbedProps {
  productId?: string;
  domain?: string;
  storefrontAccessToken?: string;
}

export default function ShopifyProductEmbed({
  productId = '10547917816127',
  domain = 'vercel-store-34d604b7-q6ui4f53.myshopify.com',
  storefrontAccessToken = 'ec135574a177579679f4e4da5eb1a126',
}: ShopifyProductEmbedProps) {
  const containerId = 'product-component-1787195344833';
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

    function initShopifyBuy() {
      if (!window.ShopifyBuy || !window.ShopifyBuy.UI) return;

      const targetNode = document.getElementById(containerId);
      if (!targetNode) return;

      // Clear node content if any
      targetNode.innerHTML = '';

      try {
        const client = window.ShopifyBuy.buildClient({
          domain: domain,
          storefrontAccessToken: storefrontAccessToken,
        });

        window.ShopifyBuy.UI.onReady(client).then((ui: any) => {
          ui.createComponent('product', {
            id: productId,
            node: targetNode,
            moneyFormat: '%24%7B%7Bamount%7D%7D',
            options: {
              product: {
                styles: {
                  product: {
                    '@media (min-width: 601px)': {
                      'max-width': '100%',
                      'margin-left': '0',
                      'margin-bottom': '50px',
                    },
                    'text-align': 'left',
                  },
                  title: {
                    'font-size': '26px',
                    color: '#ffffff',
                  },
                  price: {
                    'font-size': '18px',
                    color: '#34d399',
                  },
                  compareAt: {
                    'font-size': '15.3px',
                    color: '#94a3b8',
                  },
                  unitPrice: {
                    'font-size': '15.3px',
                    color: '#94a3b8',
                  },
                  description: {
                    color: '#cbd5e1',
                  },
                },
                layout: 'horizontal',
                contents: {
                  img: false,
                  imgWithCarousel: true,
                  description: true,
                },
                width: '100%',
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
                  title: {
                    'font-family': 'Helvetica Neue, sans-serif',
                    'font-weight': 'bold',
                    'font-size': '26px',
                    color: '#4c4c4c',
                  },
                  price: {
                    'font-family': 'Helvetica Neue, sans-serif',
                    'font-weight': 'normal',
                    'font-size': '18px',
                    color: '#4c4c4c',
                  },
                  compareAt: {
                    'font-family': 'Helvetica Neue, sans-serif',
                    'font-weight': 'normal',
                    'font-size': '15.3px',
                    color: '#4c4c4c',
                  },
                  unitPrice: {
                    'font-family': 'Helvetica Neue, sans-serif',
                    'font-weight': 'normal',
                    'font-size': '15.3px',
                    color: '#4c4c4c',
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
              },
              toggle: {},
            },
          });
          isInitialized.current = true;
        });
      } catch (err) {
        console.error('Error initializing Shopify Product Buy Button UI:', err);
      }
    }

    if (window.ShopifyBuy && window.ShopifyBuy.UI) {
      initShopifyBuy();
    } else {
      const existingScript = document.querySelector(`script[src="${scriptURL}"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = scriptURL;
        script.onload = initShopifyBuy;
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      } else {
        existingScript.addEventListener('load', initShopifyBuy);
      }
    }
  }, [productId, domain, storefrontAccessToken]);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl my-6">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
            Featured Direct Buy Item
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Shopify Live Product Checkout</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Item ID: <span className="text-slate-200">{productId}</span>
        </div>
      </div>

      <div id={containerId} className="shopify-product-frame-container min-h-[360px] w-full" />
    </div>
  );
}
