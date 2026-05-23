import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Search, X, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { favoriteService, mapKnowledgeToCard } from '@/api';
import type { KnowledgeCard } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { AIBottomSheet } from '@/components/AIBottomSheet';

const PAGE_SIZE = 20;
const PULL_THRESHOLD = 60;

export function Favorites() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState(() => searchParams.get('q') || '');

  const [saved, setSaved] = useState<KnowledgeCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [aiSheet, setAiSheet] = useState<{ open: boolean; title: string; knowledgeId: string }>({ open: false, title: '', knowledgeId: '' });

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch favorites list
  const fetchFavorites = useCallback(async (query: string, pageNum: number) => {
    return favoriteService.getFavorites({
      page: pageNum,
      pageSize: PAGE_SIZE,
      keyword: query || undefined,
    });
  }, []);

  // Initial load & search
  useEffect(() => {
    let cancelled = false;
    const q = submittedQuery.trim();
    setLoading(true);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    loadingMoreRef.current = false;
    loadingRef.current = true;
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    fetchFavorites(q, 1)
      .then((data) => {
        if (!cancelled) {
          setSaved(data.list.map(mapKnowledgeToCard));
          setTotal(data.total);
          setHasMore(data.list.length === PAGE_SIZE);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setLoading(false); loadingRef.current = false; } });
    return () => { cancelled = true; };
  }, [submittedQuery, fetchFavorites]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loadingRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const q = submittedQuery.trim();
      const nextPage = pageRef.current + 1;
      const data = await fetchFavorites(q, nextPage);
      const newCards = data.list.map(mapKnowledgeToCard);
      if (newCards.length > 0) {
        setSaved((prev) => [...prev, ...newCards]);
        setTotal(data.total);
        setPage(nextPage);
        pageRef.current = nextPage;
        setHasMore(newCards.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // ignore
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [submittedQuery, hasMore, fetchFavorites]);

  // Pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 0 && !refreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || refreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, 100));
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;
    if (pullDistance >= PULL_THRESHOLD) {
      setRefreshing(true);
      setPullDistance(40);
      loadingMoreRef.current = false;
      loadingRef.current = true;
      const q = submittedQuery.trim();
      fetchFavorites(q, 1)
        .then((data) => {
          setSaved(data.list.map(mapKnowledgeToCard));
          setTotal(data.total);
          setPage(1);
          pageRef.current = 1;
          setHasMore(data.list.length === PAGE_SIZE);
        })
        .catch(() => {})
        .finally(() => {
          loadingRef.current = false;
          setTimeout(() => {
            setRefreshing(false);
            setPullDistance(0);
          }, 1000);
        });
    } else {
      setPullDistance(0);
    }
  };

  // Toggle favorite (unfavorite from this page)
  const handleToggleFavorite = async (id: string) => {
    if (toggling) return;
    setToggling(id);
    try {
      await favoriteService.removeFavorite(id);
      setSaved((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // keep state on error
    } finally {
      setToggling(null);
    }
  };

  const executeSearch = useCallback(() => {
    const q = inputValue.trim();
    setSubmittedQuery(q);
    if (q) {
      setSearchParams({ q }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [inputValue, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') executeSearch();
  };

  const handleClearInput = () => {
    setInputValue('');
    setSubmittedQuery('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      <PageHeader
        title="我的收藏"
        subtitle={`共 ${total} 张知识卡片`}
      />

      {/* Search bar */}
      <div className="px-5 pb-3 shrink-0">
        <div className="bg-[#FDFDFD] border border-[#DFDEDE] rounded-[14px] flex items-center gap-2 px-4 py-3 shadow-[0_2px_6px_rgba(41,37,38,0.04)]">
          <Search size={16} strokeWidth={2} className="text-[#878787] shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索收藏的知识卡片…"
            className="flex-1 bg-transparent text-[14px] text-[#121111] placeholder:text-[#DFDEDE] outline-none"
          />
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleClearInput}
              className="w-5 h-5 rounded-full bg-[#DFDEDE] flex items-center justify-center shrink-0"
            >
              <X size={12} strokeWidth={2.5} className="text-[#878787]" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={executeSearch}
            className="px-3 py-1 bg-[#292526] text-[#FDFDFD] text-[13px] font-medium rounded-[100px] shrink-0"
          >
            搜索
          </motion.button>
        </div>
      </div>

      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-all shrink-0"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <div className="flex items-center gap-2 py-2">
          <motion.div
            animate={refreshing ? { rotate: 360 } : { rotate: pullDistance >= PULL_THRESHOLD ? 180 : 0 }}
            transition={refreshing ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
          >
            <RefreshCw size={16} strokeWidth={2} className="text-[#878787]" />
          </motion.div>
          <span className="text-[12px] text-[#878787]">
            {refreshing ? '刷新中...' : pullDistance >= PULL_THRESHOLD ? '松开刷新' : '下拉刷新'}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onScroll={(e) => {
          if (pullDistance > 0 && !isPulling.current) setPullDistance(0);
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
            loadMore();
          }
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-60">
            <motion.div
              className="w-6 h-6 border-2 border-[#DFDEDE] border-t-[#292526] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : saved.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-60 text-[#878787]"
          >
            <div className="w-16 h-16 bg-[#FDFDFD] rounded-[20px] border border-[#DFDEDE] flex items-center justify-center mb-4">
              <Star size={28} strokeWidth={1.5} className="text-[#DFDEDE]" />
            </div>
            <p className="text-[14px] font-medium text-[#787676]">
              {submittedQuery ? `没有找到「${submittedQuery}」相关收藏` : '还没有收藏任何卡片'}
            </p>
            {!submittedQuery && (
              <p className="text-[12px] text-[#878787] mt-1">在首页点击 ☆ 收藏感兴趣的知识</p>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {saved.map((card, i) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: toggling === card.id ? 0.5 : 1, y: 0, scale: toggling === card.id ? 0.97 : 1 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, delay: i * 0.04 }}
                className="bg-[#FDFDFD] rounded-[18px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] flex cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => navigate(`/card/${card.id}`)}
              >
                {/* Thumbnail */}
                <div className="w-[90px] shrink-0 bg-[#F2F2F2] relative">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#121111]/10" />
                  {/* Category tag - top left */}
                  <span className="absolute top-2 left-2 text-[9px] text-white bg-[#121111]/60 backdrop-blur-sm px-2 py-0.5 rounded-[100px]">
                    {card.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-[14px] font-bold text-[#121111] leading-snug line-clamp-2">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="text-[12px] text-[#878787] mt-1.5 leading-snug line-clamp-1">
                        {card.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <div className="w-1 h-1 rounded-full bg-[#DFDEDE] shrink-0" />
                      <span className="text-[10px] text-[#878787] truncate">{card.source}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-7 h-7 bg-[#F2F2F2] rounded-[8px] flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiSheet({ open: true, title: card.title, knowledgeId: card.id });
                        }}
                      >
                        <Sparkles size={13} strokeWidth={2} className="text-[#292526]" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-7 h-7 bg-[#F2F2F2] rounded-[8px] flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(card.id);
                        }}
                      >
                        <Star size={13} strokeWidth={2} className="text-[#292526] fill-[#292526]" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {loadingMore && (
              <p className="text-center text-[12px] text-[#878787] py-3">加载中...</p>
            )}
            {!hasMore && saved.length > 0 && (
              <p className="text-center text-[12px] text-[#DFDEDE] py-3">没有更多了</p>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* AI Bottom Sheet */}
      <AIBottomSheet
        isOpen={aiSheet.open}
        onClose={() => setAiSheet({ open: false, title: '', knowledgeId: '' })}
        title={aiSheet.title}
        knowledgeId={aiSheet.knowledgeId}
      />
    </div>
  );
}
