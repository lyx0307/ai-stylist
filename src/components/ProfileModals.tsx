import { motion, AnimatePresence } from 'motion/react';
import { X, Check, User, Ruler, Weight, Calendar, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegisterModalProps extends ModalProps {
  onRegister: (name: string, phone: string, password: string) => void;
}

export function RegisterModal({ isOpen, onClose, onRegister }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 z-10"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">欢迎加入 AI 造型师</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入您的昵称"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置登录密码"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => {
              if (name.trim() && phone.trim() && password.trim()) {
                onRegister(name, phone, password);
                onClose();
              }
            }}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            立即注册
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
}

interface UpdateMeasurementsModalProps extends ModalProps {
  initialHeight: string;
  initialWeight: string;
  onUpdate: (height: string, weight: string) => void;
}

export function UpdateMeasurementsModal({ isOpen, onClose, initialHeight, initialWeight, onUpdate }: UpdateMeasurementsModalProps) {
  const [height, setHeight] = useState(initialHeight);
  const [weight, setWeight] = useState(initialWeight);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 z-10"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">更新数字量体</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <Ruler size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">身高 (cm)</label>
              <input 
                type="number" 
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
              <Weight size={20} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">体重 (kg)</label>
              <input 
                type="number" 
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              onUpdate(height, weight);
              onClose();
            }}
            className="w-full bg-black text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-colors mt-2"
          >
            保存数据
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </motion.div>
    </div>
  );
}

interface SubscriptionModalProps extends ModalProps {}

const PLANS = [
  { id: 'week', label: '周会员', price: '¥9.9', period: '/周', desc: '短期体验' },
  { id: 'month', label: '月会员', price: '¥29.9', period: '/月', desc: '超值首选', popular: true },
  { id: 'quarter', label: '季会员', price: '¥79.9', period: '/季', desc: '进阶造型' },
  { id: 'year', label: '年会员', price: '¥299', period: '/年', desc: '尊享服务' },
];

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('month');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-700" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6 text-white">
            <div>
              <h2 className="text-2xl font-bold">升级 Pro 会员</h2>
              <p className="text-blue-100 text-sm mt-1">解锁专属风格分析报告与无限次 AI 搭配</p>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-1 shadow-sm grid grid-cols-2 gap-3 mb-6">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`
                  relative p-4 rounded-xl cursor-pointer border-2 transition-all
                  ${selectedPlan === plan.id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    HOT
                  </div>
                )}
                <div className="text-sm font-medium text-gray-900">{plan.label}</div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500">{plan.period}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{plan.desc}</div>
              </div>
            ))}
          </div>

          <button className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <CreditCard size={18} />
            立即订阅
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            订阅即代表同意《用户协议》与《隐私政策》
          </p>
        </div>
      </motion.div>
    </div>
  );
}
