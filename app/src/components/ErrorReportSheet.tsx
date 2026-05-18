import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { correctionService } from '@/api';
import { mapReasonToType } from '@/api/mappers';

const ERROR_REASONS = [
  '内容描述不准确',
  '数据或数字有误',
  '来源引用有误',
  '内容已过时',
  '图片与内容不符',
  '其他问题',
];

interface ErrorReportSheetProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeId: string;
}

export function ErrorReportSheet({ isOpen, onClose, knowledgeId }: ErrorReportSheetProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);
    try {
      await correctionService.submitCorrection({
        knowledge_id: knowledgeId,
        type: mapReasonToType(selectedReason),
        description: extraNote ? `${selectedReason}：${extraNote}` : selectedReason,
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSubmitted(false);
          setSelectedReason('');
          setExtraNote('');
        }, 300);
      }, 1800);
    } catch {
      // keep form open on error
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason('');
      setExtraNote('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-[200]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#FDFDFD] rounded-t-[28px] z-[201] overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-[#DFDEDE] rounded-full" />
            </div>

            <div className="px-5 pb-10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 gap-3"
                >
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={28} strokeWidth={2} className="text-green-600" />
                  </div>
                  <p className="text-[15px] font-bold text-[#121111]">感谢你的反馈！</p>
                  <p className="text-[13px] text-[#878787] text-center">
                    纠错记录已提交，团队将在 3 个工作日内审核
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5 pt-2">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#121111]">内容纠错</h3>
                      <p className="text-[11px] text-[#878787] mt-0.5">选择错误类型，帮助我们改进</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleClose}
                      className="w-[32px] h-[32px] bg-[#F2F2F2] rounded-[10px] flex items-center justify-center"
                    >
                      <X size={16} strokeWidth={2.5} className="text-[#878787]" />
                    </motion.button>
                  </div>

                  {/* Reason chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {ERROR_REASONS.map((r) => (
                      <motion.button
                        key={r}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setSelectedReason(r)}
                        className={`px-3.5 py-2 rounded-[100px] text-[12px] font-medium border transition-all ${
                          selectedReason === r
                            ? 'bg-[#292526] text-[#FDFDFD] border-[#292526]'
                            : 'bg-[#F2F2F2] text-[#787676] border-[#DFDEDE]'
                        }`}
                      >
                        {r}
                      </motion.button>
                    ))}
                  </div>

                  {/* Optional note */}
                  <textarea
                    value={extraNote}
                    onChange={(e) => setExtraNote(e.target.value)}
                    placeholder="补充说明（选填）..."
                    rows={3}
                    className="w-full bg-[#F2F2F2] rounded-[14px] px-4 py-3 text-[13px] text-[#121111] placeholder:text-[#DFDEDE] outline-none resize-none border border-[#DFDEDE]/50 mb-4"
                  />

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={!selectedReason || submitting}
                    className={`w-full py-3.5 rounded-[100px] flex items-center justify-center gap-2 text-[14px] font-bold transition-all ${
                      selectedReason && !submitting
                        ? 'bg-[#292526] text-[#FDFDFD] shadow-[0_4px_16px_rgba(41,37,38,0.2)]'
                        : 'bg-[#F2F2F2] text-[#DFDEDE]'
                    }`}
                  >
                    <Send size={15} strokeWidth={2.5} />
                    {submitting ? '提交中...' : '提交纠错'}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
