import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, X, Lock, Smartphone, Mail, MessageCircle, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import * as authService from '@/api/auth.service';
import type { ServerUser } from '@/api/types';

// 平台配置
const PLATFORMS = [
  { key: 'wechat', label: '微信', icon: MessageCircle, color: 'text-[#07C160]' },
  { key: 'phone', label: '手机号', icon: Smartphone, color: 'text-primary' },
  { key: 'email', label: '邮箱', icon: Mail, color: 'text-primary' },
  { key: 'apple', label: 'Apple', icon: Apple, color: 'text-primary' },
];

export function AccountEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ServerUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 绑定/解绑状态
  const [bindingPlatform, setBindingPlatform] = useState<string | null>(null);
  const [unbindingPlatform, setUnbindingPlatform] = useState<string | null>(null);

  // 修改密码
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 绑定表单
  const [bindPhone, setBindPhone] = useState('');
  const [bindSmsCode, setBindSmsCode] = useState('');
  const [bindEmail, setBindEmail] = useState('');
  const [bindEmailPassword, setBindEmailPassword] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [bindLoading, setBindLoading] = useState(false);
  const [bindError, setBindError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const isBound = (platform: string) => {
    return !!profile?.user_auths?.[platform];
  };

  const getPlatformValue = (platform: string) => {
    if (!profile?.user_auths?.[platform]) return null;
    const authData = profile.user_auths[platform] as Record<string, any>;
    if (platform === 'phone') return authData.phone || profile.phone;
    if (platform === 'email') return authData.email || profile.email;
    if (platform === 'wechat') return '已绑定';
    if (platform === 'apple') return '已绑定';
    return '已绑定';
  };

  // 发送验证码
  const handleSendSms = async () => {
    if (!bindPhone || smsCountdown > 0) return;
    setSmsSending(true);
    try {
      await authService.sendSmsCode(bindPhone);
      setSmsCountdown(60);
      const timer = setInterval(() => {
        setSmsCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setBindError('验证码发送失败');
    } finally {
      setSmsSending(false);
    }
  };

  // 绑定平台
  const handleBind = async (platform: string) => {
    setBindError('');
    setBindLoading(true);
    try {
      if (platform === 'phone') {
        if (!bindPhone || !bindSmsCode) {
          setBindError('请输入手机号和验证码');
          return;
        }
        await authService.bindPlatform(platform, { phone: bindPhone, smsCode: bindSmsCode });
      } else if (platform === 'email') {
        if (!bindEmail || !bindEmailPassword) {
          setBindError('请输入邮箱和密码');
          return;
        }
        await authService.bindPlatform(platform, { email: bindEmail, password: bindEmailPassword });
      } else if (platform === 'wechat') {
        // 微信绑定需要调用 wx.login
        // @ts-ignore
        if (typeof wx !== 'undefined') {
          // @ts-ignore
          wx.login({
            success: async (res: { code: string }) => {
              if (res.code) {
                await authService.bindPlatform(platform, { code: res.code });
                await loadProfile();
                setBindingPlatform(null);
              }
            },
          });
          return;
        }
        setBindError('请在微信小程序环境中使用');
        return;
      }
      await loadProfile();
      setBindingPlatform(null);
      // 清空表单
      setBindPhone('');
      setBindSmsCode('');
      setBindEmail('');
      setBindEmailPassword('');
    } catch (err: any) {
      setBindError(err?.message || '绑定失败');
    } finally {
      setBindLoading(false);
    }
  };

  // 解绑平台
  const handleUnbind = async (platform: string) => {
    // 检查是否是最后一种登录方式
    const boundPlatforms = Object.keys(profile?.user_auths || {}).filter(
      (key) => profile?.user_auths?.[key] && key !== platform
    );
    if (boundPlatforms.length === 0) {
      toast.warning('至少需要保留一种登录方式');
      return;
    }

    setUnbindingPlatform(platform);
    try {
      await authService.unbindPlatform(platform);
      await loadProfile();
    } catch (err: any) {
      toast.error(err?.message || '解绑失败');
    } finally {
      setUnbindingPlatform(null);
    }
  };

  // 修改密码
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!oldPassword || !newPassword) {
      setPasswordError('请填写完整');
      return;
    }
    if (newPassword.length < 6 || newPassword.length > 20) {
      setPasswordError('新密码需要 6-20 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({ oldPassword, newPassword });
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('密码修改成功');
    } catch (err: any) {
      setPasswordError(err?.message || '修改失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-bg-page">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-bg-card rounded-[12px] border border-border flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-text-main" />
          </motion.button>
          <span className="text-[16px] font-bold text-text-main">账号管理</span>
          <div className="w-[38px]" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="w-6 h-6 border-2 border-border border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-page relative">
      {/* Header */}
      <div className="bg-bg-page shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-[38px] h-[38px] bg-bg-card rounded-[12px] border border-border flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <ChevronLeft size={20} strokeWidth={2.5} className="text-text-main" />
          </motion.button>
          <span className="text-[16px] font-bold text-text-main">账号管理</span>
          <div className="w-[38px]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-5 space-y-3">
        {/* 当前登录方式 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">当前登录方式</p>
          <div className="bg-bg-card rounded-[18px] px-5 py-4 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <p className="text-[14px] font-medium text-text-main">
              {user?.loginType === 'wechat' && '微信登录'}
              {user?.loginType === 'phone' && '手机号登录'}
              {user?.loginType === 'email' && '邮箱登录'}
              {user?.loginType === 'apple' && 'Apple 登录'}
            </p>
            <p className="text-[12px] text-text-muted mt-1">
              {user?.phone || user?.email || '未绑定'}
            </p>
          </div>
        </div>

        {/* 绑定管理 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">绑定管理</p>
          <div className="bg-bg-card rounded-[18px] border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)] overflow-hidden">
            {PLATFORMS.map((platform, index) => {
              const bound = isBound(platform.key);
              const value = getPlatformValue(platform.key);
              const isBinding = bindingPlatform === platform.key;
              const isUnbinding = unbindingPlatform === platform.key;

              return (
                <div key={platform.key}>
                  {index > 0 && <div className="h-[1px] bg-bg-page mx-4" />}
                  <div className="px-4 py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] bg-bg-page rounded-[10px] flex items-center justify-center shrink-0">
                          <platform.icon size={18} strokeWidth={2} className={platform.color} />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-text-main">{platform.label}</p>
                          {bound && value && (
                            <p className="text-[11px] text-text-muted mt-0.5">{value}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {bound ? (
                          <>
                            <span className="text-[11px] text-[#07C160] flex items-center gap-1">
                              <Check size={12} strokeWidth={2.5} />
                              已绑定
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUnbind(platform.key)}
                              disabled={isUnbinding}
                              className="px-3 py-1.5 rounded-[100px] border border-border text-[12px] text-text-muted disabled:opacity-50"
                            >
                              {isUnbinding ? '解绑中...' : '解绑'}
                            </motion.button>
                          </>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setBindingPlatform(platform.key)}
                            className="px-3 py-1.5 rounded-[100px] bg-primary text-[12px] text-white"
                          >
                            + 绑定
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 修改密码（仅邮箱用户） */}
        {user?.loginType === 'email' && (
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">安全设置</p>
            <div className="bg-bg-card rounded-[18px] border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)] overflow-hidden">
              <motion.button
                whileTap={{ backgroundColor: '#F2F2F2' }}
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-[34px] h-[34px] bg-bg-page rounded-[10px] flex items-center justify-center shrink-0">
                    <Lock size={18} strokeWidth={2} className="text-primary" />
                  </div>
                  <span className="text-[14px] font-medium text-text-main">修改密码</span>
                </div>
                <motion.div
                  animate={{ rotate: showPasswordForm ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {showPasswordForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3">
                      <div className="h-[1px] bg-bg-page mx-0" />
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="当前密码"
                        className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="新密码（6-20位）"
                        className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="确认新密码"
                        className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                      />
                      {passwordError && (
                        <p className="text-[12px] text-red-500">{passwordError}</p>
                      )}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="w-full py-3 rounded-[12px] bg-primary text-[14px] font-medium text-white disabled:opacity-50"
                      >
                        {passwordLoading ? '修改中...' : '确认修改'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* 绑定弹窗 */}
      <AnimatePresence>
        {bindingPlatform && (
          <div className="absolute inset-0 z-[9999]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#121111]/50 backdrop-blur-[3px]"
              onClick={() => {
                setBindingPlatform(null);
                setBindError('');
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="absolute bottom-0 left-0 right-0 bg-bg-card rounded-t-[24px] shadow-[0_-8px_30px_rgba(41,37,38,0.14)] overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
              <div className="px-5 pt-3 pb-4 border-b border-border">
                <p className="text-[16px] font-bold text-text-main">
                  绑定{PLATFORMS.find((p) => p.key === bindingPlatform)?.label}
                </p>
              </div>

              <div className="px-5 py-4 space-y-3">
                {bindingPlatform === 'phone' && (
                  <>
                    <input
                      type="tel"
                      value={bindPhone}
                      onChange={(e) => setBindPhone(e.target.value)}
                      placeholder="请输入手机号"
                      className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={bindSmsCode}
                        onChange={(e) => setBindSmsCode(e.target.value)}
                        placeholder="验证码"
                        className="flex-1 bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendSms}
                        disabled={smsCountdown > 0 || !bindPhone}
                        className="px-4 py-3 rounded-[12px] bg-primary text-[13px] text-white disabled:opacity-50 shrink-0"
                      >
                        {smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码'}
                      </motion.button>
                    </div>
                  </>
                )}

                {bindingPlatform === 'email' && (
                  <>
                    <input
                      type="email"
                      value={bindEmail}
                      onChange={(e) => setBindEmail(e.target.value)}
                      placeholder="请输入邮箱"
                      className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                    />
                    <input
                      type="password"
                      value={bindEmailPassword}
                      onChange={(e) => setBindEmailPassword(e.target.value)}
                      placeholder="请设置密码（6位以上）"
                      className="w-full bg-bg-page rounded-[12px] px-4 py-3 text-[14px] text-text-main placeholder:text-[#DFDEDE] outline-none"
                    />
                  </>
                )}

                {bindingPlatform === 'wechat' && (
                  <p className="text-[13px] text-text-muted text-center py-4">
                    点击确认后将调用微信授权
                  </p>
                )}

                {bindingPlatform === 'apple' && (
                  <p className="text-[13px] text-text-muted text-center py-4">
                    点击确认后将调用 Apple 授权
                  </p>
                )}

                {bindError && (
                  <p className="text-[12px] text-red-500">{bindError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setBindingPlatform(null);
                      setBindError('');
                    }}
                    className="flex-1 py-3.5 rounded-[100px] border border-border text-[14px] font-medium text-text-muted"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleBind(bindingPlatform)}
                    disabled={bindLoading}
                    className="flex-1 py-3.5 rounded-[100px] bg-primary text-white text-[14px] font-bold disabled:opacity-50"
                  >
                    {bindLoading ? '绑定中...' : '确认绑定'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
