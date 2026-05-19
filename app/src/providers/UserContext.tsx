import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, categoryService, setCategoryMap } from '@/api';

export interface UserProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;   // photo URL or empty string
  avatarEmoji: string; // emoji fallback
  avatarBg: string;    // bg color for emoji avatars
  usePhoto: boolean;
  streak: number;
  totalCheckInDays: number;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: '知识探索者',
  bio: '每天学一点，世界大一点 🌍',
  avatarUrl: '',
  avatarEmoji: '🌍',
  avatarBg: '#292526',
  usePhoto: false,
  streak: 0,
  totalCheckInDays: 0,
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  initProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  initProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const initProfile = useCallback(async () => {
    try {
      const [serverUser, cats] = await Promise.all([
        authService.getProfile(),
        categoryService.getCategories(),
      ]);
      setProfile((prev) => ({
        ...prev,
        nickname: serverUser.nickname || prev.nickname,
        avatarUrl: serverUser.avatar || prev.avatarUrl,
        bio: serverUser.signature || prev.bio,
        streak: serverUser.streak_days ?? prev.streak,
        totalCheckInDays: serverUser.total_check_in_days ?? prev.totalCheckInDays,
      }));
      setCategoryMap(cats);
    } catch {
      // Server unavailable, keep localStorage defaults
    }
  }, []);

  return (
    <UserContext.Provider value={{ profile, updateProfile, initProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
