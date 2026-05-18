import { createElement, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SlidersHorizontal, CheckCircle2, Check,
  Sparkles, Leaf, Atom,Layers,CloudSun,
  Calculator, User, Utensils, Map, Palette,PawPrint,Volleyball,Earth,Gamepad2,Cpu,
} from 'lucide-react';
import { knowledgeService, categoryService, mapKnowledgeToCard, mapServerCategory } from '@/api';
import type { KnowledgeCard as KnowledgeCardType } from '@/types';
import { KnowledgeCard } from '@/components/KnowledgeCard';
import { AIBottomSheet } from '@/components/AIBottomSheet';
import { PageHeader } from '@/components/PageHeader';
import { clsx } from 'clsx';

const iconMap: Record<string, any> = {
  Layers,Utensils,CloudSun,Atom, Calculator, Map, PawPrint, Leaf, User,Volleyball,Palette,Earth,Gamepad2,Cpu,Sparkles,
};

// ─── Category Filter Modal ────────────────────────────────────────────────────

function CategoryModal({
  open,
  selected,
  onSelect,
  onClose,
  categories,
}: {
  open: boolean;
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  categories: { id: string; name: string; icon: string }[];
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
              {categories.map((cat) => {
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
  const [checkInDismissed, setCheckInDismissed] = useState(false);
  const [viewedCount, setViewedCount] = useState(0);

  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [activeCardId, setActiveCardId] = useState('');
  const [activeCardTitle, setActiveCardTitle] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([]);
  const PAGE_SIZE = 20;
  const PRELOAD_THRESHOLD = PAGE_SIZE / 2; // 预加载阈值：10

  const [cards, setCards] = useState<KnowledgeCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  // 加载首页数据
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        const [serverCats, serverCards] = await Promise.all([
          categoryService.getCategories(),
          activeCategory === 'all'
            ? knowledgeService.getRecommendations({ page: 1, pageSize: PAGE_SIZE })
            : knowledgeService.getKnowledgeList({ category_id: activeCategory, page: 1, pageSize: PAGE_SIZE }),
        ]);
        if (cancelled) return;
        setCategories([
          { id: 'all', name: '全部', icon: 'Layers' },
          ...serverCats.map(mapServerCategory),
        ]);
        setCards(serverCards.list.map(mapKnowledgeToCard));
        setHasMore(serverCards.list.length === PAGE_SIZE);
      } catch {
        // keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeCategory]);

  // 加载更多数据
  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = activeCategory === 'all'
        ? await knowledgeService.getRecommendations({ page: nextPage, pageSize: PAGE_SIZE })
        : await knowledgeService.getKnowledgeList({ category_id: activeCategory, page: nextPage, pageSize: PAGE_SIZE });
      const newCards = result.list.map(mapKnowledgeToCard);
      if (newCards.length > 0) {
        setCards((prev) => [...prev, ...newCards]);
        setPage(nextPage);
        setHasMore(newCards.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // ignore load more errors
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const filteredCards = cards;

  const handleSwipeUp = () => {
    if (currentIndex < filteredCards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (viewedCount < 5) setViewedCount((prev) => prev + 1);
      // 预加载：当滑动到当前页一半时加载下一页
      if (nextIndex >= page * PAGE_SIZE - PRELOAD_THRESHOLD && hasMore) {
        loadMore();
      }
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleCheckIn = () => {
    if (viewedCount >= 3 && !hasCheckedIn) {
      setHasCheckedIn(true);
      setTimeout(() => setCheckInDismissed(true), 3000);
    }
  };

  const openAISheet = (id: string, title: string) => {
    setActiveCardId(id);
    setActiveCardTitle(title);
    setIsAISheetOpen(true);
  };

  const handleSave = () => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
    }
    exitTimerRef.current = setTimeout(() => {
      handleSwipeUp();
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setCurrentIndex(0);
  };

  const activeCategoryName =
    categories.find((c) => c.id === activeCategory)?.name ?? '全部';

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
          {categories.map((category) => (
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
        {viewedCount >= 3 && !checkInDismissed && (
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
                  onSave={handleSave}
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

        {currentIndex === filteredCards.length - 1 && filteredCards.length > 0 && !hasMore && (
          <div className="absolute bottom-5 left-0 right-0 text-center text-[#878787] text-[11px] pointer-events-none z-0">
            已经到底啦，换个类目看看吧～
          </div>
        )}
        {loadingMore && (
          <div className="absolute bottom-5 left-0 right-0 text-center text-[#878787] text-[11px] pointer-events-none z-0">
            加载中...
          </div>
        )}
      </div>

      <AIBottomSheet
        isOpen={isAISheetOpen}
        onClose={() => setIsAISheetOpen(false)}
        title={activeCardTitle}
        knowledgeId={activeCardId}
      />

      {/* Category Filter Modal */}
      <CategoryModal
        open={showCategoryModal}
        selected={activeCategory}
        onSelect={handleSelectCategory}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
      />
    </div>
  );
}