import { useNavigate } from 'react-router';
import { CATEGORIES, MOCK_CARDS } from '../data/mock';
import {
  Camera, Sparkles, Lightbulb, Leaf, FlaskConical,
  Calculator, BookOpen, User, Globe, Utensils, Map, Palette, Search,
} from 'lucide-react';
import { createElement, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageHeader } from '../components/PageHeader';

const iconMap: Record<string, any> = {
  Sparkles, Lightbulb, Leaf, FlaskConical,
  Calculator, BookOpen, User, Globe, Utensils, Map, Palette,
};

const cardCounts = [38, 54, 27, 61, 19, 42, 33, 75, 22, 48];

// ─── AI Recognition Overlay ───────────────────────────────────────────────────

function AIRecognitionOverlay({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#292526]/92 backdrop-blur-sm"
        >
          {/* Scanning frame */}
          <div className="relative flex items-center justify-center mb-8">
            {/* Corner brackets */}
            <div className="absolute w-[160px] h-[160px]">
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-[#FDFDFD] rounded-tl-[6px]" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-[#FDFDFD] rounded-tr-[6px]" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-[#FDFDFD] rounded-bl-[6px]" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-[#FDFDFD] rounded-br-[6px]" />
            </div>

            {/* Scan line */}
            <motion.div
              className="absolute left-[10px] right-[10px] h-[2px] bg-gradient-to-r from-transparent via-[#FDFDFD]/80 to-transparent rounded-full"
              animate={{ top: ['10px', '148px', '10px'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />

            {/* Camera icon */}
            <div className="w-[160px] h-[160px] bg-white/5 rounded-[20px] flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Camera size={52} strokeWidth={1.5} className="text-[#FDFDFD]/80" />
              </motion.div>
            </div>
          </div>

          {/* Status text */}
          <motion.p
            className="text-[#FDFDFD] text-[16px] font-bold mb-2"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            AI 识别中…
          </motion.p>
          <p className="text-[#FDFDFD]/50 text-[12px]">正在分析图片内容，发现知识</p>

          {/* Dots */}
          <div className="flex gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-[#FDFDFD]/60 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Discover() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const gridCategories = CATEGORIES.filter((c) => c.id !== 'all');

  const filtered = searchQuery.trim()
    ? gridCategories.filter((c) => c.name.includes(searchQuery.trim()))
    : gridCategories;

  const handleAIRecognize = () => {
    if (isRecognizing) return;
    setIsRecognizing(true);
    // Mock recognition: pick a random card after ~2.5s
    setTimeout(() => {
      const randomCard = MOCK_CARDS[Math.floor(Math.random() * MOCK_CARDS.length)];
      setIsRecognizing(false);
      navigate(`/card/${randomCard.id}`);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {/* Header */}
      <PageHeader
        title="发现"
        subtitle="探索所有知识分类"
        showBack={false}
      />

      {/* Search bar */}
      <div className="px-5 pb-3 shrink-0">
        <div className="bg-[#FDFDFD] border border-[#DFDEDE] rounded-[14px] flex items-center gap-2 px-4 py-3 shadow-[0_2px_6px_rgba(41,37,38,0.04)]">
          <Search size={16} strokeWidth={2} className="text-[#878787] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索分类…"
            className="flex-1 bg-transparent text-[14px] text-[#121111] placeholder:text-[#DFDEDE] outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
        {/* AI Camera Banner */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAIRecognize}
          className="w-full bg-[#292526] rounded-[20px] p-5 flex items-center justify-between mb-5 shadow-[0_6px_20px_rgba(41,37,38,0.22)] active:opacity-90 transition-opacity"
        >
          <div className="text-left">
            <h3 className="text-[#FDFDFD] text-[15px] font-bold mb-1">AI 图片识别</h3>
            <p className="text-[#FDFDFD]/60 text-[12px]">拍一拍，发现未知世界</p>
          </div>
          <div className="w-[46px] h-[46px] bg-white/10 rounded-[100px] border border-white/15 flex items-center justify-center">
            <Camera size={22} strokeWidth={2} className="text-[#FDFDFD]" />
          </div>
        </motion.button>

        {/* Category Grid */}
        <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3">
          所有类目 · {filtered.length} 个
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#878787]">
            <p className="text-[14px]">没有找到「{searchQuery}」相关分类</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((cat, index) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/category/${cat.id}`)}
                className="bg-[#FDFDFD] rounded-[18px] p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(41,37,38,0.05)] border border-[#DFDEDE]/50 active:bg-[#F2F2F2] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#F2F2F2] rounded-[12px] flex items-center justify-center shrink-0">
                  {createElement(iconMap[cat.icon] || Sparkles, {
                    size: 20,
                    strokeWidth: 2,
                    className: 'text-[#292526]',
                  })}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#121111] truncate">{cat.name}</p>
                  <p className="text-[11px] text-[#878787] mt-0.5">
                    {cardCounts[index % cardCounts.length]} 张
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* AI Recognition Overlay */}
      <AIRecognitionOverlay visible={isRecognizing} />
    </div>
  );
}