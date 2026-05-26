import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import http from '@/utils/http'

// ============================================
// 类型定义
// ============================================

export interface AuthUser {
  id: string
  name: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  signature?: string
  loginType: 'phone' | 'wechat' | 'apple'
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  refreshToken: string | null
  isLoggedIn: boolean
  isInitialized: boolean
  login: (user: AuthUser, token: string, refreshToken?: string) => void
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  checkAuth: () => Promise<boolean>
  setInitialized: (value: boolean) => void
}

// ============================================
// Taro 存储适配器
// ============================================

const taroStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const { data } = await Taro.getStorage({ key: name })
      return data
    } catch {
      return null
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await Taro.setStorage({ key: name, data: value })
  },
  removeItem: async (name: string): Promise<void> => {
    await Taro.removeStorage({ key: name })
  }
}

// ============================================
// Auth Store
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isInitialized: false,

      login: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken ?? null,
          isLoggedIn: true
        })
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isLoggedIn: false
        })
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          })
        }
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isLoggedIn: false })
          return false
        }

        try {
          const user = await http.get<AuthUser>('/v1/auth/profile')
          set({
            user,
            isLoggedIn: true
          })
          return true
        } catch {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isLoggedIn: false
          })
          return false
        }
      },

      setInitialized: (value) => {
        set({ isInitialized: value })
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
)

export default useAuthStore
