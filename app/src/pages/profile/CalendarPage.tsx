import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { checkinService } from '@/api';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [checkedDays, setCheckedDays] = useState<Set<number>>(new Set());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    checkinService.getCheckInHistory({ month: monthStr, pageSize: 31 }).then((res) => {
      const days = new Set(
        res.list.map((c) => new Date(c.check_in_date).getDate())
      );
      setCheckedDays(days);
    }).catch(() => setCheckedDays(new Set()));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isFuture = (day: number) => {
    const d = new Date(year, month, day);
    return d > today;
  };

  // Build grid cells
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const checkedCount = checkedDays.size;
  // Streak: count from today backwards
  let streak = 0;
  for (let d = today.getDate(); d >= 1; d--) {
    if (checkedDays.has(d)) streak++;
    else break;
  }

  return (
    <div className="flex flex-col h-full bg-bg-page">
      <PageHeader title="打卡日历" subtitle="坚持学习，每天进步一点点" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '本月打卡', value: checkedCount, unit: '天' },
            { label: '当前连续', value: streak, unit: '天', highlight: true },
            { label: '完成率', value: Math.round((checkedCount / daysInMonth) * 100), unit: '%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-[16px] p-3 flex flex-col items-center justify-center border ${
                stat.highlight
                  ? 'bg-primary border-transparent'
                  : 'bg-bg-card border-border/50'
              }`}
            >
              {stat.highlight && <Flame size={14} className="text-[#FDFDFD]/60 mb-1" />}
              <p className={`text-[22px] font-bold leading-none ${stat.highlight ? 'text-[#FDFDFD]' : 'text-text-main'}`}>
                {stat.value}<span className={`text-[12px] ml-0.5 ${stat.highlight ? 'text-[#FDFDFD]/60' : 'text-text-muted'}`}>{stat.unit}</span>
              </p>
              <p className={`text-[10px] mt-1 ${stat.highlight ? 'text-[#FDFDFD]/60' : 'text-text-muted'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Calendar Card */}
        <div className="bg-bg-card rounded-[20px] p-4 border border-border/50 shadow-[0_2px_8px_rgba(41,37,38,0.05)]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <motion.button whileTap={{ scale: 0.88 }} onClick={prevMonth}
              className="w-8 h-8 rounded-[10px] bg-bg-page flex items-center justify-center">
              <ChevronLeft size={16} strokeWidth={2.5} className="text-text-main" />
            </motion.button>
            <p className="text-[15px] font-bold text-text-main">
              {year} 年 {MONTHS[month]}
            </p>
            <motion.button whileTap={{ scale: 0.88 }} onClick={nextMonth}
              className="w-8 h-8 rounded-[10px] bg-bg-page flex items-center justify-center">
              <ChevronRight size={16} strokeWidth={2.5} className="text-text-main" />
            </motion.button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[11px] text-text-muted font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1.5">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const checked = checkedDays.has(day);
              const future = isFuture(day);
              const today_ = isToday(day);
              return (
                <div key={day} className="flex justify-center">
                  <div
                    className={`w-9 h-9 rounded-[100px] flex items-center justify-center text-[13px] font-medium transition-colors
                      ${checked && !future ? 'bg-primary text-[#FDFDFD]' : ''}
                      ${today_ && !checked ? 'border-2 border-primary text-primary' : ''}
                      ${!checked && !today_ ? 'text-text-muted' : ''}
                      ${future ? 'text-[#DFDEDE]' : ''}
                    `}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-[10px] text-text-muted">已打卡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-primary" />
              <span className="text-[10px] text-text-muted">今天</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-bg-page" />
              <span className="text-[10px] text-text-muted">未打卡</span>
            </div>
          </div>
        </div>

        {/* Motivational tip */}
        <div className="bg-primary rounded-[16px] p-4 flex items-start gap-3">
          <Flame size={18} className="text-[#FDFDFD]/70 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-[#FDFDFD] mb-1">保持节奏！</p>
            <p className="text-[12px] text-[#FDFDFD]/60 leading-relaxed">
              你已连续打卡 {streak} 天，坚持每天学习 3 张卡片，一年后你将掌握超过 1000 个冷知识！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
