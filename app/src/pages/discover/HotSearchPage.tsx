import { useNavigate } from 'react-router';
import { discoverService } from '@/api';
import type { HotSearchItem } from '@/types';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '@/components/PageHeader';

// ─── Hot Search Item ─────────────────────────────────────────────────────────

function HotSearchItemRow({ item, onClick }: { item: HotSearchItem; onClick: () => void }) {
  const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
  const trendColor = item.trend === 'up' ? 'text-[#FF4D4F]' : item.trend === 'down' ? 'text-[#52C41A]' : 'text-[#878787]';
  const isTop3 = item.rank <= 3;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 px-1 text-left border-b border-[#F2F2F2] last:border-b-0"
    >
      <span className={`text-[16px] font-bold w-6 text-center ${isTop3 ? 'text-[#FF4D4F]' : 'text-[#878787]'}`}>
        {item.rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-[#121111] truncate">{item.keyword}</p>
        <p className="text-[11px] text-[#878787] mt-0.5">{item.heat.toLocaleString()} 热度</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isTop3 && <Flame size={14} strokeWidth={2} className="text-[#FF4D4F]" />}
        <TrendIcon size={14} strokeWidth={2} className={trendColor} />
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function HotSearchPage() {
  const navigate = useNavigate();
  const [hotSearches, setHotSearches] = useState<HotSearchItem[]>([]);

  useEffect(() => {
    discoverService.getHotSearches().then(setHotSearches).catch(() => {});
  }, []);

  const handleItemClick = (item: HotSearchItem) => {
    if (item.cardId) {
      navigate(`/card/${item.cardId}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="热搜榜单" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6">
        <div className="bg-[#FDFDFD] rounded-[20px] border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)] overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Flame size={18} strokeWidth={2} className="text-[#FF4D4F]" />
              <p className="text-[16px] font-bold text-[#121111]">全部热搜</p>
            </div>
            <p className="text-[12px] text-[#878787] mt-1">实时更新 · 基于用户搜索热度</p>
          </div>

          <div className="px-4 pb-3">
            {hotSearches.map((item) => (
              <HotSearchItemRow
                key={item.rank}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
