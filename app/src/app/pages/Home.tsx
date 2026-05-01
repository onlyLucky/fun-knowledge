import { createElement, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal, CheckCircle2, Check,
  Sparkles, Lightbulb, Leaf, FlaskConical,
  Calculator, BookOpen, User, Globe, Utensils, Map, Palette,
} from 'lucide-react';
import { CATEGORIES, MOCK_CARDS } from '../data/mock';
import { KnowledgeCard } from '../components/KnowledgeCard';
import { AIBottomSheet } from '../components/AIBottomSheet';
import { PageHeader } from '../components/PageHeader';
import { clsx } from 'clsx';

const iconMap: Record<string, any> = {
  Sparkles, Lightbulb, Leaf, FlaskConical,
  Calculator, BookOpen, User, Globe, Utensils, Map, Palette,
};

// ─── Category Filter Modal ────────────────────────────────────────────────────

function CategoryModal({
  open,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#121111]/50 z-40 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#FDFDFD] rounded-t-[24px] shadow-[0_-8px_30px_rgba(41,37,38,0.14)]"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#DFDEDE] rounded-full" />
            </div>

            {/* Title */}
            <div className="px-5 pt-3 pb-4 border-b border-[#F2F2F2]">
              <p className="text-[16px] font-bold text-[#121111]">选择分类</p>
              <p className="text-[12px] text-[#878787] mt-0.5">筛选你感兴趣的知识类目</p>
            </div>

            {/* Grid */}
            <div className="px-5 py-4 grid grid-cols-3 gap-2.5 max-h-[52vh] overflow-y-auto no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isActive = selected === cat.id;
                const IconComp = iconMap[cat.icon] || Sparkles;
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { onSelect(cat.id); onClose(); }}
                    className={clsx(
                      'relative flex flex-col items-center gap-2 py-3.5 px-2 rounded-[16px] transition-colors',
                      isActive
                        ? 'bg-[#292526]'
                        : 'bg-[#F2F2F2] active:bg-[#DFDEDE]'
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2">
                        <Check size={11} strokeWidth={3} className="text-[#FDFDFD]/80" />
                      </div>
                    )}
                    <div className={clsx(
                      'w-9 h-9 rounded-[12px] flex items-center justify-center',
                      isActive ? 'bg-white/15' : 'bg-[#FDFDFD]'
                    )}>
                      {createElement(IconComp, {
                        size: 18,
                        strokeWidth: 2,
                        className: isActive ? 'text-[#FDFDFD]' : 'text-[#292526]',
                      })}
                    </div>
                    <p className={clsx(
                      'text-[12px] font-medium text-center leading-tight',
                      isActive ? 'text-[#FDFDFD]' : 'text-[#121111]'
                    )}>
                      {cat.name}
                    </p>
                  </motion.button>
                );
              })}
            </div>

            <div className="px-5 pb-6 pt-1">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full py-3.5 rounded-[14px] border border-[#DFDEDE] text-[14px] font-medium text-[#878787]"
              >
                关闭
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [viewedCount, setViewedCount] = useState(0);

  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [activeCardTitle, setActiveCardTitle] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const filteredCards =
    activeCategory === 'all'
      ? MOCK_CARDS
      : MOCK_CARDS.filter(
          (c) =>
            CATEGORIES.find((cat) => cat.id === activeCategory)?.name ===
            c.category
        );

  const handleSwipeUp = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      if (viewedCount < 5) setViewedCount((prev) => prev + 1);
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleCheckIn = () => {
    if (viewedCount >= 3 && !hasCheckedIn) setHasCheckedIn(true);
  };

  const openAISheet = (title: string) => {
    setActiveCardTitle(title);
    setIsAISheetOpen(true);
  };

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setCurrentIndex(0);
  };

  const activeCategoryName =
    CATEGORIES.find((c) => c.id === activeCategory)?.name ?? '全部';

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {/* Top Header */}
      <PageHeader
        title="冷知识星球"
        subtitle={`当前：${activeCategoryName}`}
        showBack={false}
        right={
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowCategoryModal(true)}
            className="w-[38px] h-[38px] bg-[#292526] rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(41,37,38,0.2)]"
          >
            <SlidersHorizontal size={18} strokeWidth={2} className="text-[#FDFDFD]" />
          </motion.button>
        }
      />

      {/* Categories */}
      <div className="overflow-x-auto no-scrollbar px-5 pb-3 shrink-0">
        <div className="flex space-x-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelectCategory(category.id)}
              className={clsx(
                'whitespace-nowrap px-4 py-2 rounded-[100px] text-[13px] font-medium transition-all duration-200 shrink-0',
                activeCategory === category.id
                  ? 'bg-[#292526] text-[#FDFDFD] shadow-[0_2px_8px_rgba(41,37,38,0.2)]'
                  : 'bg-[#FDFDFD] text-[#787676] border border-[#DFDEDE]'
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Check-in toast banner */}
      <AnimatePresence>
        {viewedCount >= 3 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 40, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={clsx(
              'flex items-center justify-center gap-2 text-[12px] font-medium cursor-pointer shrink-0 overflow-hidden',
              hasCheckedIn
                ? 'bg-[#FDFDFD] text-[#787676]'
                : 'bg-[#292526] text-[#FDFDFD]'
            )}
            onClick={handleCheckIn}
          >
            <CheckCircle2 size={14} strokeWidth={2.5} />
            {hasCheckedIn
              ? '今日已打卡 ✓'
              : `已浏览 ${viewedCount} 张，点击打卡`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence>
          {filteredCards.length > 0 ? (
            filteredCards.map((card, index) => {
              if (index < currentIndex || index > currentIndex + 1) return null;
              return (
                <KnowledgeCard
                  key={card.id}
                  card={card}
                  isActive={index === currentIndex}
                  onSwipeUp={handleSwipeUp}
                  onSwipeDown={handleSwipeDown}
                  onAIOpen={openAISheet}
                  zIndex={filteredCards.length - index}
                />
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-[#878787]"
            >
              <p className="text-[14px]">这个类目下还没有卡片哦</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        {filteredCards.length > 0 && (
          <div className="absolute top-4 right-5 z-10 flex flex-col gap-1">
            {filteredCards.slice(0, Math.min(filteredCards.length, 5)).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'rounded-[100px] transition-all duration-300',
                  i === currentIndex
                    ? 'w-1.5 h-4 bg-[#292526]'
                    : 'w-1.5 h-1.5 bg-[#DFDEDE]'
                )}
              />
            ))}
          </div>
        )}

        {currentIndex === filteredCards.length - 1 && filteredCards.length > 0 && (
          <div className="absolute bottom-5 left-0 right-0 text-center text-[#878787] text-[11px] pointer-events-none z-0">
            已经到底啦，换个类目看看吧～
          </div>
        )}
      </div>

      <AIBottomSheet
        isOpen={isAISheetOpen}
        onClose={() => setIsAISheetOpen(false)}
        title={activeCardTitle}
      />

      {/* Category Filter Modal */}
      <CategoryModal
        open={showCategoryModal}
        selected={activeCategory}
        onSelect={handleSelectCategory}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
}