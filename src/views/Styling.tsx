import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'motion/react';
import { Send, ThumbsUp, ThumbsDown, X, Heart, MoreHorizontal, ShoppingBag, ArrowUp, Sparkles as LucideSparkles, RefreshCw } from 'lucide-react';
import { cn } from '../components/Layout';
import { ProductModal } from '../components/ProductModal';
import { api } from '../api';

// Mock Data
const CHAT_HISTORY = [
  {
    id: 1,
    role: 'ai',
    content: '嗨！我是你的专属 AI 造型师。今天想尝试什么风格呢？',
    time: '10:23 AM'
  }
];

const PROMPT_BATCHES = [
  [
    "我想找一些适合春季通勤的极简穿搭，最好是有点高级感的。",
    "帮我搭配一套适合周末约会的复古风格。",
    "推荐几款适合职场的舒适平底鞋。"
  ],
  [
    "有没有适合度假的波西米亚风长裙推荐？",
    "我想尝试一下街头潮流风格，有什么入门单品？",
    "最近很火的老钱风穿搭，怎么穿才不显老气？"
  ]
];

const SWIPE_CARDS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: "极简胶囊系列"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: "都市通勤"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: "优雅晚宴"
  }
];

const RECOMMENDED_PRODUCTS = [
  {
    id: 1,
    name: "极简垂坠西装",
    price: "¥299",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: "98% 匹配",
    description: "这款西装采用高垂坠感面料，剪裁利落，适合多种场合穿着。极简设计风格，轻松打造高级感通勤穿搭。"
  },
  {
    id: 2,
    name: "高腰阔腿西装裤",
    price: "¥199",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: null,
    description: "经典高腰设计，拉长腿部线条，面料舒适透气。"
  },
  {
    id: 3,
    name: "真丝吊带连衣裙",
    price: "¥599",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: null,
    description: "100% 桑蚕丝，光泽感极佳，尽显优雅气质。"
  },
  {
    id: 4,
    name: "美利奴羊毛粗针织衫",
    price: "¥450",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    tag: null,
    description: "澳洲进口美利奴羊毛，保暖舒适，亲肤不扎。"
  }
];

interface StylingProps {
  onAddToCart?: (product: any, color: string, size: string) => void;
}

