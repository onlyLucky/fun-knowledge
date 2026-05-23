import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, categoryService, setCategoryMap, resolveImageUrl } from '@/api';
import { ReviewFieldInfo } from '@/api/types';

export interface UserProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;   // photo URL or empty string
  streak: number;
  totalCheckInDays: number;
  reviewInfo: {
    avatar?: ReviewFieldInfo;
    nickname?: ReviewFieldInfo;
    signature?: ReviewFieldInfo;
  };
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: '知识探索者',
  bio: '每天学一点，世界大一点',
  avatarUrl: '',
  streak: 0,
  totalCheckInDays: 0,
  reviewInfo: {},
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  /** 启动时初始化：拉取 profile + categories */
  initProfile: () => Promise<void>;
  /** 仅刷新 profile（不拉取 categories） */
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  initProfile: async () => {},
  refreshProfile: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('userProfile');
      if (!stored) return DEFAULT_PROFILE;
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        avatarUrl: resolveImageUrl(parsed.avatarUrl) || parsed.avatarUrl || '',
      };
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
        avatarUrl: resolveImageUrl(serverUser.avatar) || prev.avatarUrl,
        bio: serverUser.signature || prev.bio,
        streak: serverUser.streak_days ?? prev.streak,
        totalCheckInDays: serverUser.total_check_in_days ?? prev.totalCheckInDays,
        reviewInfo: serverUser.review_info || prev.reviewInfo,
      }));
      setCategoryMap(cats);
    } catch {
      // Server unavailable, keep localStorage defaults
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const serverUser = await authService.getProfile();
      setProfile((prev) => ({
        ...prev,
        nickname: serverUser.nickname || prev.nickname,
        avatarUrl: resolveImageUrl(serverUser.avatar) || prev.avatarUrl,
        bio: serverUser.signature || prev.bio,
        streak: serverUser.streak_days ?? prev.streak,
        totalCheckInDays: serverUser.total_check_in_days ?? prev.totalCheckInDays,
        reviewInfo: serverUser.review_info || prev.reviewInfo,
      }));
    } catch {
      // Server unavailable, keep localStorage defaults
    }
  }, []);

  return (
    <UserContext.Provider value={{ profile, updateProfile, initProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
