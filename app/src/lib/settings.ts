import { useState, useCallback } from 'react';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoPlay: boolean;
  dataCollection: boolean;
}

const STORAGE_KEY = 'app_settings';

const DEFAULTS: Settings = {
  notifications: true,
  darkMode: false,
  autoPlay: false,
  dataCollection: true,
};

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(stored) };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const update = useCallback((key: keyof Settings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, update };
}
