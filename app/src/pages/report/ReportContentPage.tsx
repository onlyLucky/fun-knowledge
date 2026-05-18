import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const REPORT_TYPES = [
  { emoji: '❌', label: '虚假信息', desc: '内容存在明显错误或谣言' },
  { emoji: '⚠️', label: '有害内容', desc: '包含暴力、歧视或不当内容' },
  { emoji: '©️', label: '版权侵权', desc: '未经授权使用他人作品' },
  { emoji: '🔞', label: '不良内容', desc: '含有色情或不适宜内容' },
  { emoji: '💬', label: '骚扰霸凌', desc: '针对特定个人或群体的攻击' },
  { emoji: '📋', label: '其他问题', desc: '其他违规或不适当内容' },
];

export function ReportContentPage() {
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="内容举报" subtitle="帮助我们维护健康的内容环境" />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 size={38} strokeWidth={1.8} className="text-green-600" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#121111] mb-2">举报已提交</p>
                <p className="text-[13px] text-[#878787] leading-relaxed">
                  感谢你帮助维护内容质量。我们将在 24 小时内审核，并在处理完成后通知你。
                </p>
              </div>
              <div className="bg-[#F2F2F2] rounded-[16px] p-4 w-full">
                <p className="text-[12px] text-[#878787] text-left">
                  <span className="font-medium text-[#121111]">举报类型：</span>{selected}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="px-5 space-y-4 pt-1">
              {/* Notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-[16px] p-4">
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  ⚠️ 请确保举报内容真实有效，恶意举报可能导致账号受限。我们承诺对所有举报保密处理。
                </p>
              </div>

              {/* Report type */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  举报类型 <span className="text-red-400">*</span>
                </p>
                <div className="space-y-2">
                  {REPORT_TYPES.map((type) => (
                    <motion.button
                      key={type.label}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelected(type.label)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-[16px] border transition-all text-left ${
                        selected === type.label
                          ? 'bg-[#292526] border-[#292526]'
                          : 'bg-[#FDFDFD] border-[#DFDEDE]/50'
                      }`}
                    >
                      <span className="text-[20px] shrink-0">{type.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13px] font-bold ${
                            selected === type.label ? 'text-[#FDFDFD]' : 'text-[#121111]'
                          }`}
                        >
                          {type.label}
                        </p>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            selected === type.label ? 'text-[#FDFDFD]/60' : 'text-[#878787]'
                          }`}
                        >
                          {type.desc}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected === type.label
                            ? 'border-[#FDFDFD] bg-[#FDFDFD]'
                            : 'border-[#DFDEDE]'
                        }`}
                      >
                        {selected === type.label && (
                          <div className="w-2 h-2 rounded-full bg-[#292526]" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  补充说明
                </p>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="请描述具体问题，例如：哪条内容、哪个部分存在问题..."
                  rows={4}
                  className="w-full bg-[#FDFDFD] border border-[#DFDEDE]/50 rounded-[16px] px-4 py-3 text-[13px] text-[#121111] placeholder:text-[#DFDEDE] outline-none resize-none shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
                />
              </div>

              {/* Contact */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  联系方式（选填）
                </p>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="邮箱或手机号，方便我们回复你"
                  className="w-full bg-[#FDFDFD] border border-[#DFDEDE]/50 rounded-[14px] px-4 py-3 text-[13px] text-[#121111] placeholder:text-[#DFDEDE] outline-none shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!selected}
                className={`w-full py-4 rounded-[100px] flex items-center justify-center gap-2 text-[14px] font-bold transition-all ${
                  selected
                    ? 'bg-[#292526] text-[#FDFDFD] shadow-[0_4px_16px_rgba(41,37,38,0.2)]'
                    : 'bg-[#F2F2F2] text-[#DFDEDE]'
                }`}
              >
                <Send size={15} strokeWidth={2.5} />
                提交举报
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
