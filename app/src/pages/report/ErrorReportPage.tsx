import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, XCircle, ChevronRight, Search, X, RefreshCw, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { correctionService } from '@/api';
import { correctionTypeLabel, mapCorrectionStatus, resolveImageUrl } from '@/api/mappers';
import type { ServerCorrection } from '@/api/types';
import { formatSemanticDate } from '@/lib/date';
import { format } from 'date-fns';

const PAGE_SIZE = 20;
const PULL_THRESHOLD = 60;

type Status = 'pending' | 'resolved' | 'rejected';

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  resolved: { label: '已采纳', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  pending:  { label: '审核中', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  rejected: { label: '未采纳', icon: XCircle, color: 'text-[#878787]', bg: 'bg-[#F2F2F2]' },
};

function groupByDate(items: ServerCorrection[]) {
  const groups: Array<{ label: string; items: ServerCorrection[] }> = [];
  const labelMap = new Map<string, ServerCorrection[]>();
  for (const item of items) {
    const label = formatSemanticDate(item.created_at);
    if (!labelMap.has(label)) labelMap.set(label, []);
    labelMap.get(label)!.push(item);
  }
  for (const [label, groupItems] of labelMap) {
    groups.push({ label, items: groupItems });
  }
  return groups;
}

export function ErrorReportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(() => searchParams.get('q') || '');
  const [submittedQuery, setSubmittedQuery] = useState(() => searchParams.get('q') || '');

  const [reports, setReports] = useState<ServerCorrection[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);
  const loadingRef = useRef(true);

  // Pull-to-refresh
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchCorrections = useCallback(async (query: string, pageNum: number) => {
    return correctionService.getCorrections({
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
    fetchCorrections(q, 1)
      .then((data) => {
        if (!cancelled) {
          setReports(data.list);
          setTotal(data.total);
          setHasMore(data.list.length === PAGE_SIZE);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) { setLoading(false); loadingRef.current = false; } });
    return () => { cancelled = true; };
  }, [submittedQuery, fetchCorrections]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || loadingRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const q = submittedQuery.trim();
      const nextPage = pageRef.current + 1;
      const data = await fetchCorrections(q, nextPage);
      if (data.list.length > 0) {
        setReports((prev) => [...prev, ...data.list]);
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
  }, [submittedQuery, hasMore, fetchCorrections]);

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
      fetchCorrections(q, 1)
        .then((data) => {
          setReports(data.list);
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

  const groups = groupByDate(reports);

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      <PageHeader
        title="纠错记录"
        subtitle={`共 ${total} 条纠错`}
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
            placeholder="搜索纠错记录…"
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
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-60 text-[#878787]"
          >
            <div className="w-16 h-16 bg-[#FDFDFD] rounded-[20px] border border-[#DFDEDE] flex items-center justify-center mb-4">
              <AlertCircle size={28} strokeWidth={1.5} className="text-[#DFDEDE]" />
            </div>
            <p className="text-[14px] font-medium text-[#787676]">
              {submittedQuery ? `没有找到「${submittedQuery}」相关纠错` : '还没有提交过纠错'}
            </p>
            {!submittedQuery && (
              <p className="text-[12px] text-[#878787] mt-1">发现问题时可以提交纠错哦</p>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {groups.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="text-[12px] font-medium text-[#878787] mb-2 px-1">
                  {group.label}
                </p>
                <div className="space-y-3">
                  {group.items.map((report, i) => {
                    const card = report.knowledge;
                    const cfg = STATUS_CONFIG[mapCorrectionStatus(report.status)];
                    const time = format(new Date(report.created_at), 'yyyy年M月d日 HH:mm');
                    return (
                      <motion.div
                        key={report.id}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.28, delay: i * 0.04 }}
                        onClick={() => navigate(`/error-reports/${report.id}`)}
                        className="bg-[#FDFDFD] rounded-[18px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] active:opacity-75 transition-opacity cursor-pointer"
                      >
                        {/* Card reference */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-[10px] overflow-hidden bg-[#F2F2F2] shrink-0">
                            {card && <img src={resolveImageUrl(card.resource_url)} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <p className="text-[12px] font-medium text-[#121111] line-clamp-1 flex-1">
                            {card?.title || '未知卡片'}
                          </p>
                        </div>

                        {/* Reason */}
                        <p className="text-[13px] text-[#787676] leading-relaxed mb-3 line-clamp-2">
                          {correctionTypeLabel(report.type)}：{report.description}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[#878787]">{time}</span>
                          <div className="flex items-center gap-2">
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-[100px] ${cfg.bg}`}>
                              <cfg.icon size={12} strokeWidth={2.5} className={cfg.color} />
                              <span className={`text-[11px] font-medium ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <ChevronRight size={14} strokeWidth={2} className="text-[#DFDEDE]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
            {loadingMore && (
              <p className="text-center text-[12px] text-[#878787] py-3">加载中...</p>
            )}
            {!hasMore && reports.length > 0 && (
              <p className="text-center text-[12px] text-[#DFDEDE] py-3">没有更多了</p>
            )}
          </AnimatePresence>
        )}

        {/* Info note */}
        {reports.length <= 0 && (
          <div className="bg-[#F2F2F2] rounded-[14px] p-3 border border-[#DFDEDE]/50 mt-3">
            <p className="text-[11px] text-[#878787] leading-relaxed text-center">
              纠错内容将由编辑团队在 3 个工作日内审核，感谢你为知识质量的贡献 ✨
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
