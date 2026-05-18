import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import { aiService } from '@/api';
import type { AIExtendResult } from '@/api/ai.service';

interface AIBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  knowledgeId: string;
}

export function AIBottomSheet({ isOpen, onClose, title, knowledgeId }: AIBottomSheetProps) {
  const [items, setItems] = useState<AIExtendResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!knowledgeId) return;
    setLoading(true);
    try {
      const result = await aiService.extendKnowledge(knowledgeId);
      setItems(result);
    } catch {
      // keep previous items on error
    } finally {
      setLoading(false);
    }
  }, [knowledgeId]);

  useEffect(() => {
    if (isOpen && knowledgeId) fetchItems();
  }, [isOpen, knowledgeId, fetchItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#121111]/50 z-[100] backdrop-blur-[3px]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute bottom-0 left-0 right-0 h-[72%] bg-[#FDFDFD] z-[101] rounded-t-[24px] flex flex-col overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-9 h-1 rounded-[100px] bg-[#DFDEDE]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[100px] bg-[#292526] flex items-center justify-center">
                  <Sparkles size={14} className="text-[#FDFDFD]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#121111]">AI 延伸解读</h3>
              </div>
              <button
                onClick={onClose}
                className="w-[32px] h-[32px] rounded-[100px] border border-[#DFDEDE] flex items-center justify-center text-[#878787] active:bg-[#F2F2F2] transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Topic pill */}
            <div className="px-5 pb-3 shrink-0">
              <div className="bg-[#F2F2F2] rounded-[10px] px-4 py-3">
                <p className="text-[12px] text-[#787676] leading-relaxed">
                  基于「<span className="text-[#121111] font-medium">{title}</span>」，AI 为你生成了以下延伸知识
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-[#F2F2F2] mx-5 shrink-0" />

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <motion.div
                    className="w-6 h-6 border-2 border-[#DFDEDE] border-t-[#292526] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-[13px] text-[#878787]">AI 正在生成延伸知识...</p>
                </div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-[11px] font-bold text-[#DFDEDE] mt-0.5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-[#121111] mb-1.5">{item.title}</h4>
                      <p className="text-[13px] text-[#787676] leading-relaxed mb-2">{item.content}</p>
                      {item.source && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-[#DFDEDE]" />
                          <span className="text-[10px] text-[#878787]">{item.source}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Button */}
            <div className="px-5 py-4 shrink-0 border-t border-[#F2F2F2]">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={fetchItems}
                disabled={loading}
                className="w-full bg-[#292526] text-[#FDFDFD] py-4 rounded-[100px] font-bold text-[14px] flex items-center justify-center gap-2 active:opacity-80 transition-opacity shadow-[0_4px_12px_rgba(41,37,38,0.2)]"
              >
                <RefreshCw size={15} strokeWidth={2.5} className={loading ? 'animate-spin' : ''} />
                换一批延伸知识
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