export function Styling({ onAddToCart }: StylingProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [viewMode, setViewMode] = useState<'chat' | 'swipe' | 'results'>('chat');
  const [selectedProduct, setSelectedProduct] = useState<typeof RECOMMENDED_PRODUCTS[0] | null>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [promptBatchIndex, setPromptBatchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Swipe mechanics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const overlayLikeOpacity = useTransform(x, [0, 150], [0, 1]);
  const overlayPassOpacity = useTransform(x, [0, -150], [0, 1]);
  const controls = useAnimation();

  useEffect(() => {
    api.getChatHistory().then(history => {
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages(CHAT_HISTORY);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Animate the card completely off screen
    await controls.start({
      x: direction === 'right' ? window.innerWidth : -window.innerWidth,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    // Reset position for next card
    x.set(0);
    controls.set({ x: 0, opacity: 1 });

    if (swipeIndex < SWIPE_CARDS.length - 1) {
      setSwipeIndex(prev => prev + 1);
    } else {
      // End of swipe, show results
      setViewMode('results');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const msgData = {
        role: 'ai',
        content: '收到你的喜好偏好啦！根据你右滑记录的信息，这是为你精准匹配的最佳单品组合推荐。',
        time,
        action: 'show_results'
      };

      const loadingId = Date.now();
      setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: 'AI 正在生成专属推荐...', isLoading: true }]);

      api.sendChatMessage(msgData).then(saved => {
        setMessages(prev => prev.map(m => m.id === loadingId ? saved : m));
      }).catch(console.error);
    }
  };

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: text, time };

    // Optimistic UI update
    const tempId = Date.now();
    setMessages(prev => [...prev, { ...userMsg, id: tempId }]);
    setInput("");

    // Add loading AI message
    const loadingId = tempId + 1;
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: 'AI 正在思考...', isLoading: true }]);

    try {
      // Add user message & Get AI response
      const response = await api.sendChatMessage(userMsg);

      let aiContent = response.aiMessage ? response.aiMessage.content : '';
      let needsSwipe = false;

      // Clean up the action prompt from model text if it accidentally included it
      if (aiContent.includes('action: "start_swipe"')) {
        aiContent = aiContent.replace(/action:\s*"start_swipe"/g, '');
        needsSwipe = true;
      } else if (aiContent.includes('start_swipe')) {
        aiContent = aiContent.replace(/start_swipe/g, '');
        needsSwipe = true;
      }

      if (response.aiMessage) {
        response.aiMessage.content = aiContent;
      }

      setMessages(prev => prev.map(m => {
        if (m.id === tempId) return response.userMessage;
        if (m.id === loadingId) return response.aiMessage;
        return m;
      }));

      if (needsSwipe || (response.aiMessage && response.aiMessage.action === 'start_swipe')) {
        setTimeout(() => setViewMode('swipe'), 1500);
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => prev.filter(m => m.id !== loadingId));
    }
  };

  const handleRefreshPrompts = () => {
    setPromptBatchIndex((prev) => (prev + 1) % PROMPT_BATCHES.length);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-gray-50">
      {/* Left Chat Panel */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-gray-200 bg-white shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">造型对话</h2>
          <span className="text-xs text-gray-400">与 AI 造型师实时互动</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {msg.role === 'ai' ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sparkles size={14} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <UserIcon />
                </div>
              )}

              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-800 rounded-tl-none",
                msg.isLoading ? "animate-pulse" : ""
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Prompts Selection */}
          {messages.length === 1 && (
            <div className="space-y-3 pl-11">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">你可以这样问我：</span>
                <button
                  onClick={handleRefreshPrompts}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <RefreshCw size={12} />
                  换一批
                </button>
              </div>
              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={promptBatchIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-2"
                  >
                    {PROMPT_BATCHES[promptBatchIndex].map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(prompt)}
                        className="w-full text-left p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-700 transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="输入你的想法..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => handleSendMessage()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden flex">
        {/* Main View (Swipe or Grid) */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center min-h-full">
          <AnimatePresence mode="wait">
            {viewMode === 'swipe' && (
              <motion.div
                key="swipe"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md aspect-[3/4]"
              >
                <div className="absolute inset-0 bg-gray-200 rounded-3xl transform rotate-3 scale-95 opacity-50" />
                <div className="absolute inset-0 bg-gray-300 rounded-3xl transform -rotate-2 scale-95 opacity-50" />

                <motion.div
                  className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
                  style={{ x, rotate, opacity }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                >
                  <img
                    src={SWIPE_CARDS[swipeIndex].image}
                    alt="Style"
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {/* LIKE Overlay */}
                  <motion.div
                    style={{ opacity: overlayLikeOpacity }}
                    className="absolute top-10 right-10 border-4 border-green-500 text-green-500 text-4xl font-black rounded-lg px-4 py-2 rotate-12 pointer-events-none"
                  >
                    喜欢
                  </motion.div>
                  {/* PASS Overlay */}
                  <motion.div
                    style={{ opacity: overlayPassOpacity }}
                    className="absolute top-10 left-10 border-4 border-red-500 text-red-500 text-4xl font-black rounded-lg px-4 py-2 -rotate-12 pointer-events-none"
                  >
                    跳过
                  </motion.div>

                  <div className="absolute top-4 right-4 pointer-events-none">
                    <button className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-colors pointer-events-auto">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-8 left-8 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium">
                      {SWIPE_CARDS[swipeIndex].tag}
                    </div>
                  </div>
                </motion.div>

                <div className="flex justify-center gap-8 mt-8">
                  <button
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all"
                  >
                    <X size={32} />
                  </button>
                  <button
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:scale-110 transition-all"
                  >
                    <Heart size={32} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            )}

            {viewMode === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">为你推荐 <span className="text-gray-400 font-normal text-sm ml-2">8 件单品</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                  {RECOMMENDED_PRODUCTS.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className={cn(
                        "bg-white rounded-2xl p-4 shadow-sm cursor-pointer transition-all border-2",
                        selectedProduct?.id === product.id ? "border-blue-600 ring-4 ring-blue-50" : "border-transparent hover:border-gray-200"
                      )}
                    >
                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-4 relative bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        {product.tag && (
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                            <Sparkles size={10} />
                            {product.tag}
                          </div>
                        )}
                        <button className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                          <Heart size={14} />
                        </button>
                      </div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm font-bold text-gray-900 mt-1">{product.price}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Detail Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              isLiked={false}
              onAddToCart={onAddToCart}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function Sparkles({ size = 24, fill = "none" }: { size?: number, fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
