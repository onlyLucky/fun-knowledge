import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { AppLogo } from '../../../components/AppLogo';
import { useAuth } from '../../../context/AuthContext';

// ─── Icons ────────────────────────────────────────────────────────────────────

function WeChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9.5 4C5.36 4 2 6.91 2 10.5c0 2.02.99 3.82 2.55 5.02l-.8 2.48 2.8-1.4c.92.3 1.9.46 2.95.46.22 0 .44-.01.66-.03A5.5 5.5 0 0 1 10 16a5.5 5.5 0 0 1 5.5-5.5c.18 0 .36.01.54.03C15.57 7.6 12.83 4 9.5 4z"
        fill="white"
      />
      <path
        d="M22 16a4.5 4.5 0 1 0-7.08 3.68l-.62 1.92 2.16-1.08A4.5 4.5 0 0 0 22 16z"
        fill="white"
      />
    </svg>
  );
}

function AppleIcon({ color = '#1C1A1B' }: { color?: string }) {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="none">
      <path
        d="M14.28 10.56c-.02-2.37 1.94-3.52 2.03-3.57-1.11-1.62-2.83-1.84-3.44-1.86-1.46-.15-2.86.87-3.6.87-.74 0-1.87-.85-3.08-.82-1.58.02-3.04.93-3.86 2.34C.68 10.38 1.88 14.6 3.47 16.94c.79 1.13 1.73 2.4 2.96 2.35 1.19-.05 1.64-.77 3.07-.77 1.44 0 1.83.77 3.09.74 1.28-.02 2.09-1.15 2.87-2.29.91-1.31 1.28-2.58 1.3-2.64-.03-.01-2.5-.96-2.52-3.77zm-2.36-6.99c.63-.77 1.06-1.83.94-2.9-.91.04-2.04.62-2.7 1.38-.59.68-1.09 1.78-.95 2.83 1.03.08 2.08-.51 2.71-1.31z"
        fill={color}
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function WelcomePage() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  // Redirect already-logged-in users
  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  const handleQuickLogin = (type: 'wechat' | 'apple') => {
    login({
      name: type === 'wechat' ? '微信用户' : 'Apple 用户',
      loginType: type,
    });
    // navigation handled by useEffect above
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1C1A1B] overflow-hidden">
      {/* Glow behind logo */}
      <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />

      {/* Branding area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <AppLogo size={80} color="white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-5 flex flex-col items-center gap-2.5"
        >
          <h1 className="text-[30px] font-bold text-[#FDFDFD] tracking-tight">冷知识星球</h1>
          <p className="text-[13px] text-[#FDFDFD]/45 text-center leading-[1.7]">
            每天一个冷知识<br />探索世界，开拓认知边界
          </p>
        </motion.div>
      </div>

      {/* Login actions */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="px-6 pb-10 space-y-3.5"
      >
        {/* Quick login label */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[#FDFDFD]/10" />
          <span className="text-[11px] text-[#FDFDFD]/30 tracking-wider">快捷登录</span>
          <div className="flex-1 h-[1px] bg-[#FDFDFD]/10" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickLogin('wechat')}
            className="flex-1 flex items-center justify-center gap-2 bg-[#07C160] rounded-[14px] py-3.5"
          >
            <WeChatIcon />
            <span className="text-white text-[14px] font-medium">微信登录</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickLogin('apple')}
            className="flex-1 flex items-center justify-center gap-2 bg-[#FDFDFD] rounded-[14px] py-3.5"
          >
            <AppleIcon color="#1C1A1B" />
            <span className="text-[#1C1A1B] text-[14px] font-medium">Apple 登录</span>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-[#FDFDFD]/10" />
          <span className="text-[11px] text-[#FDFDFD]/30">其他方式</span>
          <div className="flex-1 h-[1px] bg-[#FDFDFD]/10" />
        </div>

        {/* Phone / Email login */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-[14px] border border-[#FDFDFD]/20 text-[#FDFDFD] text-[14px] font-medium tracking-wide"
        >
          手机号 / 邮箱登录
        </motion.button>

        {/* Register link */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="text-[13px] text-[#FDFDFD]/40">没有账号？</span>
          <button
            onClick={() => navigate('/register')}
            className="text-[13px] text-[#FDFDFD]/80 font-medium underline underline-offset-2"
          >
            立即注册
          </button>
        </div>

        {/* Terms */}
        <p className="text-[10px] text-[#FDFDFD]/22 text-center leading-relaxed">
          登录即表示同意
          <span className="text-[#FDFDFD]/40"> 《用户协议》</span>
          {' '}和
          <span className="text-[#FDFDFD]/40"> 《隐私政策》</span>
        </p>
      </motion.div>
    </div>
  );
}
