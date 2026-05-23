import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, RefreshCw, Sparkles, Clock, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { browseService, resolveImageUrl } from '@/api';
import type { ServerBrowseHistory } from '@/api/types';
import { PageHeader } from '@/components/PageHeader';
import { AIBottomSheet } from '@/components/AIBottomSheet';
import { SwipeToDeleteItem } from '@/components/SwipeToDeleteItem';
import { groupBySemanticDate } from '@/lib/date';
import { format } from 'date-fns';
import { toast } from 'sonner';

const PAGE_SIZE = 20;
const PULL_THRESHOLD = 60;

export function BrowseHistory() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState(() => searchParams.get('q') || '');

  const [items, setItems] = useState<ServerBrowseHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(true);
  const [aiSheet, setAiSheet] = useState<{ open: boolean; title: string; knowledgeId: string }>({ open: false, title: '', knowledgeId: '' });

  // Batch management
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Pull-to-refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHistory = useCallback(async (query: string, pageNum: number) => {
    return browseService.getBrowseHistory({
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
    // 搜索时重置滚动位置，避免触发 loadMore
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    fetchHistory(q, 1)
      .then((data) => {
        if (!cancelled) {
          setItems(data.list);
          setTotal(data.total);
          setHasMore(data.list.length === PAGE_SIZE);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setLoading(false); loadingRef.current = false; } });
    return () => { cancelled = true; };
  }, [submittedQuery, fetchHistory]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loadingRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const q = submittedQuery.trim();
      const nextPage = pageRef.current + 1;
      const data = await fetchHistory(q, nextPage);
      if (data.list.length > 0) {
        setItems((prev) => [...prev, ...data.list]);
        setTotal(data.total);
        setPage(nextPage);
        pageRef.current = nextPage;
        setHasMore(data.list.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch {
      // ignore
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [submittedQuery, hasMore, fetchHistory]);

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
      fetchHistory(q, 1)
        .then((data) => {
          setItems(data.list);
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

  // Delete single item
  const handleDelete = async (id: string) => {
    try {
      await browseService.removeBrowseHistory(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      toast.error('删除失败，请稍后重试');
    }
  };

  // Batch operations
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      await browseService.batchRemoveBrowseHistory(ids);
      setItems((prev) => prev.filter((item) => !selected.has(item.id)));
      setSelected(new Set());
      setBatchMode(false);
      toast.success(`已删除 ${ids.length} 条记录`);
    } catch {
      toast.error('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
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

  const groups = groupBySemanticDate(items);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      <PageHeader
        title="浏览历史"
        subtitle={`共 ${total} 条记录`}
        right={
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              if (batchMode) {
                setBatchMode(false);
                setSelected(new Set());
              } else {
                setBatchMode(true);
              }
            }}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            {batchMode ? (
              <X size={18} strokeWidth={2.5} className="text-[#121111]" />
            ) : (
              <CheckSquare size={18} strokeWidth={2} className="text-[#121111]" />
            )}
          </motion.button>
        }
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
            placeholder="搜索浏览历史…"
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
        className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6"
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
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-60 text-[#878787]"
          >
            <div className="w-16 h-16 bg-[#FDFDFD] rounded-[20px] border border-[#DFDEDE] flex items-center justify-center mb-4">
              <Clock size={28} strokeWidth={1.5} className="text-[#DFDEDE]" />
            </div>
            <p className="text-[14px] font-medium text-[#787676]">
              {submittedQuery ? `没有找到「${submittedQuery}」相关记录` : '还没有浏览记录'}
            </p>
            {!submittedQuery && (
              <p className="text-[12px] text-[#878787] mt-1">浏览知识卡片后会自动记录</p>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                {/* Date group label */}
                <p className="text-[12px] font-medium text-[#878787] mb-2 px-1">
                  {group.label}
                </p>

                <div className="space-y-3">
                  {group.items.map((item, i) => {
                    const imageUrl = resolveImageUrl(item.resource_url);
                    const viewTime = format(new Date(item.viewed_at), 'yyyy年M月d日 HH:mm');
                    const categoryName = item.category?.name || '未分类';

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.28, delay: i * 0.04 }}
                      >
                        <SwipeToDeleteItem
                          onDelete={() => handleDelete(item.id)}
                          disabled={batchMode}
                        >
                          <div
                            className="flex cursor-pointer active:opacity-80 transition-opacity"
                            onClick={() => {
                              if (batchMode) {
                                toggleSelect(item.id);
                              } else {
                                navigate(`/card/${item.knowledge_id}`);
                              }
                            }}
                          >
                            {/* Batch checkbox - outside card */}
                            {batchMode && (
                              <div className="w-8 shrink-0 flex items-center justify-center">
                                {selected.has(item.id) ? (
                                  <CheckSquare size={18} strokeWidth={2} className="text-[#292526]" />
                                ) : (
                                  <Square size={18} strokeWidth={2} className="text-[#DFDEDE]" />
                                )}
                              </div>
                            )}

                            {/* Card */}
                            <div className="flex-1 bg-[#FDFDFD] rounded-[18px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] flex">
                            {/* Thumbnail */}
                            <div className="w-[90px] shrink-0 bg-[#F2F2F2] relative">
                              <img
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-[#121111]/10" />
                              {/* Category tag - top left */}
                              <span className="absolute top-2 left-2 text-[9px] text-white bg-[#121111]/60 backdrop-blur-sm px-2 py-0.5 rounded-[100px]">
                                {categoryName}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                              <div>
                                <h3 className="text-[14px] font-bold text-[#121111] leading-snug line-clamp-2">
                                  {item.title}
                                </h3>
                                {item.content && (
                                  <p className="text-[12px] text-[#878787] mt-1.5 leading-snug line-clamp-1">
                                    {item.content}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex flex-col min-w-0">
                                  {item.source && (
                                    <div className="flex items-center gap-1 min-w-0">
                                      <div className="w-1 h-1 rounded-full bg-[#DFDEDE] shrink-0" />
                                      <span className="text-[10px] text-[#878787] truncate">{item.source}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Clock size={10} strokeWidth={2} className="text-[#878787] shrink-0" />
                                    <span className="text-[10px] text-[#878787]">{viewTime}</span>
                                  </div>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  className="w-7 h-7 bg-[#F2F2F2] rounded-[8px] flex items-center justify-center shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAiSheet({ open: true, title: item.title, knowledgeId: item.knowledge_id });
                                  }}
                                >
                                  <Sparkles size={13} strokeWidth={2} className="text-[#292526]" />
                                </motion.button>
                              </div>
                            </div>
                            </div>
                          </div>
                        </SwipeToDeleteItem>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
            {loadingMore && (
              <p className="text-center text-[12px] text-[#878787] py-3">加载中...</p>
            )}
            {!hasMore && items.length > 0 && (
              <p className="text-center text-[12px] text-[#DFDEDE] py-3">没有更多了</p>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Batch action bar */}
      <AnimatePresence>
        {batchMode && items.length > 0 && (
          <motion.div
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#FDFDFD] border-t border-[#DFDEDE] px-5 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(41,37,38,0.08)]"
          >
            <button
              onClick={toggleSelectAll}
              className="text-[13px] text-[#878787] font-medium"
            >
              {selected.size === items.length ? '取消全选' : '全选'}
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-[#878787]">
                已选 {selected.size} 项
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBatchDelete}
                disabled={selected.size === 0 || deleting}
                className="px-4 py-2 bg-[#FF3B30] text-white text-[13px] font-medium rounded-[100px] disabled:opacity-50"
              >
                {deleting ? '删除中...' : '删除'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
