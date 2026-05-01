import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { AppLogo } from '../../components/AppLogo';
import { useAuth } from '../../context/AuthContext';

type Tab = 'phone' | 'email';

// ─── Input Field ──────────────────────────────────────────────────────────────

function Field({
  label, placeholder, value, onChange, type = 'text', error,
  right,
}: {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-[12px] font-medium text-[#878787] px-1">{label}</p>}
      <div className={`flex items-center bg-[#FDFDFD] rounded-[14px] border px-4 h-[52px] transition-colors ${error ? 'border-red-300' : 'border-[#DFDEDE]'} shadow-[0_2px_6px_rgba(41,37,38,0.04)]`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[14px] text-[#121111] placeholder:text-[#DFDEDE] outline-none"
        />
        {right}
      </div>
      {error && <p className="text-[11px] text-red-500 px-1">{error}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const [tab, setTab] = useState<Tab>('phone');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [countdown]);

  const handleSendOTP = () => {
    const errs: Record<string, string> = {};
    if (!phone || phone.length < 11) errs.phone = '请输入正确的手机号';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setOtpSent(true);
    setCountdown(60);
  };

  const handleLogin = async () => {
    const errs: Record<string, string> = {};

    if (tab === 'phone') {
      if (!phone || phone.length < 11) errs.phone = '请输入正确的手机号';
      if (!otp || otp.length < 4) errs.otp = '请输入验证码';
    } else {
      if (!email || !email.includes('@')) errs.email = '请输入正确的邮箱地址';
      if (!password || password.length < 6) errs.password = '密码不能少于 6 位';
    }

    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setIsLoading(true);

    // Mock API delay
    await new Promise((r) => setTimeout(r, 800));

    login({
      name: tab === 'phone' ? `用户${phone.slice(-4)}` : email.split('@')[0],
      ...(tab === 'phone' ? { phone } : { email }),
      loginType: tab,
    });
    setIsLoading(false);
    // navigation via useEffect
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F2F2F2] overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-2 shrink-0">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => navigate(-1)}
          className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
        >
          <ChevronLeft size={20} strokeWidth={2.5} className="text-[#121111]" />
        </motion.button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {/* Logo + Title */}
        <div className="flex flex-col items-center pt-4 pb-8">
          <div className="w-[52px] h-[52px] bg-[#292526] rounded-[18px] flex items-center justify-center mb-4 shadow-[0_6px_20px_rgba(41,37,38,0.22)]">
            <AppLogo size={32} color="white" />
          </div>
          <h1 className="text-[22px] font-bold text-[#121111] mb-1">欢迎回来 👋</h1>
          <p className="text-[13px] text-[#878787]">登录以继续探索冷知识</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#FDFDFD] rounded-[14px] p-1 border border-[#DFDEDE]/60 mb-6 shadow-[0_2px_6px_rgba(41,37,38,0.04)]">
          {(['phone', 'email'] as Tab[]).map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setTab(t); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[11px] transition-all duration-200 text-[13px] font-medium ${
                tab === t
                  ? 'bg-[#292526] text-[#FDFDFD] shadow-[0_2px_8px_rgba(41,37,38,0.2)]'
                  : 'text-[#878787]'
              }`}
            >
              {t === 'phone'
                ? <><Phone size={13} strokeWidth={2} />手机号</>
                : <><Mail size={13} strokeWidth={2} />邮箱</>
              }
            </motion.button>
          ))}
        </div>

        {/* Forms */}
        <AnimatePresence mode="wait">
          {tab === 'phone' ? (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <Field
                label="手机号"
                placeholder="请输入手机号"
                value={phone}
                onChange={setPhone}
                type="tel"
                error={errors.phone}
                right={
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={handleSendOTP}
                    disabled={countdown > 0}
                    className={`shrink-0 text-[12px] font-medium px-3 py-1.5 rounded-[8px] transition-all ${
                      countdown > 0
                        ? 'text-[#DFDEDE]'
                        : 'text-[#292526]'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                  </motion.button>
                }
              />

              <AnimatePresence>
                {otpSent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Field
                      label="验证码"
                      placeholder="请输入 6 位验证码"
                      value={otp}
                      onChange={setOtp}
                      type="number"
                      error={errors.otp}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <Field
                label="邮箱"
                placeholder="请输入邮箱地址"
                value={email}
                onChange={setEmail}
                type="email"
                error={errors.email}
              />
              <Field
                label="密码"
                placeholder="请输入密码（6 位以上）"
                value={password}
                onChange={setPassword}
                type={showPwd ? 'text' : 'password'}
                error={errors.password}
                right={
                  <button onClick={() => setShowPwd((v) => !v)} className="shrink-0 text-[#DFDEDE] pl-2">
                    {showPwd
                      ? <EyeOff size={17} strokeWidth={2} />
                      : <Eye size={17} strokeWidth={2} />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <button className="text-[12px] text-[#878787] py-1">忘记密码？</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full mt-6 py-4 bg-[#292526] rounded-[100px] text-[#FDFDFD] text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(41,37,38,0.22)] transition-opacity"
        >
          {isLoading ? (
            <motion.div
              className="w-5 h-5 border-2 border-[#FDFDFD]/30 border-t-[#FDFDFD] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : '登 录'}
        </motion.button>

        {/* Register link */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <span className="text-[13px] text-[#878787]">没有账号？</span>
          <button
            onClick={() => navigate('/register')}
            className="text-[13px] text-[#292526] font-medium"
          >
            立即注册
          </button>
        </div>
      </div>
    </div>
  );
}
