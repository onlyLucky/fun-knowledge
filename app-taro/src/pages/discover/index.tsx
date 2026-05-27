import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-taro-react'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { PageHeader } from '@/components'
import { discoverService, knowledgeService, mapServerKnowledgeList } from '@/api'
import { KnowledgeCard, HotSearchItem } from '@/types'
import './index.less'

export default function Discover() {
  const [searchText, setSearchText] = useState('')
  const [hotSearches, setHotSearches] = useState<HotSearchItem[]>([])
  const [searchResults, setSearchResults] = useState<KnowledgeCard[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    loadHotSearches()
  }, [])

  async function loadHotSearches() {
    try {
      const result = await discoverService.getHotSearches()
      setHotSearches(result)
    } catch (error) {
      console.error('Load hot searches error:', error)
    }
  }

  async function handleSearch() {
    if (!searchText.trim()) return
    
    setLoading(true)
    setSearched(true)
    
    try {
      const result = await discoverService.searchKnowledge(searchText.trim())
      setSearchResults(mapServerKnowledgeList(result.list))
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleHotSearchClick(keyword: string, cardId?: string) {
    setSearchText(keyword)
    if (cardId) {
      Taro.navigateTo({ url: `/pages/home/card-detail/index?id=${cardId}` })
    } else {
      handleSearch()
    }
  }

  function handleCardClick(id: string) {
    Taro.navigateTo({ url: `/pages/home/card-detail/index?id=${id}` })
  }

  return (
    <View className="discover-page">
      <PageHeader title="发现" showBack={false} />

      <View className="search-box">
        <View className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <Input
            className="search-input"
            placeholder="搜索知识..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
          />
        </View>
        <View className="search-btn" onClick={handleSearch}>
          <Text>搜索</Text>
        </View>
      </View>

      {searched ? (
        <View className="search-results">
          {loading ? (
            <View className="loading-state">
              <View className="loading-spinner" />
              <Text>搜索中...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              <View className="result-header">
                <Text>找到 {searchResults.length} 条结果</Text>
              </View>
              <ScrollView scrollY className="result-list">
                {searchResults.map(card => (
                  <View 
                    key={card.id} 
                    className="result-item"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <Image src={card.image} mode="aspectFill" className="result-image" />
                    <View className="result-content">
                      <Text className="result-title">{card.title}</Text>
                      <Text className="result-category">{card.category}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <View className="empty-state">
              <Text>没有找到相关内容</Text>
            </View>
          )}
        </View>
      ) : (
        <View className="hot-search-section">
          <View className="section-header">
            <Text className="section-title">热门搜索</Text>
            <View 
              className="more-btn"
              onClick={() => Taro.navigateTo({ url: '/pages/discover/hot-search/index' })}
            >
              <Text>查看全部</Text>
            </View>
          </View>

          <View className="hot-search-list">
            {hotSearches.slice(0, 10).map((item) => (
              <View
                key={item.rank}
                className="hot-search-item"
                onClick={() => handleHotSearchClick(item.keyword, item.cardId)}
              >
                <View className={`rank-badge rank-${item.rank}`}>
                  <Text>{item.rank}</Text>
                </View>
                <Text className="hot-keyword">{item.keyword}</Text>
                <View className="trend-icon">
                  {item.trend === 'up' && <TrendingUp size={14} className="trend-up" />}
                  {item.trend === 'down' && <TrendingDown size={14} className="trend-down" />}
                  {item.trend === 'same' && <Minus size={14} className="trend-same" />}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
