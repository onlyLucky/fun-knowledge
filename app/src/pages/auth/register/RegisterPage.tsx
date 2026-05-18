import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Eye, EyeOff, Phone, Mail, CheckSquare, Square } from 'lucide-react';
import { AppLogo } from '@/components/AppLogo';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/api';
import { Field } from '../components/Field';

type Tab = 'phone' | 'email';

// ─── Page ─────────────────────────────────────────────────────────────────────

export function RegisterPage() {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAuth();

  const [tab, setTab] = useState<Tab>('phone');

  // Common
  const [nickname, setNickname] = useState('');

  // Phone state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn, navigate]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }
    countdownRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [countdown]);

  const handleSendOTP = async () => {
    const errs: Record<string, string> = {};
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) errs.phone = '请输入正确的手机号';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await authService.sendSmsCode(phone);
      setOtpSent(true);
      setCountdown(60);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '发送失败，请重试';
      setErrors({ phone: msg });
    }
  };

  const handleRegister = async () => {
    const errs: Record<string, string> = {};
    if (!nickname.trim() || nickname.trim().length < 2) errs.nickname = '昵称需要 2-20 个字符';

    if (tab === 'phone') {
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) errs.phone = '请输入正确的手机号';
      if (!otp || otp.length !== 6) errs.otp = '请输入 6 位验证码';
    } else {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '请输入正确的邮箱地址';
      if (!password || password.length < 6 || password.length > 50) errs.password = '密码需要 6-50 个字符';
      if (password !== confirmPwd) errs.confirmPwd = '两次密码输入不一致';
    }

    if (!agreed) errs.agreed = '请阅读并同意用户协议';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await authService.register({
        platform: tab,
        nickname: nickname.trim(),
        ...(tab === 'phone' ? { phone, smsCode: otp } : { email, password }),
      });
      login(
        {
          name: result.user.nickname,
          phone: result.user.phone || undefined,
          email: result.user.email || undefined,
          loginType: tab,
        },
        result.tokens.accessToken
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '注册失败，请重试';
      setErrors({ form: msg });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex flex-col items-center pt-4 pb-7">
          <div className="w-[52px] h-[52px] bg-[#292526] rounded-[18px] flex items-center justify-center mb-4 shadow-[0_6px_20px_rgba(41,37,38,0.22)]">
            <AppLogo size={32} color="white" />
          </div>
          <h1 className="text-[22px] font-bold text-[#121111] mb-1">创建账号 🚀</h1>
          <p className="text-[13px] text-[#878787]">加入冷知识星球，开启探索之旅</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#FDFDFD] rounded-[14px] p-1 border border-[#DFDEDE]/60 mb-5 shadow-[0_2px_6px_rgba(41,37,38,0.04)]">
          {(['phone', 'email'] as Tab[]).map((t) => (
            <motion.button
              key={t}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setTab(t); setErrors({}); setOtpSent(false); }}
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

        {/* Common: Nickname */}
        <div className="mb-3">
          <Field
            label="昵称"
            placeholder="给自己起个好听的名字"
            value={nickname}
            onChange={setNickname}
            error={errors.nickname}
          />
        </div>

        {/* Tab-specific fields */}
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
                      countdown > 0 ? 'text-[#DFDEDE]' : 'text-[#292526]'
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
                placeholder="设置密码（6 位以上）"
                value={password}
                onChange={setPassword}
                type={showPwd ? 'text' : 'password'}
                error={errors.password}
                right={
                  <button onClick={() => setShowPwd((v) => !v)} className="shrink-0 text-[#DFDEDE] pl-2">
                    {showPwd ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                }
              />
              <Field
                label="确认密码"
                placeholder="再次输入密码"
                value={confirmPwd}
                onChange={setConfirmPwd}
                type={showConfirmPwd ? 'text' : 'password'}
                error={errors.confirmPwd}
                right={
                  <button onClick={() => setShowConfirmPwd((v) => !v)} className="shrink-0 text-[#DFDEDE] pl-2">
                    {showConfirmPwd ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
                  </button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agreement */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAgreed((v) => !v)}
          className="flex items-start gap-2.5 mt-5 w-full text-left"
        >
          {agreed
            ? <CheckSquare size={17} strokeWidth={2} className="text-[#292526] mt-0.5 shrink-0" />
            : <Square size={17} strokeWidth={2} className="text-[#DFDEDE] mt-0.5 shrink-0" />
          }
          <p className="text-[12px] text-[#878787] leading-relaxed">
            我已阅读并同意
            <span className="text-[#292526] font-medium"> 《用户协议》</span>
            {' '}和
            <span className="text-[#292526] font-medium"> 《隐私政策》</span>
          </p>
        </motion.button>
        {errors.agreed && <p className="text-[11px] text-red-500 mt-1.5 px-1">{errors.agreed}</p>}

        {/* Register button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRegister}
          disabled={isLoading}
          className="w-full mt-5 py-4 bg-[#292526] rounded-[100px] text-[#FDFDFD] text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(41,37,38,0.22)]"
        >
          {isLoading ? (
            <motion.div
              className="w-5 h-5 border-2 border-[#FDFDFD]/30 border-t-[#FDFDFD] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : '注 册'}
        </motion.button>
        {errors.form && <p className="text-[12px] text-red-500 text-center mt-3">{errors.form}</p>}

        {/* Login link */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <span className="text-[13px] text-[#878787]">已有账号？</span>
          <button
            onClick={() => navigate('/login')}
            className="text-[13px] text-[#292526] font-medium"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
  );
}
