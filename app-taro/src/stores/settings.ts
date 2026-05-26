import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Taro from '@tarojs/taro'

// ============================================
// 类型定义
// ============================================

interface SettingsState {
  darkMode: boolean
  autoPlay: boolean
  dataCollection: boolean
  notification: boolean
  soundEffect: boolean
  fontSize: 'small' | 'medium' | 'large'
  isInitialized: boolean
  init: () => Promise<void>
  toggleDarkMode: () => void
  toggleAutoPlay: () => void
  toggleDataCollection: () => void
  toggleNotification: () => void
  toggleSoundEffect: () => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
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
// Settings Store
// ============================================

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      darkMode: false,
      autoPlay: false,
      dataCollection: true,
      notification: true,
      soundEffect: true,
      fontSize: 'medium',
      isInitialized: false,

      init: async () => {
        const state = get()
        set({ isInitialized: true })
        
        // 应用暗色模式
        if (state.darkMode) {
          Taro.setNavigationBarColor({
            backgroundColor: '#1C1A1B',
            frontColor: '#ffffff'
          })
        }
      },

      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode
        set({ darkMode: newDarkMode })
        
        Taro.setNavigationBarColor({
          backgroundColor: newDarkMode ? '#1C1A1B' : '#FDFDFD',
          frontColor: newDarkMode ? '#ffffff' : '#000000'
        })
      },

      toggleAutoPlay: () => {
        set({ autoPlay: !get().autoPlay })
      },

      toggleDataCollection: () => {
        set({ dataCollection: !get().dataCollection })
      },

      toggleNotification: () => {
        set({ notification: !get().notification })
      },

      toggleSoundEffect: () => {
        set({ soundEffect: !get().soundEffect })
      },

      setFontSize: (size) => {
        set({ fontSize: size })
      }
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        darkMode: state.darkMode,
        autoPlay: state.autoPlay,
        dataCollection: state.dataCollection,
        notification: state.notification,
        soundEffect: state.soundEffect,
        fontSize: state.fontSize
      })
    }
  )
)

export default useSettingsStore
