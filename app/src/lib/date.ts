import { format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * Format date into semantic label: 今天、昨天、本周、上周、本月、M月、yyyy年M月
 */
export function formatSemanticDate(dateStr: string): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;

  if (isToday(date)) return '今天';
  if (isYesterday(date)) return '昨天';

  if (isThisWeek(date, { weekStartsOn: 0 })) return '本周';

  // Check last week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const lastWeekStart = new Date(now);
  lastWeekStart.setDate(now.getDate() - dayOfWeek - 7);
  lastWeekStart.setHours(0, 0, 0, 0);
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);

  if (date >= lastWeekStart && date <= lastWeekEnd) return '上周';

  if (isThisMonth(date)) return '本月';
  if (isThisYear(date)) return format(date, 'M月', { locale: zhCN });

  return format(date, 'yyyy年M月', { locale: zhCN });
}

/**
 * Group items by semantic date label
 */
export function groupBySemanticDate<T extends { viewed_at: string }>(
  items: T[]
): Array<{ label: string; items: T[] }> {
  const groups: Array<{ label: string; items: T[] }> = [];
  const labelMap = new Map<string, T[]>();

  for (const item of items) {
    const label = formatSemanticDate(item.viewed_at);
    if (!labelMap.has(label)) {
      labelMap.set(label, []);
    }
    labelMap.get(label)!.push(item);
  }

  // Preserve insertion order (already sorted by viewed_at DESC)
  for (const [label, groupItems] of labelMap) {
    groups.push({ label, items: groupItems });
  }

  return groups;
}
