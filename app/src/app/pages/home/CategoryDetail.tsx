import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Star, Sparkles } from 'lucide-react';
import { knowledgeService, categoryService, mapKnowledgeToCard, mapServerCategory } from '../../api';
import type { KnowledgeCard } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { useState, useEffect } from 'react';

export function CategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const [categoryName, setCategoryName] = useState('分类');
  const [displayCards, setDisplayCards] = useState<KnowledgeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const [serverCats, serverCards] = await Promise.all([
          categoryService.getCategories(),
          knowledgeService.getKnowledgeList({
            category_id: id === 'all' ? undefined : id,
          }),
        ]);
        if (cancelled) return;
        const cats = serverCats.map(mapServerCategory);
        const cat = cats.find((c) => c.id === id);
        setCategoryName(id === 'all' ? '浏览历史' : (cat?.name || '分类'));
        const mapped = serverCards.list.map(mapKnowledgeToCard);
        setDisplayCards(mapped.length > 0 ? mapped : []);
      } catch {
        // keep empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  const toggleSave = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader
        title={categoryName}
        subtitle={loading ? '加载中...' : `${displayCards.length} 张卡片`}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-3">
        {displayCards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            onClick={() => navigate(`/card/${card.id}`)}
            className="bg-[#FDFDFD] rounded-[20px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] active:opacity-80 transition-opacity cursor-pointer"
          >
            {/* Image */}
            <div className="w-full h-[160px] bg-[#F2F2F2] relative overflow-hidden">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <span className="absolute top-3 left-3 bg-[#292526] text-[#FDFDFD] text-[10px] px-2.5 py-1 rounded-[100px] font-medium">
                {card.category}
              </span>
            </div>

            {/* Body */}
            <div className="p-4">
              <h3 className="text-[15px] font-bold text-[#121111] leading-snug mb-2">
                {card.title}
              </h3>
              <p className="text-[13px] text-[#787676] leading-relaxed line-clamp-3">
                {card.description}
              </p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F2F2F2]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#DFDEDE]" />
                  <span className="text-[10px] text-[#878787]">{card.source}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => toggleSave(card.id, e)}
                    className="w-8 h-8 bg-[#F2F2F2] rounded-[10px] flex items-center justify-center"
                  >
                    <Star
                      size={15}
                      strokeWidth={2}
                      className={saved.has(card.id) ? 'text-[#292526] fill-[#292526]' : 'text-[#878787]'}
                    />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/card/${card.id}`); }}
                    className="flex items-center gap-1.5 bg-[#292526] text-[#FDFDFD] px-3 py-1.5 rounded-[100px]"
                  >
                    <Sparkles size={12} strokeWidth={2} />
                    <span className="text-[11px] font-medium">查看详情</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}