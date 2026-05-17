# Auth 页面结构优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化 auth 目录下的页面结构，提取公共 Field 组件，使用文件夹隔离每个页面，修复导出问题。

**Architecture:** 将平铺的页面文件移动到独立文件夹中，提取重复的 Field 组件到公共目录，更新所有导入路径。

**Tech Stack:** React, TypeScript, Vite

---

## 文件结构映射

**创建：**
- `app/src/app/pages/auth/components/Field.tsx` - 公共表单字段组件

**移动：**
- `app/src/app/pages/auth/LoginPage.tsx` -> `app/src/app/pages/auth/login/LoginPage.tsx`
- `app/src/app/pages/auth/RegisterPage.tsx` -> `app/src/app/pages/auth/register/RegisterPage.tsx`
- `app/src/app/pages/auth/SplashScreen.tsx` -> `app/src/app/pages/auth/splash/SplashScreen.tsx`
- `app/src/app/pages/auth/WelcomePage.tsx` -> `app/src/app/pages/auth/welcome/WelcomePage.tsx`

**修改：**
- `app/src/app/pages/auth/index.ts` - 更新导出路径

---

### Task 1: 创建目录结构

**Files:**
- Create: `app/src/app/pages/auth/components/` (directory)
- Create: `app/src/app/pages/auth/login/` (directory)
- Create: `app/src/app/pages/auth/register/` (directory)
- Create: `app/src/app/pages/auth/splash/` (directory)
- Create: `app/src/app/pages/auth/welcome/` (directory)

- [ ] **Step 1: 创建所有目录**

```bash
mkdir -p app/src/app/pages/auth/components
mkdir -p app/src/app/pages/auth/login
mkdir -p app/src/app/pages/auth/register
mkdir -p app/src/app/pages/auth/splash
mkdir -p app/src/app/pages/auth/welcome
```

- [ ] **Step 2: 验证目录创建**

```bash
ls -la app/src/app/pages/auth/
```

Expected: 看到新创建的目录

- [ ] **Step 3: Commit**

```bash
git add app/src/app/pages/auth/
git commit -m "chore(auth): 创建页面目录结构"
```

---

### Task 2: 提取 Field 组件

**Files:**
- Create: `app/src/app/pages/auth/components/Field.tsx`

- [ ] **Step 1: 创建 Field 组件文件**

创建 `app/src/app/pages/auth/components/Field.tsx`：

```typescript
import React from 'react';

interface FieldProps {
  label?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  right?: React.ReactNode;
}

export function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  right,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      {label && <p className="text-[12px] font-medium text-[#878787] px-1">{label}</p>}
      <div
        className={`flex items-center bg-[#FDFDFD] rounded-[14px] border px-4 h-[52px] transition-colors ${
          error ? 'border-red-300' : 'border-[#DFDEDE]'
        } shadow-[0_2px_6px_rgba(41,37,38,0.04)]`}
      >
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
```

- [ ] **Step 2: 验证文件创建**

```bash
cat app/src/app/pages/auth/components/Field.tsx
```

Expected: 看到完整的 Field 组件代码

- [ ] **Step 3: Commit**

```bash
git add app/src/app/pages/auth/components/Field.tsx
git commit -m "feat(auth): 提取公共 Field 组件"
```

---

### Task 3: 移动 LoginPage 到独立文件夹

**Files:**
- Move: `app/src/app/pages/auth/LoginPage.tsx` -> `app/src/app/pages/auth/login/LoginPage.tsx`

- [ ] **Step 1: 移动文件**

```bash
mv app/src/app/pages/auth/LoginPage.tsx app/src/app/pages/auth/login/LoginPage.tsx
```

- [ ] **Step 2: 更新导入路径**

修改 `app/src/app/pages/auth/login/LoginPage.tsx`，更新导入路径：

