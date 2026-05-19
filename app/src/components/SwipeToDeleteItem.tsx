import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface SwipeToDeleteItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  disabled?: boolean;
}

const DELETE_THRESHOLD = -60;

export function SwipeToDeleteItem({ children, onDelete, disabled }: SwipeToDeleteItemProps) {
  const x = useMotionValue(0);
  const [deleting, setDeleting] = useState(false);

  const bgOpacity = useTransform(x, [-80, -40, 0], [1, 0.6, 0]);
  const deleteScale = useTransform(x, [-80, -40, 0], [1, 0.8, 0.5]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (disabled) return;
    if (info.offset.x < DELETE_THRESHOLD) {
      setDeleting(true);
      onDelete();
    }
  };

  if (disabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-[18px]">
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 bg-[#FF3B30] flex items-center justify-end pr-5 rounded-[18px]"
        style={{ opacity: bgOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 size={18} strokeWidth={2} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={deleting ? { x: -300, opacity: 0 } : undefined}
        transition={{ duration: 0.25 }}
        className="relative z-10 touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
}
