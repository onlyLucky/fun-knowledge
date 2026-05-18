import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Clock, Send, CheckCircle2, Copy, Check } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const TOPICS = ['产品建议', '内容问题', '账号帮助', '商务合作', '媒体联系', '其他'];

const CONTACT_INFOS = [
  { icon: Mail, label: '官方邮箱', value: 'hello@lengzhishi.com' },
  { icon: MessageSquare, label: '微信公众号', value: '冷知识星球' },
  { icon: Clock, label: '响应时间', value: '工作日 24 小时内' },
];

export function ContactUsPage() {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleSubmit = () => {
    if (!topic || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="联系我们" subtitle="我们很乐意听到你的声音" />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center"
            >
              <div className="w-20 h-20 bg-[#292526] rounded-full flex items-center justify-center">
                <CheckCircle2 size={36} strokeWidth={1.8} className="text-[#FDFDFD]" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#121111] mb-2">消息已发送！</p>
                <p className="text-[13px] text-[#878787] leading-relaxed">
                  感谢你的反馈。我们通常在工作日 24 小时内回复，请留意你的联系方式。
                </p>
              </div>
              <div className="bg-[#FDFDFD] rounded-[16px] p-4 w-full border border-[#DFDEDE]/50 space-y-2">
                <p className="text-[12px] text-[#878787] text-left">
                  <span className="font-medium text-[#121111]">主题：</span>{topic}
                </p>
                <p className="text-[12px] text-[#878787] text-left line-clamp-2">
                  <span className="font-medium text-[#121111]">内容：</span>{message}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" className="px-5 space-y-4 pt-1">
              {/* Contact info cards */}
              <div className="space-y-2">
                {CONTACT_INFOS.map((info, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[#FDFDFD] rounded-[16px] flex items-center justify-between px-4 py-3.5 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F2F2F2] rounded-[10px] flex items-center justify-center shrink-0">
                        <info.icon size={16} strokeWidth={2} className="text-[#292526]" />
                      </div>
                      <div>
                        <p className="text-[11px] text-[#878787]">{info.label}</p>
                        <p className="text-[13px] font-medium text-[#121111]">{info.value}</p>
                      </div>
                    </div>
                    {info.label !== '响应时间' && (
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleCopy(info.value)}
                        className="w-8 h-8 bg-[#F2F2F2] rounded-[9px] flex items-center justify-center"
                      >
                        {copied === info.value ? (
                          <Check size={14} strokeWidth={2.5} className="text-green-600" />
                        ) : (
                          <Copy size={14} strokeWidth={2} className="text-[#878787]" />
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="h-[1px] bg-[#DFDEDE]/60 mx-1" />

              {/* Topic selector */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  问题主题 <span className="text-red-400">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setTopic(t)}
                      className={`px-4 py-2 rounded-[100px] text-[12px] font-medium border transition-all ${
                        topic === t
                          ? 'bg-[#292526] text-[#FDFDFD] border-[#292526]'
                          : 'bg-[#FDFDFD] text-[#787676] border-[#DFDEDE]'
                      }`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  详细描述 <span className="text-red-400">*</span>
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="请告诉我们你遇到的问题或想法，越详细越好..."
                  rows={5}
                  className="w-full bg-[#FDFDFD] border border-[#DFDEDE]/50 rounded-[16px] px-4 py-3 text-[13px] text-[#121111] placeholder:text-[#DFDEDE] outline-none resize-none shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
                />
                <p className="text-[10px] text-[#DFDEDE] text-right mt-1">{message.length} 字</p>
              </div>

              {/* Contact */}
              <div>
                <p className="text-[11px] font-medium text-[#878787] uppercase tracking-wider mb-3 px-1">
                  回复方式（选填）
                </p>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="邮箱或微信号，方便我们联系你"
                  className="w-full bg-[#FDFDFD] border border-[#DFDEDE]/50 rounded-[14px] px-4 py-3 text-[13px] text-[#121111] placeholder:text-[#DFDEDE] outline-none shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
                />
              </div>

              {/* Submit */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={!topic || !message}
                className={`w-full py-4 rounded-[100px] flex items-center justify-center gap-2 text-[14px] font-bold transition-all ${
                  topic && message
                    ? 'bg-[#292526] text-[#FDFDFD] shadow-[0_4px_16px_rgba(41,37,38,0.2)]'
                    : 'bg-[#F2F2F2] text-[#DFDEDE]'
                }`}
              >
                <Send size={15} strokeWidth={2.5} />
                发送消息
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