```typescript
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { AppLogo } from '../../../components/AppLogo';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../api';
import { Field } from '../components/Field';

type Tab = 'phone' | 'email';

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

    try {
      const result = await authService.login({
        platform: tab,
        phone: tab === 'phone' ? phone : undefined,
        smsCode: tab === 'phone' ? otp : undefined,
        email: tab === 'email' ? email : undefined,
        password: tab === 'email' ? password : undefined,
      });
      login(
        {
          name: result.user.nickname,
          phone: result.user.phone || undefined,
          email: result.user.email || undefined,
          loginType: tab,
        },
        result.tokens.access_token
      );
    } catch {
      setErrors({ form: '登录失败，请重试' });
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
```

- [ ] **Step 3: 验证文件移动**

```bash
ls -la app/src/app/pages/auth/login/
```

Expected: 看到 LoginPage.tsx 文件

- [ ] **Step 4: Commit**

```bash
git add app/src/app/pages/auth/login/LoginPage.tsx
git rm app/src/app/pages/auth/LoginPage.tsx
git commit -m "refactor(auth): 移动 LoginPage 到独立文件夹"
```

---

### Task 4: 移动 RegisterPage 到独立文件夹

**Files:**
- Move: `app/src/app/pages/auth/RegisterPage.tsx` -> `app/src/app/pages/auth/register/RegisterPage.tsx`

- [ ] **Step 1: 移动文件**

```bash
mv app/src/app/pages/auth/RegisterPage.tsx app/src/app/pages/auth/register/RegisterPage.tsx
```

- [ ] **Step 2: 更新导入路径**

修改 `app/src/app/pages/auth/register/RegisterPage.tsx`，更新导入路径：

```typescript
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Eye, EyeOff, Phone, Mail, CheckSquare, Square } from 'lucide-react';
import { AppLogo } from '../../../components/AppLogo';
import { useAuth } from '../../../context/AuthContext';
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

  const handleSendOTP = () => {
    const errs: Record<string, string> = {};
    if (!phone || phone.length < 11) errs.phone = '请输入正确的手机号';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setOtpSent(true);
    setCountdown(60);
  };

  const handleRegister = async () => {
    const errs: Record<string, string> = {};
    if (!nickname.trim()) errs.nickname = '请输入昵称';

    if (tab === 'phone') {
      if (!phone || phone.length < 11) errs.phone = '请输入正确的手机号';
      if (!otp || otp.length < 4) errs.otp = '请输入验证码';
    } else {
      if (!email || !email.includes('@')) errs.email = '请输入正确的邮箱地址';
      if (!password || password.length < 6) errs.password = '密码不能少于 6 位';
      if (password !== confirmPwd) errs.confirmPwd = '两次密码输入不一致';
    }

    if (!agreed) errs.agreed = '请阅读并同意用户协议';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    login({
      name: nickname,
      ...(tab === 'phone' ? { phone } : { email }),
      loginType: tab,
    });
    setIsLoading(false);
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
```

- [ ] **Step 3: 验证文件移动**

```bash
ls -la app/src/app/pages/auth/register/
```

Expected: 看到 RegisterPage.tsx 文件

- [ ] **Step 4: Commit**

```bash
git add app/src/app/pages/auth/register/RegisterPage.tsx
git rm app/src/app/pages/auth/RegisterPage.tsx
git commit -m "refactor(auth): 移动 RegisterPage 到独立文件夹"
```

---

### Task 5: 移动 SplashScreen 到独立文件夹

**Files:**
- Move: `app/src/app/pages/auth/SplashScreen.tsx` -> `app/src/app/pages/auth/splash/SplashScreen.tsx`

- [ ] **Step 1: 移动文件**

```bash
mv app/src/app/pages/auth/SplashScreen.tsx app/src/app/pages/auth/splash/SplashScreen.tsx
```

- [ ] **Step 2: 更新导入路径**

修改 `app/src/app/pages/auth/splash/SplashScreen.tsx`，更新导入路径：

