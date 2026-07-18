import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'motion/react';
import { Send, ThumbsUp, ThumbsDown, X, Heart, MoreHorizontal, ShoppingBag, ArrowUp, Sparkles as LucideSparkles, RefreshCw } from 'lucide-react';
import { cn } from '../components/Layout';
import { ProductModal } from '../components/ProductModal';
import { api } from '../api';
import { Product, shuffleProducts } from '../types';

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


function ChatMessageContent({ msg }: { msg: any }) {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  if (msg.isLoading) {
    return <span>{msg.content}</span>;
  }

  let content = msg.content || "";
  
  // Clean up ALL JSON blocks from display
  content = content.replace(/```(?:json)?\s*\{[\s\S]*?\}\s*```/ig, '').trim();
  content = content.replace(/\{\s*"target_gender"[\s\S]*?"main_style"[\s\S]*?\}/ig, '').trim();
  content = content.replace(/\d+\.?\s*JSON.*?$/img, '').trim();
  
  const thinkingMatch = content.match(/<thinking>([\s\S]*?)(?:<\/thinking>|$)/);

  if (thinkingMatch) {
    const thinkingText = thinkingMatch[1].trim();
    const displayText = content.replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/, "").trim();

    return (
      <div className="space-y-2">
        <div className="rounded-xl bg-black/5 p-2.5 text-xs border border-black/10 text-gray-500">
          <button
            onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
            className="flex items-center gap-1.5 font-medium text-gray-600 hover:text-gray-900 transition-colors w-full text-left cursor-pointer"
          >
            <LucideSparkles size={12} className="text-purple-500 animate-pulse animate-duration-1000" />
            <span>{isThinkingExpanded ? "收起思考过程" : "查看思考过程..."}</span>
          </button>
          {isThinkingExpanded && (
            <div className="mt-2 pt-2 border-t border-black/5 whitespace-pre-wrap font-mono leading-relaxed select-all max-h-60 overflow-y-auto">
              {thinkingText}
            </div>
          )}
        </div>
        <div className="whitespace-pre-wrap">{displayText}</div>
      </div>
    );
  }

  return <div className="whitespace-pre-wrap">{content}</div>;
}

interface StylingProps {
  products: Product[];
  onAddToCart?: (product: any, color: string, size: string) => void;
}

