/* ---------- 存储工具 ---------- */

export const STORAGE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
export type StorageUnit = (typeof STORAGE_UNITS)[number];

export const UNIT_BYTES: Record<StorageUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

/** 将字节数转换为最合适的单位值和单位标签 */
export function bytesToBest(bytes: number): { value: number; unit: StorageUnit } {
  if (bytes <= 0) return { value: 0, unit: "B" };
  let best: StorageUnit = "B";
  let bestVal = bytes;
  for (const u of STORAGE_UNITS) {
    const v = bytes / UNIT_BYTES[u];
    if (v >= 1) {
      best = u;
      bestVal = v;
    }
  }
  return { value: Number(bestVal.toFixed(2)), unit: best };
}

/** 将字节数格式化为可读字符串（如 "1.5 GB"） */
export function formatStorage(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const { value, unit } = bytesToBest(bytes);
  const display = value % 1 === 0 ? String(value) : value.toFixed(2);
  return `${display} ${unit}`;
}

/** 将数值 + 单位转换回字节数 */
export function storageToBytes(value: number, unit: StorageUnit): number {
  return Math.round(value * UNIT_BYTES[unit]);
}
