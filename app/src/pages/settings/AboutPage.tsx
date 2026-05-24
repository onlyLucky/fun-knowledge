import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Star, Shield, Zap, Heart, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { AppLogo } from '@/components/AppLogo';

const FEATURES = [
  { icon: Zap, title: '每日精选', desc: '精心策划的冷知识，每天更新，拒绝信息噪音' },
  { icon: Star, title: 'AI 延伸解读', desc: '基于卡片内容，AI 为你生成关联知识图谱' },
  { icon: Heart, title: '打卡激励', desc: '连续打卡系统，让学习成为习惯' },
  { icon: Shield, title: '内容审核', desc: '每条知识均经过严格的事实核查与来源验证' },
];

const LEGAL_LINKS = [
  { label: '用户协议', path: '/user-agreement' },
  { label: '隐私政策', path: '/privacy-policy' },
  // { label: '内容举报', path: '/report-content' },
  { label: '联系我们', path: '/contact-us' },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-bg-page">
      <PageHeader title="关于冷知识星球" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-4">
        {/* App hero */}
        <div className="bg-primary rounded-[24px] p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8" />
          <div className="w-16 h-16 bg-[#1C1A1B] rounded-[20px] flex items-center justify-center text-3xl mb-4 shadow-lg relative z-10">
            <AppLogo size={50} />
          </div>
          <h2 className="text-[#FDFDFD] text-[18px] font-bold mb-1 relative z-10">冷知识星球</h2>
          <p className="text-[#FDFDFD]/50 text-[12px] relative z-10">版本 1.0.0</p>
          <p className="text-[#FDFDFD]/70 text-[13px] leading-relaxed mt-4 relative z-10">
            每天 5 分钟，探索世界的另一面。我们相信，知识的边界就是思维的边界。
          </p>
        </div>

        {/* Features */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3 px-1">核心功能</p>
          <div className="space-y-2">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-bg-card rounded-[16px] p-4 flex items-start gap-3 border border-border/50"
              >
                <div className="w-9 h-9 bg-bg-page rounded-[12px] flex items-center justify-center shrink-0">
                  <f.icon size={18} strokeWidth={2} className="text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-main">{f.title}</p>
                  <p className="text-[12px] text-text-sub mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-3 px-1">法律与支持</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            {LEGAL_LINKS.map((item, i, arr) => (
              <div key={item.label}>
                <motion.button
                  whileTap={{ backgroundColor: '#F2F2F2' }}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
                >
                  <span className="text-[14px] font-medium text-text-main">{item.label}</span>
                  <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
                </motion.button>
                {i < arr.length - 1 && <div className="h-[1px] bg-bg-page mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Credits */}
        <div className="flex flex-col items-center gap-1 py-2">
          <p className="text-[11px] text-[#DFDEDE]">Made with by 冷知识星球团队</p>
          <p className="text-[10px] text-[#DFDEDE]">© 2026 冷知识星球 All rights reserved</p>
        </div>
      </div>
    </div>
  );
}