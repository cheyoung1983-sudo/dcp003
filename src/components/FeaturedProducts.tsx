'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Star, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils.ts';
import NextOptimizedImage from './NextOptimizedImage.tsx';

const PRODUCTS = [
  {
    id: 'p1',
    name: 'iPhone 15 Pro Max Screen Renewal',
    price: '$141.90',
    tier: 'Tier 2',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 128
  },
  {
    id: 'p2',
    name: 'Logic Board Triage & Trace',
    price: '$49.00',
    tier: 'Tier 3',
    category: 'Diagnostics',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviews: 84
  },
  {
    id: 'p3',
    name: 'OEM Battery Refresh (iPhone 14)',
    price: '$119.99',
    tier: 'Tier 1',
    category: 'Power',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 210
  },
  {
    id: 'p4',
    name: 'Galaxy S24 Ultra Display Pack',
    price: '$369.99',
    tier: 'Tier 2',
    category: 'Displays',
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 42
  },
  {
    id: 'p5',
    name: 'IPC Micro-Soldering Flux & Solder Wire Kit',
    price: '$38.50',
    tier: 'Tier 3',
    category: 'Tools',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 67
  },
  {
    id: 'p6',
    name: 'Heavy-Duty Fleet Armor Protective Case',
    price: '$49.99',
    tier: 'Tier 1',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1541892079639-65107954fa0f?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    reviews: 95
  },
  {
    id: 'p7',
    name: 'High-Amperage USB Power Delivery Tester',
    price: '$79.00',
    tier: 'Tier 1',
    category: 'Power',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviews: 31
  },
  {
    id: 'p8',
    name: 'Precision Logic Board Flex Replacement Cable',
    price: '$24.99',
    tier: 'Tier 2',
    category: 'Repair Parts',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 53
  }
];

export default function FeaturedProducts() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'Repair Parts', 'Tools', 'Accessories', 'Displays', 'Power', 'Diagnostics'];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    const priceA = parseFloat(a.price.replace('$', ''));
    const priceB = parseFloat(b.price.replace('$', ''));
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    // Newest (default reverse ID or original order)
    return b.id.localeCompare(a.id);
  });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-12">
          <div className="max-w-2xl">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-600 mb-4">Precision Inventory</h2>
            <h3 className="text-4xl md:text-6xl font-playfair font-black text-slate-900 leading-tight">
              Curated Service <br />
              <span className="italic text-slate-400">& Repair Assemblies</span>
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
            
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-12 pl-11 pr-8 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-slate-900 focus:bg-white outline-none transition-all text-xs font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="flex gap-1 bg-slate-50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                    activeCategory === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-900"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-[4/5] bg-slate-200 rounded-[2rem]" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-5 bg-slate-200 rounded w-1/2" />
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] mb-6 bg-slate-100 shadow-sm group-hover:shadow-xl group-hover:shadow-slate-200/50 transition-all">
                    <NextOptimizedImage 
                      src={product.image} 
                      alt={product.name}
                      width={400}
                      height={500}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%3C%230f172a'/%3E%3Crect x='100' y='120' width='200' height='260' rx='20' fill='%3C%231e293b' stroke='%3C%23334155' stroke-width='4'/%3E%3Ccircle cx='200' cy='150' r='8' fill='%3C%2338bdf8'/%3E%3Crect x='140' y='180' width='120' height='140' rx='8' fill='%3C%230284c7' opacity='0.3'/%3E%3Ctext x='200' y='420' text-anchor='middle' fill='%3C%2394a3b8' font-family='sans-serif' font-size='14' font-weight='bold'%3EPrecision Hardware Unit%3C/text%3E%3C/svg%3E"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                        {product.tier}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                        <ShoppingBag className="w-5 h-5 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 px-2">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-black text-slate-900">{product.rating}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({product.reviews})</span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{product.name}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xl font-black text-slate-900">{product.price}</span>
                      <button className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-sm flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No results found in the Laboratory Store.</p>
          </div>
        )}
      </div>
    </section>
  );
}
