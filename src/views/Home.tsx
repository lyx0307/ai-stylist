import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { cn } from '../components/Layout';
import { ProductModal } from '../components/ProductModal';
import { CATEGORIES } from '../data';
import { api } from '../api';

export function Home({ onNavigateToStyling, onAddToCart }: { onNavigateToStyling?: () => void, onAddToCart?: (product: any, color: string, size: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("为你推荐");
  const [likedProducts, setLikedProducts] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(console.error);
  }, []);

  const filteredProducts = activeCategory === "为你推荐"
    ? products
    : products.filter(p => {
      // Handle case where category is a string instead of array
      const cats = typeof p.category === 'string' ? p.category : (p.category || []);
      return cats.includes(activeCategory);
    });

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setLikedProducts(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="relative rounded-3xl overflow-hidden h-[500px] shadow-2xl cursor-pointer group"
        onClick={() => setActiveCategory("极简风")}
      >
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"
          alt="Hero"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-12">
          <div className="text-white max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium border border-white/30">
              <Sparkles size={14} />
              <span>AI 造型师精选</span>
            </div>
            <h1 className="text-7xl font-bold tracking-tight leading-none">
              2026
              <span className="block text-2xl font-normal tracking-widest mt-2 opacity-90">SS COLLECTION</span>
            </h1>
            <p className="text-lg text-gray-200 font-light leading-relaxed">
              极简线条，中性色调，由 AI 造型师为您精心策划的永恒经典。
              探索属于您的独特风格语言。
            </p>
            <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
              探索系列
            </button>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="flex items-center justify-center gap-4 flex-wrap sticky top-20 z-30 py-4 bg-gray-50/80 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === cat
                ? "bg-black text-white shadow-lg scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.tag && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} />
                    {product.tag}
                  </div>
                )}
                <button
                  onClick={(e) => toggleLike(e, product.id)}
                  className={cn(
                    "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
                    likedProducts.includes(product.id)
                      ? "bg-white text-red-500 opacity-100"
                      : "bg-white/80 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-red-500"
                  )}
                >
                  <Heart size={18} fill={likedProducts.includes(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">{product.price}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Heart size={12} className={likedProducts.includes(product.id) ? "fill-red-500 text-red-500" : "fill-gray-400"} />
                    {product.likes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={onNavigateToStyling}
          className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Sparkles size={18} />
          咨询 AI 造型师
        </button>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isLiked={likedProducts.includes(selectedProduct.id)}
            onAddToCart={onAddToCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
