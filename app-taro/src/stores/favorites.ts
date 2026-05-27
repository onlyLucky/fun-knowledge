import { create } from 'zustand'
import { favoriteService } from '@/api'

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
      const result = await favoriteService.getFavorites()
      const items = result.list.map((k: any) => ({
        id: k.id,
        knowledgeId: k.id,
        title: k.title,
        image: k.resource_url || '',
        category: k.category?.name || '',
        createdAt: k.created_at
      }))
      set({ items, isLoaded: true, loading: false })
    } catch {
      set({ isLoaded: true, loading: false })
    }
  },

  addFavorite: async (knowledgeId) => {
    try {
      await favoriteService.addFavorite(knowledgeId)
      return true
    } catch {
      return false
    }
  },

  removeFavorite: async (knowledgeId) => {
    try {
      await favoriteService.removeFavorite(knowledgeId)
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