export function Styling({ products, onAddToCart }: StylingProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [viewMode, setViewMode] = useState<'chat' | 'sub_style_swipe' | 'product_selection' | 'results'>('chat');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeCards, setSwipeCards] = useState<any[]>([]);
  const [likedSubStyles, setLikedSubStyles] = useState<string[]>([]);
  const [likedProducts, setLikedProducts] = useState<any[]>([]);
  const [currentIntent, setCurrentIntent] = useState<any>(null);
  
  const [promptBatchIndex, setPromptBatchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Recommendations are derived from liked products
  const recommendedProducts = useMemo(() => likedProducts.length > 0 ? likedProducts : shuffleProducts(products).slice(0, 8), [likedProducts, products]);

  // Swipe mechanics
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const overlayLikeOpacity = useTransform(x, [0, 150], [0, 1]);
  const overlayPassOpacity = useTransform(x, [0, -150], [0, 1]);
  const controls = useAnimation();

  useEffect(() => {
    api.getChatHistory().then(history => {
      // Filter out preference history from UI
      const uiHistory = (history || []).filter((h: any) => h.role !== 'preference');
      if (uiHistory.length > 0) {
        setMessages(uiHistory);
      } else {
        setMessages(CHAT_HISTORY);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (products.length === 0 || messages.length === 0) return;
    // Only restore state if we are still in chat mode
    if (viewMode !== 'chat') return;
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'ai') {
        const aiContent = lastMsg.content || '';
        const codeBlockMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
        let jsonStr = null;
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1];
        } else {
            const fallbackMatch = aiContent.match(/(\{\s*"target_gender"[\s\S]*?\})/i);
            if (fallbackMatch) jsonStr = fallbackMatch[1];
        }
        if (jsonStr) {
            try {
                const intent = JSON.parse(jsonStr);
                if (intent && intent.main_style) {
                    setCurrentIntent(intent);
                    const targetGender = intent.target_gender || '男士';
                    const matchingProducts = products.filter(p => {
                        const isMainStyle = Array.isArray(p.category) ? p.category.includes(intent.main_style) : p.category === intent.main_style;
                        return isMainStyle && p.name.includes(targetGender);
                    });

                    if (intent.item_type && intent.item_type.trim() !== '') {
                        const itemTypeMatches = matchingProducts.filter(p => 
                            p.name.includes(intent.item_type) || p.description.includes(intent.item_type) || p.tag.includes(intent.item_type)
                        );
                        if (itemTypeMatches.length < 2) {
                            const globalItemTypeMatches = products.filter(p => 
                                (p.name.includes(intent.item_type) || p.description.includes(intent.item_type) || p.tag.includes(intent.item_type))
                                && p.name.includes(targetGender)
                            );
                            if (globalItemTypeMatches.length >= 2) {
                                setCurrentIntent({ ...intent, main_style: '' });
                                const subStyleTags = Array.from(new Set(globalItemTypeMatches.map(p => p.tag)));
                                const cards = subStyleTags.map(tag => {
                                    const firstProduct = globalItemTypeMatches.find(p => p.tag === tag);
                                    return {
                                        id: tag,
                                        name: tag,
                                        image: firstProduct?.image,
                                        isSubStyle: true
                                    };
                                });
                                setSwipeCards(cards);
                                setSwipeIndex(0);
                                setLikedSubStyles([]);
                                setLikedProducts([]);
                                setViewMode('sub_style_swipe');
                                return;
                            } else {
                                setCurrentIntent({ ...intent, item_type: '' }); // Clear item_type to fallback to general swipe
                                // We do NOT return here so it falls through to the general subStyleTags logic below
                            }
                        } else {
                            // User wants both steps, so extract subStyleTags ONLY from matched items
                            const subStyleTags = Array.from(new Set(itemTypeMatches.map(p => p.tag)));
                            const cards = subStyleTags.map(tag => {
                                const firstProduct = itemTypeMatches.find(p => p.tag === tag);
                                return {
                                    id: tag,
                                    name: tag,
                                    image: firstProduct?.image,
                                    isSubStyle: true
                                };
                            });
                            
                            setSwipeCards(cards);
                            setSwipeIndex(0);
                            setLikedSubStyles([]);
                            setLikedProducts([]);
                            setViewMode('sub_style_swipe');
                            return;
                        }
                    }

                    const subStyleTags = Array.from(new Set(matchingProducts.map(p => p.tag)));
                    if (subStyleTags.length > 0) {
                        const cards = subStyleTags.map(tag => {
                            const firstProduct = matchingProducts.find(p => p.tag === tag);
                            return {
                                id: tag,
                                name: tag,
                                image: firstProduct?.image,
                                isSubStyle: true
                            };
                        });
                        
                        setSwipeCards(cards);
                        setSwipeIndex(0);
                        setLikedSubStyles([]);
                        setLikedProducts([]);
                        setViewMode('sub_style_swipe');
                    }
                }
            } catch(e) {}
        }
    }
  }, [messages, products, viewMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentCard = swipeCards[swipeIndex];

    await controls.start({
      x: direction === 'right' ? window.innerWidth : -window.innerWidth,
      opacity: 0,
      transition: { duration: 0.3 }
    });

    x.set(0);
    controls.set({ x: 0, opacity: 1 });
    
    // Save preference
    if (direction === 'right') {
        if (viewMode === 'sub_style_swipe') {
            setLikedSubStyles(prev => [...prev, currentCard.name]);
            api.savePreference({ type: 'sub_style_like', value: currentCard.name, context: 'AI Styling' }).catch(console.error);
        } else if (viewMode === 'product_swipe') {
            setLikedProducts(prev => [...prev, currentCard]);
            api.savePreference({ type: 'product_like', value: currentCard.id.toString(), context: 'AI Styling' }).catch(console.error);
        }
    } else {
        if (viewMode === 'sub_style_swipe') {
            api.savePreference({ type: 'sub_style_dislike', value: currentCard.name, context: 'AI Styling' }).catch(console.error);
        }
    }

    if (swipeIndex < swipeCards.length - 1) {
      setSwipeIndex(prev => prev + 1);
    } else {
      if (viewMode === 'sub_style_swipe') {
          // Transition to product selection
          const subStylesToUse = direction === 'right' ? [...likedSubStyles, currentCard.name] : likedSubStyles;
          const targetGender = currentIntent?.target_gender || '男士';
          const filterTags = subStylesToUse.length > 0 ? subStylesToUse : Array.from(new Set(products.filter(p => {
              if (currentIntent?.main_style) {
                  const isMainStyle = Array.isArray(p.category) ? p.category.includes(currentIntent.main_style) : p.category === currentIntent.main_style;
                  return isMainStyle && p.name.includes(targetGender);
              }
              return p.name.includes(targetGender);
          }).map(p => p.tag)));
          
          let prodCards = products.filter(p => filterTags.includes(p.tag) && p.name.includes(targetGender));
          
          if (currentIntent?.item_type && currentIntent.item_type.trim() !== '') {
              const itemTypeMatches = prodCards.filter(p => 
                  p.name.includes(currentIntent.item_type) || p.description.includes(currentIntent.item_type) || p.tag.includes(currentIntent.item_type)
              );
              if (itemTypeMatches.length > 0) prodCards = itemTypeMatches;
          }
          
          prodCards = shuffleProducts(prodCards).slice(0, 10); // Limit to 10 products for selection list
          
          if (prodCards.length === 0) {
              // Fallback if no exact match
              let fallbackCards = products.filter(p => p.name.includes(targetGender));
              if (currentIntent?.item_type && currentIntent.item_type.trim() !== '') {
                  const specificFallback = fallbackCards.filter(p => p.name.includes(currentIntent.item_type) || p.description.includes(currentIntent.item_type) || p.tag.includes(currentIntent.item_type));
                  if (specificFallback.length > 0) fallbackCards = specificFallback;
              }
              prodCards = shuffleProducts(fallbackCards).slice(0, 10);
          }
          
          setSwipeCards(prodCards);
          setViewMode('product_selection');
      }
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

    const tempId = Date.now();
    setMessages(prev => [...prev, { ...userMsg, id: tempId }]);
    setInput("");

    const loadingId = tempId + 1;
    setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: 'AI 正在思考...', isLoading: true }]);

    try {
      const response = await api.sendChatMessage(userMsg);
      let aiContent = response.aiMessage ? response.aiMessage.content : '';
      
      let intent = null;
      const codeBlockMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i);
      let jsonStr = null;
      let blockToReplace = null;

      if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
          blockToReplace = codeBlockMatch[0];
      } else {
          const fallbackMatch = aiContent.match(/(\{\s*"target_gender"[\s\S]*?\})/i);
          if (fallbackMatch) {
              jsonStr = fallbackMatch[1];
              blockToReplace = fallbackMatch[0];
          }
      }

      if (jsonStr) {
          try {
              intent = JSON.parse(jsonStr);
              aiContent = aiContent.replace(blockToReplace, '').trim();
              aiContent = aiContent.replace(/\d+\.?\s*JSON.*?$/img, '').trim();
          } catch(e) {
              console.error("Failed to parse AI intent JSON:", e);
          }
      }

      // Cleanup legacy prompt
      if (aiContent.includes('action: "start_swipe"')) aiContent = aiContent.replace(/action:\s*"start_swipe"/g, '');

      if (response.aiMessage) response.aiMessage.content = aiContent;

      setMessages(prev => prev.map(m => {
        if (m.id === tempId) return response.userMessage;
        if (m.id === loadingId) return response.aiMessage;
        return m;
      }));

      if (intent && intent.main_style) {
          setCurrentIntent(intent);
          const targetGender = intent.target_gender || '男士';
          const matchingProducts = products.filter(p => {
              const isMainStyle = Array.isArray(p.category) ? p.category.includes(intent.main_style) : p.category === intent.main_style;
              return isMainStyle && p.name.includes(targetGender);
          });

          if (intent.item_type && intent.item_type.trim() !== '') {
              const itemTypeMatches = matchingProducts.filter(p => 
                  p.name.includes(intent.item_type) || p.description.includes(intent.item_type) || p.tag.includes(intent.item_type)
              );
              if (itemTypeMatches.length < 2) {
                  const globalItemTypeMatches = products.filter(p => 
                      (p.name.includes(intent.item_type) || p.description.includes(intent.item_type) || p.tag.includes(intent.item_type))
                      && p.name.includes(targetGender)
                  );
                  if (globalItemTypeMatches.length >= 2) {
                      setCurrentIntent({ ...intent, main_style: '' });
                      setTimeout(() => {
                          const fallbackMsg = {
                              role: 'ai',
                              content: `抱歉，在【${intent.main_style}】风格下暂时没有为您找到足够的【${intent.item_type}】。不过我为您挑选了其他风格的【${intent.item_type}】，来看看有没有喜欢的吧！`,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          };
                          api.sendChatMessage(fallbackMsg).then(saved => setMessages(prev => [...prev, saved]));
                      }, 1500);
                      const subStyleTags = Array.from(new Set(globalItemTypeMatches.map(p => p.tag)));
                      const cards = subStyleTags.map(tag => {
                          const firstProduct = globalItemTypeMatches.find(p => p.tag === tag);
                          return {
                              id: tag,
                              name: tag,
                              image: firstProduct?.image,
                              isSubStyle: true
                          };
                      });
                      setSwipeCards(cards);
                      setSwipeIndex(0);
                      setLikedSubStyles([]);
                      setLikedProducts([]);
                      setTimeout(() => setViewMode('sub_style_swipe'), 1500);
                      return;
                  } else {
                      setCurrentIntent({ ...intent, item_type: '' }); // Clear item_type to fallback to general swipe
                      setTimeout(() => {
                          const fallbackMsg = {
                              role: 'ai',
                              content: `抱歉，目前暂时没有为您找到足够的【${intent.item_type}】。您可以看看【${intent.main_style}】风格下的其他款式推荐哦！`,
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          };
                          api.sendChatMessage(fallbackMsg).then(saved => setMessages(prev => [...prev, saved]));
                      }, 1500);
                      // Do NOT return here, let it fall through to show the general style cards
                  }
              } else {
                  // User wants both steps, so extract subStyleTags ONLY from matched items
                  const subStyleTags = Array.from(new Set(itemTypeMatches.map(p => p.tag)));
                  const cards = subStyleTags.map(tag => {
                      const firstProduct = itemTypeMatches.find(p => p.tag === tag);
                      return {
                          id: tag,
                          name: tag,
                          image: firstProduct?.image,
                          isSubStyle: true
                      };
                  });
                  
                  setSwipeCards(cards);
                  setSwipeIndex(0);
                  setLikedSubStyles([]);
                  setLikedProducts([]);
                  setTimeout(() => setViewMode('sub_style_swipe'), 1500);
                  return;
              }
          }
          
          const subStyleTags = Array.from(new Set(matchingProducts.map(p => p.tag)));
          if (subStyleTags.length > 0) {
              const cards = subStyleTags.map(tag => {
                  const firstProduct = matchingProducts.find(p => p.tag === tag);
                  return {
                      id: tag,
                      name: tag,
                      image: firstProduct?.image,
                      isSubStyle: true
                  };
              });
              
              setSwipeCards(cards);
              setSwipeIndex(0);
              setLikedSubStyles([]);
              setLikedProducts([]);
              setTimeout(() => setViewMode('sub_style_swipe'), 1500);
          }
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
                <ChatMessageContent msg={msg} />
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
            {viewMode === 'sub_style_swipe' && swipeCards.length > 0 && (
              <motion.div
                key="swipe"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full max-w-md aspect-[3/4]"
              >
                <div className="absolute top-[-40px] left-0 w-full text-center text-gray-500 font-medium tracking-widest text-sm uppercase">
                    1/2 探索风格偏好
                </div>
                
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
                    src={swipeCards[swipeIndex]?.image}
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
                      {swipeCards[swipeIndex]?.name}
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

            {viewMode === 'product_selection' && swipeCards.length > 0 && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full h-full flex flex-col max-w-3xl"
              >
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <h2 className="text-lg font-bold text-gray-900">2/2 挑选具体单品 <span className="text-gray-400 font-normal text-sm ml-2">请勾选你喜欢的单品</span></h2>
                </div>
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 pr-2">
                  {swipeCards.map((product) => {
                    const isSelected = likedProducts.some(p => p.id === product.id);
                    return (
                        <div
                          key={product.id}
                          onClick={() => {
                              if (isSelected) {
                                  setLikedProducts(prev => prev.filter(p => p.id !== product.id));
                              } else {
                                  setLikedProducts(prev => [...prev, product]);
                              }
                          }}
                          className={cn(
                            "bg-white rounded-xl p-3 shadow-sm cursor-pointer transition-all border-2 flex items-center gap-4",
                            isSelected ? "border-blue-600 ring-2 ring-blue-50 bg-blue-50/30" : "border-transparent hover:border-gray-200"
                          )}
                        >
                          <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{product.tag}</p>
                            <p className="text-sm font-bold text-gray-900 mt-2">{product.price}</p>
                          </div>
                          <div className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                              isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300"
                          )}>
                              {isSelected && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                        </div>
                    );
                  })}
                </div>
                <div className="shrink-0 pt-4 mt-2 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => {
                            // Save preferences
                            likedProducts.forEach(p => {
                                api.savePreference({ type: 'product_like', value: p.id.toString(), context: currentIntent?.context || 'AI Styling' }).catch(console.error);
                            });
                            
                            // Trigger results
                            setViewMode('results');
                            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const msgData = {
                              role: 'ai',
                              content: '收到你的挑选偏好啦！这是为你精准匹配的最佳组合推荐。',
                              time,
                              action: 'show_results'
                            };

                            const loadingId = Date.now();
                            setMessages(prev => [...prev, { id: loadingId, role: 'ai', content: 'AI 正在生成专属推荐...', isLoading: true }]);

                            api.sendChatMessage(msgData).then(saved => {
                              setMessages(prev => prev.map(m => m.id === loadingId ? saved : m));
                            }).catch(console.error);
                        }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={likedProducts.length === 0}
                    >
                        完成挑选 ({likedProducts.length})
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
                  <h2 className="text-lg font-bold text-gray-900">为你推荐 <span className="text-gray-400 font-normal text-sm ml-2">{recommendedProducts.length} 件单品</span></h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 pb-20">
                  {recommendedProducts.map((product) => (
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
