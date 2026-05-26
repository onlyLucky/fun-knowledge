import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'
import http from '@/utils/http'

// ============================================
// 类型定义
// ============================================

interface UserStats {
  checkInDays: number
  totalCheckIns: number
  favoriteCount: number
  browseCount: number
}

interface UserState {
  stats: UserStats
  isLoaded: boolean
  loadStats: () => Promise<void>
  incrementCheckIn: () => void
  updateFavoriteCount: (count: number) => void
  updateBrowseCount: (count: number) => void
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
// User Store
// ============================================

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      stats: {
        checkInDays: 0,
        totalCheckIns: 0,
        favoriteCount: 0,
        browseCount: 0
      },
      isLoaded: false,

      loadStats: async () => {
        try {
          const stats = await http.get<UserStats>('/v1/user/stats')
          set({ stats, isLoaded: true })
        } catch {
          set({ isLoaded: true })
        }
      },

      incrementCheckIn: () => {
        const { stats } = get()
        set({
          stats: {
            ...stats,
            checkInDays: stats.checkInDays + 1,
            totalCheckIns: stats.totalCheckIns + 1
          }
        })
      },

      updateFavoriteCount: (count) => {
        const { stats } = get()
        set({
          stats: { ...stats, favoriteCount: count }
        })
      },

      updateBrowseCount: (count) => {
        const { stats } = get()
        set({
          stats: { ...stats, browseCount: count }
        })
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        stats: state.stats
      })
    }
  )
)

export default useUserStore
