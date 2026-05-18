import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { favoriteService, mapKnowledgeToCard } from '@/api';
import type { KnowledgeCard } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { AIBottomSheet } from '@/components/AIBottomSheet';

export function Favorites() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<KnowledgeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    favoriteService.getFavorites()
      .then((data) => {
        if (!cancelled) setSaved(data.list.map(mapKnowledgeToCard));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const [removing, setRemoving] = useState<string | null>(null);
  const [aiSheet, setAiSheet] = useState<{ open: boolean; title: string }>({ open: false, title: '' });

  const handleRemove = async (id: string) => {
    setRemoving(id);
    try {
      await favoriteService.removeFavorite(id);
    } catch {
      // ignore
    }
    setTimeout(() => {
      setSaved((prev) => prev.filter((c) => c.id !== id));
      setRemoving(null);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] relative">
      <PageHeader
        title="我的收藏"
        subtitle={`共 ${saved.length} 张知识卡片`}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3">
        <AnimatePresence>
          {saved.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-60 text-[#878787]"
            >
              <div className="w-16 h-16 bg-[#FDFDFD] rounded-[20px] border border-[#DFDEDE] flex items-center justify-center mb-4">
                <Star size={28} strokeWidth={1.5} className="text-[#DFDEDE]" />
              </div>
              <p className="text-[14px] font-medium text-[#787676]">还没有收藏任何卡片</p>
              <p className="text-[12px] text-[#878787] mt-1">在首页点击 ☆ 收藏感兴趣的知识</p>
            </motion.div>
          ) : (
            saved.map((card, i) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: removing === card.id ? 0 : 1, y: 0, scale: removing === card.id ? 0.95 : 1 }}
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
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="text-[10px] text-[#878787] bg-[#F2F2F2] px-2 py-0.5 rounded-[100px]">
                      {card.category}
                    </span>
                    <h3 className="text-[14px] font-bold text-[#121111] mt-2 leading-snug line-clamp-2">
                      {card.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#DFDEDE]" />
                      <span className="text-[10px] text-[#878787]">{card.source}</span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-7 h-7 bg-[#F2F2F2] rounded-[8px] flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAiSheet({ open: true, title: card.title });
                        }}
                      >
                        <Sparkles size={13} strokeWidth={2} className="text-[#292526]" />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-7 h-7 bg-[#F2F2F2] rounded-[8px] flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(card.id);
                        }}
                      >
                        <Trash2 size={13} strokeWidth={2} className="text-[#878787]" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* AI Bottom Sheet */}
      <AIBottomSheet
        isOpen={aiSheet.open}
        onClose={() => setAiSheet({ open: false, title: '' })}
        title={aiSheet.title}
      />
    </div>
  );
}
