import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Star, AlertCircle, Sparkles, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router';
import type { KnowledgeCard as KnowledgeCardType } from '../types';
import { ErrorReportSheet } from './ErrorReportSheet';

interface KnowledgeCardProps {
  card: KnowledgeCardType;
  isActive: boolean;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onAIOpen: (id: string, title: string) => void;
  onSave?: () => void;
  zIndex: number;
}

export function KnowledgeCard({ card, isActive, onSwipeUp, onSwipeDown, onAIOpen, onSave, zIndex }: KnowledgeCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const dragConstraintsRef = useRef(null);
  const navigate = useNavigate();

  // Track drag state to distinguish tap from swipe
  const isDragging = useRef(false);
  const dragStartTime = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleDragStart = (_e: any, info: any) => {
    isDragging.current = true;
    dragStartTime.current = Date.now();
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_event: any, info: any) => {
    const swipeThreshold = 50;
    const velocityThreshold = 400;
    const distanceThreshold = 10;
    const timeThreshold = 200; // ms

    const dragDuration = Date.now() - dragStartTime.current;
    const dragDistance = Math.abs(info.offset.y);

    // Mark as dragged if moved significantly or took time
    if (dragDistance > distanceThreshold || dragDuration > timeThreshold) {
      isDragging.current = true;
    }

    // Handle swipe actions
    if (info.offset.y < -swipeThreshold || info.velocity.y < -velocityThreshold) {
      onSwipeUp();
    } else if (info.offset.y > swipeThreshold || info.velocity.y > velocityThreshold) {
      onSwipeDown();
    }

    // Reset after a small delay to prevent click from firing
    setTimeout(() => {
      isDragging.current = false;
    }, 50);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    // Prevent navigation if we just finished dragging
    if (isDragging.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    navigate(`/card/${card.id}`);
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full px-4 py-3 flex flex-col pointer-events-none"
      style={{ zIndex }}
      initial={{ opacity: 0, y: 40 }}
      animate={{
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 40,
        scale: isActive ? 1 : 0.96,
      }}
      exit={{ opacity: 0, y: -40, scale: 1.02 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div ref={dragConstraintsRef} className="absolute inset-0 z-0" />

      <motion.div
        className={clsx(
          "bg-[#FDFDFD] rounded-[20px] flex flex-col overflow-hidden h-full w-full shadow-[0_4px_20px_rgba(41,37,38,0.08)]",
          isActive ? "pointer-events-auto" : "pointer-events-none"
        )}
        drag={isActive ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 0.985 }}
      >
        {/* Image Area — tappable to view detail */}
        <div
          className="relative w-full flex-[0_0_45%] bg-[#F2F2F2] overflow-hidden cursor-pointer"
          onClick={handleContentClick}
        >
          <img
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4 bg-[#292526] text-[#FDFDFD] text-[10px] px-3 py-1.5 rounded-[100px] font-medium tracking-wide shadow-sm">
            {card.category}
          </div>
          {/* Swipe hint */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-[6px] px-3 py-1 rounded-[100px]">
              <ChevronUp size={11} className="text-white/80" />
              <span className="text-white/80 text-[10px]">上滑切换</span>
            </div>
          </div>
        </div>

        {/* Content Area — tappable to view detail */}
        <div
          className="px-5 pt-5 pb-3 flex-1 flex flex-col overflow-y-auto no-scrollbar cursor-pointer"
          onClick={handleContentClick}
        >
          <h2 className="text-[20px] leading-snug font-bold text-[#121111] mb-3">
            {card.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-[#787676] flex-1">
            {card.description}
          </p>

          <div className="flex items-center mt-4 pt-4 border-t border-[#DFDEDE]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#DFDEDE] mr-2" />
            <span className="text-[11px] text-[#878787]">来源：{card.source}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="h-[64px] flex items-center justify-between px-6 bg-[#FDFDFD] shrink-0">
          {/* Save */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            onClick={() => {
              if (!isSaved) {
                setIsSaved(true);
                onSave?.();
              }
            }}
            className="w-[40px] h-[40px] rounded-[100px] border border-[#DFDEDE] flex items-center justify-center"
          >
            <Star
              size={18}
              strokeWidth={2}
              className={clsx(
                "transition-colors duration-200",
                isSaved ? "text-[#292526] fill-[#292526]" : "text-[#878787]"
              )}
            />
          </motion.button>

          {/* AI button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onAIOpen(card.id, card.title)}
            className="flex items-center gap-2 bg-[#292526] text-[#FDFDFD] px-5 py-2.5 rounded-[100px] shadow-[0_4px_12px_rgba(41,37,38,0.25)]"
          >
            <Sparkles size={15} strokeWidth={2} />
            <span className="text-[13px] font-medium">AI 解读</span>
          </motion.button>

          {/* Error Report */}
          <motion.button
            whileTap={{ scale: 0.78 }}
            onClick={() => setShowReport(true)}
            className="w-[40px] h-[40px] rounded-[100px] border border-[#DFDEDE] flex items-center justify-center"
          >
            <AlertCircle size={18} strokeWidth={2} className="text-[#878787]" />
          </motion.button>
        </div>
      </motion.div>

      {/* Error Report Sheet */}
      <ErrorReportSheet isOpen={showReport} onClose={() => setShowReport(false)} knowledgeId={card.id} />
    </motion.div>
  );
}
