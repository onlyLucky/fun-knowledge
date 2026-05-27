import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import PageHeader from '../../../components/PageHeader'
import './index.less'

interface FavoriteItem {
  id: string
  title: string
  description: string
  category: string
  image?: string
  createdAt: string
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      // TODO: 调用 API 获取收藏列表
      setFavorites([])
    } catch (error) {
      console.error('Failed to load favorites', error)
    } finally {
      setLoading(false)
    }
  }

  const handleItemClick = (item: FavoriteItem) => {
    Taro.navigateTo({
      url: `/pages/home/detail/index?id=${item.id}`
    })
  }

  return (
    <View className="favorites-page">
      <PageHeader title="我的收藏" />

      {favorites.length > 0 ? (
        <View className="favorites-list">
          {favorites.map((item) => (
            <View
              key={item.id}
              className="favorite-item"
              onClick={() => handleItemClick(item)}
            >
              <View className="favorite-content">
                <Text className="favorite-title">{item.title}</Text>
                <Text className="favorite-desc">{item.description}</Text>
                <View className="favorite-meta">
                  <Text className="favorite-category">{item.category}</Text>
                  <Text className="favorite-time">{item.createdAt}</Text>
                </View>
              </View>
              {item.image && (
                <View className="favorite-image">
                  <Image src={item.image} mode="aspectFill" />
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className="empty-state">
          <Text className="empty-icon">❤️</Text>
          <Text className="empty-title">暂无收藏</Text>
          <Text className="empty-desc">浏览知识卡片时，点击收藏按钮即可添加到这里</Text>
        </View>
      )}
    </View>
  )
}
