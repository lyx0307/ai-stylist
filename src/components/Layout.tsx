import { useState } from 'react';
import React from 'react';
import { Search, Bell, User, Sparkles, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type View = 'home' | 'styling' | 'profile';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

export function Layout({ children, currentView, setCurrentView, onLogout }: LayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI 造型师</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setCurrentView('home')}
              className={cn(
                "text-sm font-medium transition-colors relative py-5",
                currentView === 'home' ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              首页
              {currentView === 'home' && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setCurrentView('styling')}
              className={cn(
                "text-sm font-medium transition-colors relative py-5",
                currentView === 'styling' ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              AI 造型
              {currentView === 'styling' && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={cn(
                "text-sm font-medium transition-colors relative py-5",
                currentView === 'profile' ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              个人中心
              {currentView === 'profile' && (
                <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white flex items-center border border-gray-200 rounded-full overflow-hidden pr-8"
                  >
                    <input 
                      type="text" 
                      placeholder="搜索单品..." 
                      className="w-full px-4 py-1.5 text-sm focus:outline-none"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-500 hover:text-gray-900 transition-colors relative z-10 p-2"
              >
                {isSearchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="text-gray-500 hover:text-gray-900 transition-colors relative p-2"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50"
                  >
                    <h3 className="text-sm font-bold text-gray-900 mb-3">通知</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">您的 AI 造型报告已生成</p>
                          <p className="text-xs text-gray-400 mt-1">10分钟前</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-1.5 bg-transparent rounded-full shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800">新品上架通知</p>
                          <p className="text-xs text-gray-400 mt-1">2小时前</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors"
              >
                <User size={16} />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 p-1 z-50"
                  >
                    <button 
                      onClick={() => {
                        setCurrentView('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <User size={16} />
                      个人中心
                    </button>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
