import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Star, Calendar, AlertCircle, Settings, Info, ChevronRight, BookOpen, Flame, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { PageHeader } from '@/components/PageHeader';
import { useUser } from '@/providers/UserContext';
import { favoriteService, checkinService } from '@/api';
import DefaultAvatar from '@/assets/images/avatar.png';

// ─── Avatar display ───────────────────────────────────────────────────────────

function Avatar({ size = 52 }: { size?: number }) {
  const { profile } = useUser();
  const style = { width: size, height: size, borderRadius: '100px', overflow: 'hidden' as const, flexShrink: 0 as const };
  if (profile.avatarUrl) {
    return (
      <div style={style} className="shadow-sm">
        <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div style={style} className="shadow-sm">
      <img src={DefaultAvatar} alt="avatar" className="w-full h-full object-cover" />
    </div>
  );
}

// ─── Menu Row ─────────────────────────────────────────────────────────────────

function MenuRow({
  icon,
  title,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ backgroundColor: '#F2F2F2' }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-[34px] h-[34px] bg-[#F2F2F2] rounded-[10px] flex items-center justify-center">
          {icon}
        </div>
        <span className="text-[#121111] text-[14px] font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2 text-[#878787]">
        {value && (
          <span className="text-[12px] bg-[#F2F2F2] px-2 py-0.5 rounded-[100px] text-[#787676] font-medium">
            {value}
          </span>
        )}
        <ChevronRight size={16} strokeWidth={2} className="text-[#DFDEDE]" />
      </div>
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Profile() {
  const navigate = useNavigate();
  const { profile } = useUser();

  const [saved, setSaved] = useState(0);
  const [checkedDays, setCheckedDays] = useState<boolean[]>([false, false, false, false, false, false, false]);

  useEffect(() => {
    favoriteService.getFavorites({ pageSize: 1 }).then((res) => {
      setSaved(res.total);
    }).catch(() => {});

    // Compute this week's check-in days
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    checkinService.getCheckInHistory({ month: monthStr, pageSize: 31 }).then((res) => {
      const checked = new Set(
        res.list.map((c) => c.check_in_date.slice(0, 10))
      );
      const week: boolean[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        week.push(checked.has(key));
      }
      setCheckedDays(week);
    }).catch(() => {});
  }, []);

  const days = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="flex flex-col h-full bg-[#F2F2F2] overflow-y-auto no-scrollbar">
      <PageHeader
        title="我的"
        subtitle="个人中心"
        showBack={false}
        right={
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/settings')}
            className="w-[38px] h-[38px] bg-[#FDFDFD] rounded-[12px] border border-[#DFDEDE] flex items-center justify-center shadow-[0_2px_6px_rgba(41,37,38,0.06)]"
          >
            <Settings size={18} strokeWidth={2} className="text-[#121111]" />
          </motion.button>
        }
      />

      {/* ── Profile Stats Card ── */}
      <div className="px-5 pb-4 shrink-0">
        <div className="bg-[#292526] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(41,37,38,0.25)]">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8 pointer-events-none" />

          {/* User row */}
          <div className="flex items-center gap-3 mb-5 relative z-10">
            <div className="relative">
              <Avatar size={54} />
              {/* Edit badge */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate('/profile/edit')}
                className="absolute -bottom-0.5 -right-0.5 w-[20px] h-[20px] bg-white rounded-full flex items-center justify-center shadow-md"
              >
                <Pencil size={10} strokeWidth={2.5} className="text-[#292526]" />
              </motion.button>
            </div>
            <div className="flex-1 min-w-0">
              {/* <p className="text-[#FDFDFD]/60 text-[11px] mb-0.5">知识等级 · 探索者</p> */}
              <h2 className="text-[#FDFDFD] text-[17px] font-bold truncate">{profile.nickname}</h2>
              {profile.bio ? (
                <p className="text-[#FDFDFD]/50 text-[11px] mt-0.5 truncate">{profile.bio}</p>
              ) : null}
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate('/profile/edit')}
              className="shrink-0 flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-[100px]"
            >
              <Pencil size={11} strokeWidth={2} className="text-white/70" />
              <span className="text-[11px] text-white/70">编辑</span>
            </motion.button>
          </div>

          {/* Stats row */}
          <div className="flex items-stretch gap-3 relative z-10">
            <div className="flex-1 bg-white/10 rounded-[14px] p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame size={13} className="text-[#FDFDFD]/70" />
                <p className="text-[#FDFDFD]/60 text-[10px]">连续打卡</p>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-[#FDFDFD] text-[22px] font-bold leading-none">{profile.streak}</p>
                <p className="text-[#FDFDFD]/50 text-[10px]">天</p>
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-[14px] p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={13} className="text-[#FDFDFD]/70" />
                <p className="text-[#FDFDFD]/60 text-[10px]">累计打卡</p>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-[#FDFDFD] text-[22px] font-bold leading-none">{profile.totalCheckInDays}</p>
                <p className="text-[#FDFDFD]/50 text-[10px]">天</p>
              </div>
            </div>
            <div className="flex-1 bg-white/10 rounded-[14px] p-3 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={13} className="text-[#FDFDFD]/70" />
                <p className="text-[#FDFDFD]/60 text-[10px]">已收藏</p>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-[#FDFDFD] text-[22px] font-bold leading-none">{saved}</p>
                <p className="text-[#FDFDFD]/50 text-[10px]">张</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7-Day Check-in ── */}
      <div className="px-5 pb-4 shrink-0">
        <div className="bg-[#FDFDFD] rounded-[20px] p-4 border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold text-[#121111]">本周打卡</p>
            <button
              onClick={() => navigate('/calendar')}
              className="text-[11px] text-[#878787] flex items-center gap-0.5 active:opacity-60"
            >
              查看全部 <ChevronRight size={12} strokeWidth={2.5} />
            </button>
          </div>
          <div className="flex justify-between">
            {days.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <p className="text-[10px] text-[#878787]">{day}</p>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className={`w-8 h-8 rounded-[100px] flex items-center justify-center text-[12px] font-medium transition-colors ${
                    checkedDays[i]
                      ? 'bg-[#292526] text-[#FDFDFD]'
                      : 'bg-[#F2F2F2] text-[#DFDEDE] border border-[#DFDEDE]'
                  }`}
                >
                  {checkedDays[i] ? '✓' : '·'}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Groups ── */}
      <div className="px-5 pb-8 space-y-3">
        {/* Learning group */}
        <div className="bg-[#FDFDFD] rounded-[20px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
          <MenuRow
            icon={<Star size={18} strokeWidth={2} className="text-[#292526]" />}
            title="我的收藏"
            value={String(saved)}
            onClick={() => navigate('/favorites')}
          />
          <div className="h-[1px] bg-[#F2F2F2] mx-4" />
          <MenuRow
            icon={<Calendar size={18} strokeWidth={2} className="text-[#292526]" />}
            title="打卡日历"
            onClick={() => navigate('/calendar')}
          />
          <div className="h-[1px] bg-[#F2F2F2] mx-4" />
          <MenuRow
            icon={<BookOpen size={18} strokeWidth={2} className="text-[#292526]" />}
            title="浏览历史"
            onClick={() => navigate('/browse-history')}
          />
          <div className="h-[1px] bg-[#F2F2F2] mx-4" />
          <MenuRow
            icon={<AlertCircle size={18} strokeWidth={2} className="text-[#292526]" />}
            title="纠错记录"
            onClick={() => navigate('/error-reports')}
          />
        </div>

        {/* System group */}
        <div className="bg-[#FDFDFD] rounded-[20px] overflow-hidden border border-[#DFDEDE]/50 shadow-[0_2px_8px_rgba(41,37,38,0.04)]">
          <MenuRow
            icon={<Settings size={18} strokeWidth={2} className="text-[#878787]" />}
            title="设置"
            onClick={() => navigate('/settings')}
          />
          <div className="h-[1px] bg-[#F2F2F2] mx-4" />
          <MenuRow
            icon={<Info size={18} strokeWidth={2} className="text-[#878787]" />}
            title="关于冷知识星球"
            onClick={() => navigate('/about')}
          />
        </div>
      </div>
    </div>
  );
}