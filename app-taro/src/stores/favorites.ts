import { create } from 'zustand'
import http from '@/utils/http'

// ============================================
// 类型定义
// ============================================

interface FavoriteItem {
  id: string
  knowledgeId: string
  title: string
  image: string
  category: string
  createdAt: string
}

interface FavoritesState {
  items: FavoriteItem[]
  isLoaded: boolean
  loading: boolean
  loadFavorites: () => Promise<void>
  addFavorite: (knowledgeId: string) => Promise<boolean>
  removeFavorite: (knowledgeId: string) => Promise<boolean>
  isFavorited: (knowledgeId: string) => boolean
  clearFavorites: () => void
}

// ============================================
// Favorites Store
// ============================================

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  items: [],
  isLoaded: false,
  loading: false,

  loadFavorites: async () => {
    set({ loading: true })
    try {
      const items = await http.get<FavoriteItem[]>('/v1/favorite/list')
      set({ items, isLoaded: true, loading: false })
    } catch {
      set({ isLoaded: true, loading: false })
    }
  },

  addFavorite: async (knowledgeId) => {
    try {
      const item = await http.post<FavoriteItem>('/v1/favorite', {
        knowledge_id: knowledgeId
      })
      set((state) => ({
        items: [item, ...state.items]
      }))
      return true
    } catch {
      return false
    }
  },

  removeFavorite: async (knowledgeId) => {
    try {
      await http.delete(`/v1/favorite/${knowledgeId}`)
      set((state) => ({
        items: state.items.filter((item) => item.knowledgeId !== knowledgeId)
      }))
      return true
    } catch {
      return false
    }
  },

  isFavorited: (knowledgeId) => {
    return get().items.some((item) => item.knowledgeId === knowledgeId)
  },

  clearFavorites: () => {
    set({ items: [], isLoaded: false })
  }
}))

export default useFavoritesStore
