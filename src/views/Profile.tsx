import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Package, Truck, RefreshCw, Filter, Plus, Heart, ArrowLeft, Sparkles, User, X } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '../components/Layout';
import { ProductModal } from '../components/ProductModal';
import { RegisterModal, UpdateMeasurementsModal, SubscriptionModal } from '../components/ProfileModals';
import { UserProfile } from '../App';
import { PRODUCTS } from '../data';
import { api } from '../api';

const STYLE_DATA = [
  { subject: '休闲', A: 120, fullMark: 150 },
  { subject: '职场', A: 98, fullMark: 150 },
  { subject: '复古', A: 86, fullMark: 150 },
  { subject: '运动', A: 99, fullMark: 150 },
  { subject: '街头', A: 85, fullMark: 150 },
  { subject: '优雅', A: 65, fullMark: 150 },
];

const ORDERS = [
  { icon: CreditCard, label: '待付款', count: 1 },
  { icon: Package, label: '待发货', count: 0 },
  { icon: Truck, label: '待收货', count: 2 },
  { icon: RefreshCw, label: '退换修', count: 0 },
];

const FAVORITES_DATA = [
  {
    id: 1,
    title: "春季极简风衣穿搭",
    date: "3天前收藏",
    timestamp: 1710000000000,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 101, name: "经典廓形风衣", price: "¥899", likes: "1.2k", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
      { id: 102, name: "极简结构真皮手袋", price: "¥1,200", likes: "2.4k", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  },
  {
    id: 2,
    title: "棕色系配饰参考",
    date: "2周前收藏",
    timestamp: 1709000000000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 201, name: "极简结构真皮手袋", price: "¥1,200", likes: "2.4k", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  },
  {
    id: 3,
    title: "粗针织毛衣质感",
    date: "1个月前收藏",
    timestamp: 1707000000000,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 301, name: "美利奴羊毛粗针织衫", price: "¥450", likes: "500", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  },
  {
    id: 4,
    title: "阔腿裤通勤灵感",
    date: "1周前收藏",
    timestamp: 1709500000000,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 401, name: "阔腿褶皱西裤", price: "¥299", likes: "850", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  },
  {
    id: 5,
    title: "复古丹宁日常",
    date: "1个月前收藏",
    timestamp: 1707500000000,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 501, name: "90年代直筒牛仔裤", price: "¥350", likes: "2.1k", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  },
  {
    id: 6,
    title: "晚宴丝绸长裙",
    date: "2个月前收藏",
    timestamp: 1705000000000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      { id: 601, name: "缎面吊带连衣裙", price: "¥599", likes: "1.5k", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" }
    ]
  }
];

type ViewState = 'main' | 'orders' | 'inspiration';

interface ProfileProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

export function Profile({ userProfile, setUserProfile }: ProfileProps) {
  const [viewState, setViewState] = useState<ViewState>('main');
  const [selectedOrderType, setSelectedOrderType] = useState<string | null>(null);
  const [selectedInspiration, setSelectedInspiration] = useState<any | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Data state
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<'date' | 'name'>('date');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUpdateDataOpen, setIsUpdateDataOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);

  useEffect(() => {
    api.getFavorites().then(setFavorites).catch(console.error);
  }, []);

  const handleOrderClick = (label: string) => {
    setSelectedOrderType(label);
    setViewState('orders');
  };

  const handleInspirationClick = (item: typeof FAVORITES_DATA[0]) => {
    setSelectedInspiration(item);
    setViewState('inspiration');
  };

  const handleBack = () => {
    setViewState('main');
    setSelectedOrderType(null);
    setSelectedInspiration(null);
    setIsAddProductOpen(false);
  };

  const handleRegister = (name: string, phone: string, password: string) => {
    const newData = { ...userProfile, name, is_registered: true };
    api.updateUser(newData).then(res => {
      setUserProfile({ ...userProfile, name, isRegistered: true });
    }).catch(console.error);
  };

  const handleUpdateMeasurements = (height: string, weight: string) => {
    const newData = { ...userProfile, height, weight };
    api.updateUser(newData).then(res => {
      setUserProfile({ ...userProfile, height, weight });
    }).catch(console.error);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    api.deleteFavorite(id).then(() => {
      setFavorites(prev => prev.filter(item => item.id !== id));
    }).catch(console.error);
  };

  const handleAddItem = (product: typeof PRODUCTS[0]) => {
    if (selectedInspiration) {
      api.addFavoriteItem(selectedInspiration.id, product.id).then(() => {
        const updatedInspiration = {
          ...selectedInspiration,
          items: [...selectedInspiration.items, product]
        };

        setSelectedInspiration(updatedInspiration);
        setFavorites(prev => prev.map(fav =>
          fav.id === selectedInspiration.id ? updatedInspiration : fav
        ));
        setIsAddProductOpen(false);
      }).catch(console.error);
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (filterType === 'date') {
      return b.timestamp - a.timestamp;
    } else {
      return a.title.localeCompare(b.title, 'zh-CN');
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
      <AnimatePresence mode="wait">
        {viewState === 'main' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              {/* User Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
                <div
                  onClick={() => setIsRegisterOpen(true)}
                  className="w-24 h-24 mx-auto bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-4 relative cursor-pointer hover:scale-105 transition-transform"
                >
                  {userProfile.isRegistered ? (
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <User size={48} />
                  )}
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                    <Settings size={14} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{userProfile.name}</h2>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                  ✨ 极简冷淡风
                </div>

                {/* Stats Removed as requested */}
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">我的数字量体</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUpdateDataOpen(true);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    更新数据
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">身高</div>
                    <div className="text-lg font-bold text-gray-900">{userProfile.height} cm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">体重</div>
                    <div className="text-lg font-bold text-gray-900">{userProfile.weight} kg</div>
                  </div>
                </div>

                <div
                  onClick={() => setIsSubscriptionOpen(true)}
                  className="h-48 w-full -ml-4 cursor-pointer"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={STYLE_DATA}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar
                        name="Style"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center text-xs text-gray-400 mt-2">风格雷达图</div>
              </div>

              {/* Pro Banner */}
              <div
                onClick={() => setIsSubscriptionOpen(true)}
                className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative cursor-pointer group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10 group-hover:opacity-30 transition-opacity"></div>
                <h3 className="text-lg font-bold mb-2 relative z-10">升级 AI 造型师 Pro</h3>
                <p className="text-sm text-gray-300 mb-6 relative z-10">解锁无限次搭配生成与专属色彩分析。</p>
                <button className="bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10">
                  立即查看
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
              {/* Orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">我的订单</h2>
                  <button
                    onClick={() => handleOrderClick('全部订单')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    全部订单 &gt;
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {ORDERS.map((order) => (
                    <div
                      key={order.label}
                      onClick={() => handleOrderClick(order.label)}
                      className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all cursor-pointer group relative"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <order.icon size={20} />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{order.label}</span>
                      {order.count > 0 && (
                        <span className="absolute top-4 right-4 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {order.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspiration Wardrobe */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">我的灵感衣橱</h2>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">{favorites.length}</span>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Filter size={14} />
                      筛选
                    </button>
                    <AnimatePresence>
                      {isFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-20"
                        >
                          <button
                            onClick={() => { setFilterType('date'); setIsFilterOpen(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                              filterType === 'date' ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            按时间排序
                          </button>
                          <button
                            onClick={() => { setFilterType('name'); setIsFilterOpen(false); }}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                              filterType === 'name' ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50 text-gray-700"
                            )}
                          >
                            按名称排序
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {sortedFavorites.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -4 }}
                        onClick={() => handleInspirationClick(item)}
                        className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            onClick={(e) => handleRemoveFavorite(e, item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 shadow-sm opacity-100 hover:bg-white hover:scale-110 transition-all"
                          >
                            <Heart size={14} fill="currentColor" />
                          </button>
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={10} />
                            {item.items.length} 件单品
                          </div>
                        </div>
                        <div className="px-1">
                          <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-xs text-gray-400">{item.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewState === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-2xl min-h-[600px] p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedOrderType}</h1>
            </div>

            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Package size={40} className="text-gray-300" />
              </div>
              <p>暂无相关订单</p>
              <button className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                去逛逛
              </button>
            </div>
          </motion.div>
        )}

        {viewState === 'inspiration' && selectedInspiration && (
          <motion.div
            key="inspiration"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 bg-white hover:bg-gray-50 rounded-full transition-colors shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedInspiration.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{selectedInspiration.date}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedInspiration.items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                  onClick={() => setSelectedProduct(item)}
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={14} fill="currentColor" />
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm font-bold text-gray-900 mt-1">{item.price}</p>
                </motion.div>
              ))}

              {/* Add Item Placeholder */}
              <div
                onClick={() => setIsAddProductOpen(true)}
                className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all min-h-[300px]"
              >
                <Plus size={32} />
                <span className="text-sm font-medium mt-2">添加单品</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isLiked={true}
          />
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddProductOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddProductOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">选择单品添加到灵感</h2>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {PRODUCTS.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleAddItem(product)}
                      className="cursor-pointer group"
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-gray-100 relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            添加
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-500">{product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modals */}
      <AnimatePresence>
        {isRegisterOpen && (
          <RegisterModal
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
            onRegister={handleRegister}
          />
        )}
        {isUpdateDataOpen && (
          <UpdateMeasurementsModal
            isOpen={isUpdateDataOpen}
            onClose={() => setIsUpdateDataOpen(false)}
            initialHeight={userProfile.height}
            initialWeight={userProfile.weight}
            onUpdate={handleUpdateMeasurements}
          />
        )}
        {isSubscriptionOpen && (
          <SubscriptionModal
            isOpen={isSubscriptionOpen}
            onClose={() => setIsSubscriptionOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
