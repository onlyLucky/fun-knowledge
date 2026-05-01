import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  nickname: string;
  bio: string;
  avatarUrl: string;   // photo URL or empty string
  avatarEmoji: string; // emoji fallback
  avatarBg: string;    // bg color for emoji avatars
  usePhoto: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: '知识探索者',
  bio: '每天学一点，世界大一点 🌍',
  avatarUrl: '',
  avatarEmoji: '🌍',
  avatarBg: '#292526',
  usePhoto: false,
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
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

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
