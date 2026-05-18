import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, AlertCircle, Sparkles, ChevronLeft } from 'lucide-react';
import { knowledgeService, favoriteService, mapKnowledgeToCard } from '@/api';
import type { KnowledgeCard } from '@/types';
import { AIBottomSheet } from '@/components/AIBottomSheet';
import { ErrorReportSheet } from '@/components/ErrorReportSheet';

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<KnowledgeCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    knowledgeService.getKnowledgeById(id)
      .then((data) => { if (!cancelled) setCard(mapKnowledgeToCard(data)); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const [saved, setSaved] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showAISheet, setShowAISheet] = useState(false);

  const toggleFavorite = async () => {
    if (!id) return;
    const next = !saved;
    setSaved(next);
    try {
      if (next) await favoriteService.addFavorite(id);
      else await favoriteService.removeFavorite(id);
    } catch {
      setSaved(!next);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-[#F2F2F2]">
        <div className="flex items-center px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
          </motion.button>
        </div>
        <div className="flex-1 flex items-center justify-center text-[#878787] text-[14px]">
          加载中...
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex flex-col h-full bg-[#F2F2F2]">
        <div className="flex items-center px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
          </motion.button>
        </div>
        <div className="flex-1 flex items-center justify-center text-[#878787] text-[14px]">
          找不到该卡片
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      {/* Header */}
      <div className="bg-[#F2F2F2] pt-safe shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleFavorite}
              className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
            >
              <Star
                size={17}
                strokeWidth={2}
                className={saved ? 'text-[#292526] fill-[#292526]' : 'text-[#878787]'}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowReportSheet(true)}
              className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
            >
              <AlertCircle size={17} strokeWidth={2} className="text-[#878787]" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Hero image */}
        <div className="mx-5 rounded-[20px] overflow-hidden h-[220px] relative shadow-[0_6px_20px_rgba(41,37,38,0.12)]">
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute top-3 left-3 bg-[#292526]/80 backdrop-blur-sm text-[#FDFDFD] text-[11px] px-3 py-1.5 rounded-[100px] font-medium">
            {card.category}
          </span>
        </div>

        {/* Card body */}
        <div className="px-5 mt-5 pb-5">
          <h1 className="text-[20px] font-bold text-[#121111] leading-snug mb-3">
            {card.title}
          </h1>

          {/* Main description */}
          <div className="bg-[#FDFDFD] rounded-[20px] p-5 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)] mb-4">
            <p className="text-[15px] text-[#121111] leading-[1.8] tracking-wide">
              {card.description}
            </p>
          </div>

          {/* Source */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-1 rounded-full bg-[#DFDEDE]" />
            <span className="text-[11px] text-[#878787]">来源：{card.source}</span>
          </div>

          {/* Related tip */}
          <div className="bg-[#FDFDFD] rounded-[16px] p-4 border border-[#DFDEDE]/50">
            <p className="text-[11px] font-medium text-[#878787] mb-2">💡 你知道吗</p>
            <p className="text-[13px] text-[#787676] leading-relaxed">
              这条知识属于「{card.category}」类目，你可以前往发现页浏览更多相关内容。
            </p>
          </div>
        </div>
      </div>

      {/* AI 延伸解读 — fixed at bottom */}
      <div className="shrink-0 px-5 pb-5 pt-3 bg-[#F2F2F2]">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAISheet(true)}
          className="w-full bg-[#292526] rounded-[18px] p-4 flex items-center justify-between shadow-[0_6px_20px_rgba(41,37,38,0.18)]"
        >
          <div className="text-left">
            <p className="text-[#FDFDFD] text-[14px] font-bold mb-0.5">AI 延伸解读</p>
            <p className="text-[#FDFDFD]/50 text-[11px]">点击深入了解更多关联知识</p>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-[12px] border border-white/15 flex items-center justify-center">
            <Sparkles size={18} strokeWidth={2} className="text-[#FDFDFD]" />
          </div>
        </motion.button>
      </div>

      {/* AI Bottom Sheet */}
      <AIBottomSheet
        isOpen={showAISheet}
        onClose={() => setShowAISheet(false)}
        title={card.title}
        knowledgeId={card.id}
      />

      {/* Error Report Sheet */}
      <ErrorReportSheet
        isOpen={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        knowledgeId={card.id}
      />
    </div>
  );
}
