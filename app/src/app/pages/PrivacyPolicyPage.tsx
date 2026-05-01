import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, Trash2, Bell } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

const HIGHLIGHTS = [
  { icon: Lock, title: '数据加密', desc: '所有传输数据采用 TLS 加密，确保信息安全' },
  { icon: Eye, title: '最小收集', desc: '仅收集为您提供服务所必要的信息' },
  { icon: Database, title: '安全存储', desc: '用户数据存储于符合安全标准的服务器' },
  { icon: Trash2, title: '删除权利', desc: '您可随时申请删除个人数据' },
];

const SECTIONS = [
  {
    title: '我们收集哪些信息',
    content:
      '我们可能收集您的设备标识符、使用记录（浏览的卡片、打卡记录）、收藏内容等信息。我们不会主动收集您的姓名、手机号等敏感个人信息，除非您在注册或使用特定功能时主动提供。',
  },
  {
    title: '如何使用这些信息',
    content:
      '收集到的信息用于：为您提供个性化推荐内容、改善应用体验、分析使用统计、保障账号安全。我们不会将您的个人信息出售或出租给第三方。',
  },
  {
    title: '信息共享与披露',
    content:
      '我们不会将您的个人信息提供给无关第三方，除非：经您明确同意、法律法规要求、为保护本平台或用户的合法权益。',
  },
  {
    title: 'Cookie 与追踪技术',
    content:
      '我们使用 Cookie 和类似技术来记录您的偏好设置和使用习惯，以提供更好的服务体验。您可在设备设置中禁用 Cookie，但这可能影响部分功能的正常使用。',
  },
  {
    title: '未成年人保护',
    content:
      '本平台不面向 14 周岁以下未成年人。如发现我们无意间收集了未成年人的个人信息，请联系我们，我们将尽快删除相关数据。',
  },
  {
    title: '隐私政策的更新',
    content:
      '我们可能不时更新本隐私政策。更新后我们将在平台内发布通知，建议您定期查看本政策。重大变更将以显著方式通知您。',
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col h-full bg-[#F2F2F2]">
      <PageHeader title="隐私政策" subtitle="最后更新于 2026年1月1日" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
        {/* Shield banner */}
        <div className="bg-[#292526] rounded-[20px] p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-[14px] border border-white/15 flex items-center justify-center shrink-0">
            <Shield size={22} strokeWidth={2} className="text-[#FDFDFD]" />
          </div>
          <p className="text-[#FDFDFD]/80 text-[13px] leading-relaxed flex-1">
            保护您的隐私是我们的首要责任。本政策说明我们如何收集、使用和保护您的信息。
          </p>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {HIGHLIGHTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#FDFDFD] rounded-[16px] p-4 border border-[#DFDEDE]/50"
            >
              <div className="w-8 h-8 bg-[#F2F2F2] rounded-[10px] flex items-center justify-center mb-2">
                <item.icon size={16} strokeWidth={2} className="text-[#292526]" />
              </div>
              <p className="text-[12px] font-bold text-[#121111] mb-1">{item.title}</p>
              <p className="text-[11px] text-[#878787] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.04 }}
            className="bg-[#FDFDFD] rounded-[18px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]"
          >
            <p className="text-[13px] font-bold text-[#121111] mb-2">{section.title}</p>
            <p className="text-[13px] text-[#787676] leading-[1.8]">{section.content}</p>
          </motion.div>
        ))}

        {/* Contact note */}
        <div className="bg-[#F2F2F2] rounded-[14px] p-4 border border-[#DFDEDE]/50 flex items-start gap-2">
          <Bell size={14} strokeWidth={2} className="text-[#878787] mt-0.5 shrink-0" />
          <p className="text-[12px] text-[#878787] leading-relaxed">
            如有隐私相关问题，请通过「联系我们」页面联系我们，我们将在 5 个工作日内回复。
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 py-3">
          <p className="text-[11px] text-[#DFDEDE]">© 2026 冷知识星球 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
