import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { globalLoading } from '@/lib/global-loading';

export function GlobalLoading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return globalLoading.subscribe(setLoading);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute top-0 left-0 right-0 z-[9999] h-[3px] overflow-hidden"
        >
          <motion.div
            className="h-full bg-[#292526]"
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{ width: '60%' }}
          />
          <motion.div
            className="absolute inset-0 h-full bg-[#292526]/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
