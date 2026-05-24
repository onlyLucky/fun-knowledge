import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Moon, Eye, Shield, ChevronRight, LogOut, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { getPortalTarget } from '@/lib/portal';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/lib/settings';

// ─── Toggle Row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ icon, title, subtitle, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-[34px] h-[34px] bg-bg-page rounded-[10px] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-[14px] font-medium text-text-main">{title}</p>
          {subtitle && <p className="text-[11px] text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-[100px] relative transition-colors duration-200 ${value ? 'bg-primary' : 'bg-border'}`}
      >
        <motion.div
          layout
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ left: value ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </motion.button>
    </div>
  );
}

// ─── Link Row ─────────────────────────────────────────────────────────────────

interface LinkRowProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}

function LinkRow({ icon, title, value, danger, onClick }: LinkRowProps) {
  return (
    <motion.button
      whileTap={{ backgroundColor: '#F2F2F2' }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 ${danger ? 'bg-red-50' : 'bg-bg-page'}`}>
          {icon}
        </div>
        <p className={`text-[14px] font-medium ${danger ? 'text-red-500' : 'text-text-main'}`}>{title}</p>
      </div>
      <div className="flex items-center gap-2 text-text-muted">
        {value && <span className="text-[12px] text-text-muted">{value}</span>}
        <ChevronRight size={16} strokeWidth={2} className={danger ? 'text-red-400' : 'text-[#DFDEDE]'} />
      </div>
    </motion.button>
  );
}

// ─── Logout Confirmation Modal ────────────────────────────────────────────────

function LogoutModal({ open, onConfirm, onClose }: { open: boolean; onConfirm: () => void; onClose: () => void }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[9999]">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#121111]/50 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="absolute bottom-0 left-0 right-0 bg-bg-card rounded-t-[24px] shadow-[0_-8px_30px_rgba(41,37,38,0.14)] overflow-hidden"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>
            <div className="px-5 pt-4 pb-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle size={26} strokeWidth={1.8} className="text-red-500" />
              </div>
              <p className="text-[17px] font-bold text-text-main mb-2">确认退出登录？</p>
              <p className="text-[13px] text-text-muted mb-6 leading-relaxed">
                退出后需要重新登录才能继续使用
              </p>
              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-[100px] border border-border text-[14px] font-medium text-text-muted"
                >
                  取消
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onConfirm}
                  className="flex-1 py-3.5 rounded-[100px] bg-red-500 text-white text-[14px] font-bold shadow-[0_4px_12px_rgba(239,68,68,0.3)]"
                >
                  退出登录
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    getPortalTarget()
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { settings, update } = useSettings();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleDarkModeToggle = (value: boolean) => {
    update('darkMode', value);
    document.documentElement.classList.toggle('dark', value);
  };

  const handleLogout = () => {
    logout();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-bg-page relative">
      <PageHeader title="设置" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8 space-y-3">
        {/* Section: 通知 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">通知</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <ToggleRow
              icon={<Bell size={18} strokeWidth={2} className="text-primary" />}
              title="每日推送"
              subtitle="每天 9:00 推送今日精选"
              value={settings.notifications}
              onChange={(v) => update('notifications', v)}
            />
          </div>
        </div>

        {/* Section: 外观 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">外观</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <ToggleRow
              icon={<Moon size={18} strokeWidth={2} className="text-primary" />}
              title="深色模式"
              subtitle="护眼夜间模式"
              value={settings.darkMode}
              onChange={handleDarkModeToggle}
            />
            <div className="h-[1px] bg-bg-page mx-4" />
            <ToggleRow
              icon={<Eye size={18} strokeWidth={2} className="text-primary" />}
              title="自动播放"
              subtitle="5 秒后自动切换下一张"
              value={settings.autoPlay}
              onChange={(v) => update('autoPlay', v)}
            />
          </div>
        </div>

        {/* Section: 语言与地区 */}
        {/* <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">语言与地区</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <LinkRow
              icon={<Globe size={18} strokeWidth={2} className="text-primary" />}
              title="语言"
              value={currentLangName}
              onClick={() => setShowLangModal(true)}
            />
          </div>
        </div> */}

        {/* Section: 隐私 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">隐私与数据</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            <ToggleRow
              icon={<Shield size={18} strokeWidth={2} className="text-primary" />}
              title="数据收集"
              subtitle="帮助我们改善推荐算法"
              value={settings.dataCollection}
              onChange={(v) => update('dataCollection', v)}
            />
            {/* <div className="h-[1px] bg-bg-page mx-4" />
            <LinkRow
              icon={<Trash2 size={18} strokeWidth={2} className="text-red-400" />}
              title="清除缓存"
              value="24.6 MB"
              danger
            /> */}
          </div>
        </div>

        {/* Section: 账号 */}
        <div>
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 px-1">账号</p>
          <div className="bg-bg-card rounded-[20px] border border-border/50 overflow-hidden shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
            {user && (
              <>
                <motion.button
                  whileTap={{ backgroundColor: '#F2F2F2' }}
                  onClick={() => navigate('/settings/account')}
                  className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-[34px] h-[34px] bg-bg-page rounded-[10px] flex items-center justify-center shrink-0">
                      <span className="text-[16px]">👤</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-text-main">{user.name}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {user.phone ?? user.email ?? (user.loginType === 'wechat' ? '微信账号' : 'Apple 账号')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
                </motion.button>
                <div className="h-[1px] bg-bg-page mx-4" />
              </>
            )}
            <motion.button
              whileTap={{ backgroundColor: '#FEF2F2' }}
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors"
            >
              <div className="w-[34px] h-[34px] bg-red-50 rounded-[10px] flex items-center justify-center shrink-0">
                <LogOut size={16} strokeWidth={2} className="text-red-500" />
              </div>
              <p className="text-[14px] font-medium text-red-500">退出登录</p>
            </motion.button>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-[11px] text-[#DFDEDE] pt-2">冷知识星球 v1.0.0</p>
      </div>

      {/* Language Modal */}
      {/* <LanguageModal
        open={showLangModal}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setShowLangModal(false)}
      /> */}

      {/* Logout Modal */}
      <LogoutModal
        open={showLogoutModal}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
}