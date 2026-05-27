import { useState, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';

const DARK_MODE_KEY = 'app_dark_mode';

/**
 * 暗色模式 hook
 * 管理暗色模式状态，包括本地存储和 DOM 类名切换
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return Taro.getStorageSync(DARK_MODE_KEY) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // 切换 document 的 dark 类
    document.documentElement.classList.toggle('dark', isDark);

    // 保存到本地存储
    try {
      Taro.setStorageSync(DARK_MODE_KEY, isDark);
    } catch (e) {
      console.error('Failed to save dark mode preference', e);
    }
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
  }, []);

  return { isDark, toggleDark, setDark };
}

/**
 * 获取当前暗色模式状态（非 hook 版本）
 */
export function getDarkMode(): boolean {
  try {
    return Taro.getStorageSync(DARK_MODE_KEY) || false;
  } catch {
    return false;
  }
}

/**
 * 设置暗色模式状态（非 hook 版本）
 */
export function setDarkMode(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
  try {
    Taro.setStorageSync(DARK_MODE_KEY, isDark);
  } catch (e) {
    console.error('Failed to save dark mode preference', e);
  }
}
