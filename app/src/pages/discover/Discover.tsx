import { useNavigate, useSearchParams } from 'react-router';
import { createPortal } from 'react-dom';
import { knowledgeService, discoverService, aiService, mapKnowledgeToCard } from '@/api';
import type { KnowledgeCard, HotSearchItem } from '@/types';
import {
  Camera, Search, X, Clock, TrendingUp, TrendingDown, Minus, ChevronRight, Flame,
} from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { getPortalTarget } from '@/lib/portal';

const MAX_RECENT = 8;

// ─── AI Recognition Overlay ───────────────────────────────────────────────────

function AIRecognitionOverlay({
  visible,
  result,
  onNavigate,
  onClose,
}: {
  visible: boolean;
  result: { knowledge_id?: string; result?: string } | null;
  onNavigate: () => void;
  onClose: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-primary/92 backdrop-blur-sm"
        >
          {!result ? (
            <>
              <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-[160px] h-[160px]">
                  <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-[#FDFDFD] rounded-tl-[6px]" />
                  <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-[#FDFDFD] rounded-tr-[6px]" />
                  <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-[#FDFDFD] rounded-bl-[6px]" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-[#FDFDFD] rounded-br-[6px]" />
                </div>
                <motion.div
                  className="absolute left-[10px] right-[10px] h-[2px] bg-gradient-to-r from-transparent via-[#FDFDFD]/80 to-transparent rounded-full"
                  animate={{ top: ['10px', '148px', '10px'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <div className="w-[160px] h-[160px] bg-white/5 rounded-[20px] flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Camera size={52} strokeWidth={1.5} className="text-[#FDFDFD]/80" />
                  </motion.div>
                </div>
              </div>
              <motion.p
                className="text-[#FDFDFD] text-[16px] font-bold mb-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                AI 识别中…
              </motion.p>
              <p className="text-[#FDFDFD]/50 text-[12px]">正在分析图片内容，发现知识</p>
              <div className="flex gap-1.5 mt-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-bg-card/60 rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-bg-card/10 rounded-[24px] flex items-center justify-center mb-6">
                  <Search size={36} strokeWidth={1.5} className="text-[#FDFDFD]" />
                </div>
                <p className="text-[#FDFDFD] text-[16px] font-bold mb-2">识别完成</p>
                <p className="text-[#FDFDFD]/60 text-[13px] mb-8 px-8 text-center leading-relaxed">
                  {result.knowledge_id ? '已为你找到相关知识卡片' : `识别结果：${result.result}`}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-bg-card/15 text-[#FDFDFD] rounded-[100px] text-[14px] font-medium"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onNavigate}
                    className="px-6 py-3 bg-bg-card text-primary rounded-[100px] text-[14px] font-bold"
                  >
                    {result.knowledge_id ? '查看详情' : '搜索'}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    getPortalTarget()
  );
}

// ─── Search Result Card ──────────────────────────────────────────────────────

function SearchResultCard({ card, onClick }: { card: KnowledgeCard; onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-bg-card rounded-[16px] p-3 flex items-center gap-3 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] text-left"
    >
      <div className="w-[60px] h-[60px] rounded-[12px] bg-bg-page overflow-hidden shrink-0">
        <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-text-main truncate">{card.title}</p>
        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{card.description}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] px-2 py-0.5 bg-bg-page rounded-[100px] text-text-muted">{card.category}</span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Hot Search Item ─────────────────────────────────────────────────────────

function HotSearchItemRow({ item, onClick }: { item: HotSearchItem; onClick: () => void }) {
  const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
  const trendColor = item.trend === 'up' ? 'text-[#FF4D4F]' : item.trend === 'down' ? 'text-[#52C41A]' : 'text-text-muted';
  const isTop3 = item.rank <= 3;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 px-1 text-left"
    >
      <span className={`text-[14px] font-bold w-5 text-center ${isTop3 ? 'text-[#FF4D4F]' : 'text-text-muted'}`}>
        {item.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-text-main truncate">{item.keyword}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isTop3 && <Flame size={12} strokeWidth={2} className="text-[#FF4D4F]" />}
        <TrendIcon size={12} strokeWidth={2} className={trendColor} />
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Discover() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState(() => searchParams.get('q') || '');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{ knowledge_id?: string; result?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  const [hotSearches, setHotSearches] = useState<HotSearchItem[]>([]);

  useEffect(() => {
    discoverService.getHotSearches().then(setHotSearches).catch(() => {});
  }, []);

  const top10HotSearches = hotSearches.slice(0, 10);

  const [searchResults, setSearchResults] = useState<KnowledgeCard[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const searchPageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(false);
  const searchScrollRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const q = submittedQuery.trim();
    if (!q) { setSearchResults([]); setSearchPage(1); searchPageRef.current = 1; setHasMore(true); loadingRef.current = false; loadingMoreRef.current = false; return; }
    let cancelled = false;
    loadingMoreRef.current = false;
    loadingRef.current = true;
    if (searchScrollRef.current) searchScrollRef.current.scrollTop = 0;
    knowledgeService.getKnowledgeList({ keyword: q, page: 1, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) {
          setSearchResults(data.list.map(mapKnowledgeToCard));
          setSearchPage(1);
          searchPageRef.current = 1;
          setHasMore(data.list.length >= PAGE_SIZE);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) loadingRef.current = false; });
    return () => { cancelled = true; };
  }, [submittedQuery]);

  const loadMore = useCallback(async () => {
    const q = submittedQuery.trim();
    if (!q || loadingMoreRef.current || loadingRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage = searchPageRef.current + 1;
      const data = await knowledgeService.getKnowledgeList({ keyword: q, page: nextPage, pageSize: PAGE_SIZE });
      setSearchResults((prev) => [...prev, ...data.list.map(mapKnowledgeToCard)]);
      setSearchPage(nextPage);
      searchPageRef.current = nextPage;
      setHasMore(data.list.length >= PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [submittedQuery, hasMore]);

  const addRecentSearch = useCallback((query: string) => {
    const q = query.trim();
    if (!q) return;
    setRecentSearches((prev) => {
      const next = [q, ...prev.filter((s) => s !== q)].slice(0, MAX_RECENT);
      localStorage.setItem('recentSearches', JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== term);
      localStorage.setItem('recentSearches', JSON.stringify(next));
      return next;
    });
    setPressedTerm(null);
  }, []);

  const [pressedTerm, setPressedTerm] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = useCallback((term: string) => {
    longPressTimer.current = setTimeout(() => {
      setPressedTerm(term);
    }, 500);
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    if (!pressedTerm) return;
    const dismiss = () => setPressedTerm(null);
    document.addEventListener('click', dismiss);
    return () => document.removeEventListener('click', dismiss);
  }, [pressedTerm]);

  const executeSearch = useCallback(() => {
    const q = inputValue.trim();
    if (!q) return;
    setSubmittedQuery(q);
    setSearchParams({ q }, { replace: true });
    addRecentSearch(q);
  }, [inputValue, addRecentSearch, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const handleHotItemClick = (item: HotSearchItem) => {
    setInputValue(item.keyword);
    setSubmittedQuery(item.keyword);
    setSearchParams({ q: item.keyword }, { replace: true });
    addRecentSearch(item.keyword);
  };

  const handleRecentClick = (term: string) => {
    setInputValue(term);
    setSubmittedQuery(term);
    setSearchParams({ q: term }, { replace: true });
  };

  const handleClearInput = () => {
    setInputValue('');
    setSubmittedQuery('');
    setSearchParams({}, { replace: true });
  };

  const handleAIRecognize = () => {
    if (isRecognizing) return;
    setRecognitionResult(null);
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsRecognizing(true);
    setRecognitionResult(null);
    try {
      const result = await aiService.recognizeImage(file);
      setRecognitionResult(result);
    } catch {
      toast.error('识别失败，请稍后重试');
      setIsRecognizing(false);
    }
  };

  const handleRecognitionNavigate = () => {
    if (recognitionResult?.knowledge_id) {
      navigate(`/card/${recognitionResult.knowledge_id}`);
    } else if (recognitionResult?.result) {
      setInputValue(recognitionResult.result);
      setSubmittedQuery(recognitionResult.result);
      setSearchParams({ q: recognitionResult.result }, { replace: true });
      addRecentSearch(recognitionResult.result);
    }
    setIsRecognizing(false);
    setRecognitionResult(null);
  };

  const closeRecognition = () => {
    setIsRecognizing(false);
    setRecognitionResult(null);
  };

  const isSearching = submittedQuery.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-bg-page relative">
      {/* Header with AI button */}
      <PageHeader
        title="发现"
        subtitle="搜索所有知识卡片"
        showBack={false}
        right={
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleAIRecognize}
            className="w-[38px] h-[38px] bg-primary rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(41,37,38,0.2)]"
          >
            <Camera size={18} strokeWidth={2} className="text-[#FDFDFD]" />
          </motion.button>
        }
      />

      {/* Search bar */}
      <div className="px-5 pb-3 shrink-0">
        <div className="bg-bg-card border border-border rounded-[14px] flex items-center gap-2 px-4 py-3 shadow-[0_2px_6px_rgba(41,37,38,0.04)]">
          <Search size={16} strokeWidth={2} className="text-text-muted shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索知识卡片…"
            className="flex-1 bg-transparent text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
          />
          {inputValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.8 }}
              onClick={handleClearInput}
              className="w-5 h-5 rounded-full bg-border flex items-center justify-center shrink-0"
            >
              <X size={12} strokeWidth={2.5} className="text-text-muted" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={executeSearch}
            className="px-3 py-1 bg-primary text-[#FDFDFD] text-[13px] font-medium rounded-[100px] shrink-0"
          >
            搜索
          </motion.button>
        </div>
      </div>

      <div
        ref={searchScrollRef}
        className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6"
        onScroll={(e) => {
          if (!isSearching) return;
          const el = e.currentTarget;
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
            loadMore();
          }
        }}
      >
        {isSearching ? (
          /* Search Results */
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3">
              搜索结果 · {searchResults.length} 张
            </p>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                <Search size={32} strokeWidth={1.5} className="text-[#DFDEDE] mb-3" />
                <p className="text-[14px]">没有找到「{submittedQuery}」相关卡片</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {searchResults.map((card) => (
                  <SearchResultCard
                    key={card.id}
                    card={card}
                    onClick={() => navigate(`/card/${card.id}`)}
                  />
                ))}
                {loadingMore && (
                  <p className="text-center text-[12px] text-text-muted py-3">加载中...</p>
                )}
                {!hasMore && searchResults.length > 0 && (
                  <p className="text-center text-[12px] text-[#DFDEDE] py-3">没有更多了</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                    最近搜索
                  </p>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] text-text-muted active:text-text-main"
                  >
                    清除
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[calc(3*2.56rem+2*0.25rem)] overflow-y-auto">
                  {recentSearches.map((term) => (
                    <motion.button
                      key={term}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        if (pressedTerm === term) {
                          e.stopPropagation();
                          return;
                        }
                        handleRecentClick(term);
                      }}
                      onPointerDown={() => handlePointerDown(term)}
                      onPointerUp={clearLongPressTimer}
                      onPointerLeave={clearLongPressTimer}
                      className="flex items-center gap-1.5 px-3 py-2 bg-bg-card border border-border rounded-[100px] text-[13px] text-text-main shadow-[0_1px_4px_rgba(41,37,38,0.04)] max-w-full"
                    >
                      {pressedTerm === term ? (
                        <>
                          <X
                            size={12}
                            strokeWidth={2}
                            className="text-[#FF4D4F] shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(term);
                            }}
                          />
                          <span className="truncate">{term.length > 8 ? term.slice(0, 8) + '...' : term}</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} strokeWidth={2} className="text-text-muted shrink-0" />
                          <span className="truncate">{term.length > 8 ? term.slice(0, 8) + '...' : term}</span>
                        </>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Hot Search Ranking */}
            {top10HotSearches.length > 0 && (
            <div className="bg-bg-card rounded-[20px] border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <Flame size={16} strokeWidth={2} className="text-[#FF4D4F]" />
                  <p className="text-[15px] font-bold text-text-main">热搜榜单</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/hot-searches')}
                  className="flex items-center gap-0.5 text-[12px] text-text-muted"
                >
                  查看全部
                  <ChevronRight size={14} strokeWidth={2} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 divide-x divide-border">
                {/* Left column: rank 1-5 */}
                <div className="px-3 pb-2">
                  {top10HotSearches.slice(0, 5).map((item) => (
                    <HotSearchItemRow
                      key={item.rank}
                      item={item}
                      onClick={() => handleHotItemClick(item)}
                    />
                  ))}
                </div>
                {/* Right column: rank 6-10 */}
                <div className="px-3 pb-2">
                  {top10HotSearches.slice(5, 10).map((item) => (
                    <HotSearchItemRow
                      key={item.rank}
                      item={item}
                      onClick={() => handleHotItemClick(item)}
                    />
                  ))}
                </div>
              </div>
            </div>
            )}
          </>
        )}
      </div>

      {/* AI Recognition Overlay */}
      <AIRecognitionOverlay
        visible={isRecognizing}
        result={recognitionResult}
        onNavigate={handleRecognitionNavigate}
        onClose={closeRecognition}
      />

      {/* Hidden file input for camera/gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelected}
      />
    </div>
  );
}
