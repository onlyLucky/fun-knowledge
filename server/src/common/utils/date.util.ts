/**
 * 格式化日期为 YYYY-MM-DD hh:mm:ss
 */
export function formatDateTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${M}-${d} ${h}:${m}:${s}`;
}

/**
 * 递归将对象中的 Date 实例转换为格式化字符串
 */
export function formatDates(obj: unknown): unknown {
  if (obj instanceof Date) {
    return formatDateTime(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(formatDates);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = formatDates((obj as Record<string, unknown>)[key]);
    }
    return result;
  }
  return obj;
}