```typescript
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AppLogo } from '../../../components/AppLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C1A1B] overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[340px] h-[340px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        initial={{ scale: 0.65, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <AppLogo size={90} color="white" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          className="mt-6 flex flex-col items-center gap-2"
        >
          <p className="text-[26px] font-bold text-[#FDFDFD] tracking-tight">冷知识星球</p>
          <p className="text-[13px] text-[#FDFDFD]/40 tracking-wide">每天一个冷知识，开拓认知边界</p>
        </motion.div>
      </motion.div>

      {/* Bottom loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-16 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#FDFDFD]/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: 验证文件移动**

```bash
ls -la app/src/app/pages/auth/splash/
```

Expected: 看到 SplashScreen.tsx 文件

- [ ] **Step 4: Commit**

```bash
git add app/src/app/pages/auth/splash/SplashScreen.tsx
git rm app/src/app/pages/auth/SplashScreen.tsx
git commit -m "refactor(auth): 移动 SplashScreen 到独立文件夹"
```

---

### Task 6: 移动 WelcomePage 到独立文件夹

**Files:**
- Move: `app/src/app/pages/auth/WelcomePage.tsx` -> `app/src/app/pages/auth/welcome/WelcomePage.tsx`

- [ ] **Step 1: 移动文件**

```bash
mv app/src/app/pages/auth/WelcomePage.tsx app/src/app/pages/auth/welcome/WelcomePage.tsx
```

- [ ] **Step 2: 更新导入路径**

修改 `app/src/app/pages/auth/welcome/WelcomePage.tsx`，更新导入路径：

```typescript
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
```

- [ ] **Step 3: 验证文件移动**

```bash
ls -la app/src/app/pages/auth/welcome/
```

Expected: 看到 WelcomePage.tsx 文件

- [ ] **Step 4: Commit**

```bash
git add app/src/app/pages/auth/welcome/WelcomePage.tsx
git rm app/src/app/pages/auth/WelcomePage.tsx
git commit -m "refactor(auth): 移动 WelcomePage 到独立文件夹"
```

---

### Task 7: 更新 index.ts 导出

**Files:**
- Modify: `app/src/app/pages/auth/index.ts`

- [ ] **Step 1: 更新 index.ts**

修改 `app/src/app/pages/auth/index.ts`：

```typescript
export { WelcomePage } from './welcome/WelcomePage';
export { LoginPage } from './login/LoginPage';
export { RegisterPage } from './register/RegisterPage';
export { SplashScreen } from './splash/SplashScreen';
```

- [ ] **Step 2: 验证导出**

```bash
cat app/src/app/pages/auth/index.ts
```

Expected: 看到更新后的导出路径

- [ ] **Step 3: Commit**

```bash
git add app/src/app/pages/auth/index.ts
git commit -m "fix(auth): 更新 index.ts 导出路径并添加 SplashScreen 导出"
```

---

### Task 8: 验证编译和运行

**Files:**
- None (verification only)

- [ ] **Step 1: 检查 TypeScript 编译**

```bash
cd app && npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 2: 检查项目中其他引用**

搜索项目中是否有其他文件引用了这些页面：

```bash
grep -r "pages/auth/LoginPage" app/src/ --include="*.ts" --include="*.tsx"
grep -r "pages/auth/RegisterPage" app/src/ --include="*.ts" --include="*.tsx"
grep -r "pages/auth/SplashScreen" app/src/ --include="*.ts" --include="*.tsx"
grep -r "pages/auth/WelcomePage" app/src/ --include="*.ts" --include="*.tsx"
```

Expected: 找到引用并更新路径

- [ ] **Step 3: 更新其他引用（如有）**

如果找到其他引用，更新导入路径。

- [ ] **Step 4: 运行开发服务器验证**

```bash
cd app && npm run dev
```

Expected: 服务器正常启动，页面正常渲染

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "chore(auth): 验证优化后的页面结构"
```

---

## 自我审查

**1. 规范覆盖：**
- ✅ 提取 Field 组件到 `auth/components/Field.tsx`
- ✅ 修复 index.ts 导出问题（添加 SplashScreen）
- ✅ 使用文件夹隔离每个页面
- ✅ 更新所有导入路径

**2. 占位符扫描：**
- ✅ 无 TBD 或 TODO
- ✅ 所有步骤都有完整代码

**3. 类型一致性：**
- ✅ Field 组件接口在所有任务中一致
- ✅ 导入路径在所有任务中正确
