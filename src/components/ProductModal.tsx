import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  likes: string | number;
  image: string;
  description?: string;
  tag?: string | null;
}

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  isLiked?: boolean;
}

export function ProductModal({ product, onClose, isLiked = false }: ProductModalProps) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden z-10"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="aspect-[3/4] relative bg-gray-100">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
            <div className="flex items-center gap-1 text-gray-500">
              <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
              <span className="text-sm">{product.likes}</span>
            </div>
          </div>
          
          <div className="text-2xl font-bold text-blue-600">
            {product.price}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">
            {product.description || "这款单品采用高品质面料制作，剪裁利落，适合多种场合穿着。极简设计风格，轻松打造高级感穿搭。"}
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">颜色</h3>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded-full bg-[#D2B48C] ring-2 ring-offset-2 ring-blue-600"></button>
                <button className="w-6 h-6 rounded-full bg-black ring-1 ring-gray-200"></button>
                <button className="w-6 h-6 rounded-full bg-white border border-gray-200"></button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-2">尺码</h3>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button key={size} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-xs font-medium hover:border-gray-900 transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-4">
            <ShoppingBag size={18} />
            确认加入购物车
          </button>
        </div>
      </motion.div>
    </div>
  );
}
