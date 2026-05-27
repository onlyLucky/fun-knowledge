import { View, Text, ScrollView, Image } from '@tarojs/components'
import { SlidersHorizontal, Star, Sparkles, CircleAlert, ChevronUp, RefreshCw } from 'lucide-taro-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import Taro from '@tarojs/taro'
import { PageHeader } from '@/components'
import { useAuthStore } from '@/stores'
import { debounce } from '@/utils'
import { 
  categoryService, 
  knowledgeService, 
  favoriteService,
  mapServerCategories,
  mapServerKnowledgeList
} from '@/api'
import { KnowledgeCard, Category } from '@/types'
import './index.less'

export default function Home() {
  const [cards, setCards] = useState<KnowledgeCard[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  
  const { user } = useAuthStore()
  
  const PAGE_SIZE = 20
  const pageRef = useRef(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeCategory])

  async function loadData() {
    setLoading(true)
    pageRef.current = 1
    setHasMore(true)
    
    try {
      const [catsResult, cardsResult] = await Promise.all([
        categoryService.getCategories(),
        activeCategory === 'all'
          ? knowledgeService.getRecommendations({ page: 1, pageSize: PAGE_SIZE })
          : knowledgeService.getKnowledgeList({ category_id: activeCategory, page: 1, pageSize: PAGE_SIZE })
      ])
      
      setCategories([
        { id: 'all', name: '全部', icon: 'Layers', description: '', sort: 0, knowledgeCount: 0 },
        ...mapServerCategories(catsResult)
      ])
      setCards(mapServerKnowledgeList(cardsResult.list))
      setHasMore(cardsResult.list.length === PAGE_SIZE)
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMore() {
    if (loading || !hasMore) return
    
    const nextPage = pageRef.current + 1
    try {
      const result = activeCategory === 'all'
        ? await knowledgeService.getRecommendations({ page: nextPage, pageSize: PAGE_SIZE })
        : await knowledgeService.getKnowledgeList({ category_id: activeCategory, page: nextPage, pageSize: PAGE_SIZE })
      
      if (result.list.length > 0) {
        setCards(prev => [...prev, ...mapServerKnowledgeList(result.list)])
        pageRef.current = nextPage
        setHasMore(result.list.length === PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Load more error:', error)
    }
  }

  const handleSwipeUp = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      if (nextIndex >= pageRef.current * PAGE_SIZE - 10 && hasMore) {
        loadMore()
      }
    }
  }, [currentIndex, cards.length, hasMore])

  const handleSwipeDown = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const handleRefresh = useCallback(debounce(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPullDistance(40)
    
    try {
      await loadData()
    } finally {
      setTimeout(() => {
        setRefreshing(false)
        setPullDistance(0)
      }, 500)
    }
  }, 300), [refreshing, activeCategory])

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id)
    setCurrentIndex(0)
  }

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/home/card-detail/index?id=${id}` })
  }

  const handleAIClick = (id: string, title: string) => {
    Taro.navigateTo({ url: `/pages/home/ai-sheet/index?id=${id}&title=${encodeURIComponent(title)}` })
  }

  const handleFavorite = async (id: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        await favoriteService.removeFavorite(id)
      } else {
        await favoriteService.addFavorite(id)
      }
      setCards(prev => prev.map(card => 
        card.id === id ? { ...card, isFavorited: !isFavorited } : card
      ))
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name ?? '全部'

  return (
    <View className="home-page">
      <PageHeader
        title="冷知识星球"
        subtitle={`当前：${activeCategoryName}`}
        showBack={false}
        right={
          <View 
            className="category-btn"
            onClick={() => Taro.navigateTo({ url: '/pages/home/category-modal/index' })}
          >
            <SlidersHorizontal size={18} strokeWidth={2} />
          </View>
        }
      />

      <ScrollView
        scrollX
        className="category-scroll"
        scrollWithAnimation
      >
        <View className="category-list">
          {categories.map(category => (
            <View
              key={category.id}
              className={`category-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <Text>{category.name}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View 
        className="pull-indicator"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : 0 }}
      >
        <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
        <Text>{refreshing ? '刷新中...' : '下拉刷新'}</Text>
      </View>

      <View className="card-container">
        {loading ? (
          <View className="loading-state">
            <View className="loading-spinner" />
            <Text>加载中...</Text>
          </View>
        ) : cards.length > 0 ? (
          cards.slice(currentIndex, currentIndex + 2).map((card, index) => (
            <View
              key={card.id}
              className={`knowledge-card ${index === 0 ? 'active' : ''}`}
              style={{ zIndex: cards.length - currentIndex - index }}
            >
              <View 
                className="card-image-wrapper"
                onClick={() => handleCardClick(card.id)}
              >
                <Image 
                  src={card.image} 
                  mode="aspectFill"
                  className="card-image"
                />
                <View className="category-badge">
                  <Text>{card.category}</Text>
                </View>
                <View className="swipe-hint">
                  <ChevronUp size={11} />
                  <Text>上滑切换</Text>
                </View>
              </View>

              <View 
                className="card-content"
                onClick={() => handleCardClick(card.id)}
              >
                <Text className="card-title">{card.title}</Text>
                <Text className="card-desc">{card.description}</Text>
                <View className="card-source">
                  <View className="source-dot" />
                  <Text>来源：{card.source}</Text>
                </View>
              </View>

              <View className="card-actions">
                <View 
                  className="action-btn"
                  onClick={() => handleFavorite(card.id, card.isFavorited)}
                >
                  <Star 
                    size={18} 
                    className={card.isFavorited ? 'starred' : ''}
                  />
                </View>

                <View 
                  className="ai-btn"
                  onClick={() => handleAIClick(card.id, card.title)}
                >
                  <Sparkles size={15} />
                  <Text>AI 解读</Text>
                </View>

                <View 
                  className="action-btn"
                  onClick={() => Taro.navigateTo({ url: `/pages/report/content/index?knowledgeId=${card.id}` })}
                >
                  <CircleAlert size={18} />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="empty-state">
            <Text>这个类目下还没有卡片哦</Text>
          </View>
        )}
      </View>

      {cards.length > 0 && (
        <View className="progress-dots">
          {cards.slice(0, Math.min(cards.length, 5)).map((_, i) => (
            <View 
              key={i} 
              className={`dot ${i === currentIndex ? 'active' : ''}`}
            />
          ))}
        </View>
      )}
    </View>
  )
}
