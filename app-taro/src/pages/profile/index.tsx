import { View, Text, Image, ScrollView } from '@tarojs/components'
import { Settings, Calendar, Star, Clock, ChevronRight, Award } from 'lucide-taro-react'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { PageHeader } from '@/components'
import { useAuthStore, useUserStore } from '@/stores'
import { checkinService, authService } from '@/api'
import './index.less'

export default function Profile() {
  const { user, logout } = useAuthStore()
  const { stats, setStatsFromProfile } = useUserStore()
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    loadProfile()
    checkTodayCheckIn()
  }, [])

  async function loadProfile() {
    try {
      const profile = await authService.getProfile()
      setStatsFromProfile({
        streak_days: profile.streak_days,
        total_check_in_days: profile.total_check_in_days
      })
    } catch (error) {
      console.error('Load profile error:', error)
    }
  }

  async function checkTodayCheckIn() {
    try {
      const result = await checkinService.getCheckInStatus()
      setCheckedIn(result.checked_in)
    } catch (error) {
      console.error('Check checkin status error:', error)
    }
  }

  async function handleCheckIn() {
    if (checkedIn) return
    
    try {
      await checkinService.checkIn()
      setCheckedIn(true)
      Taro.showToast({ title: '打卡成功！', icon: 'success' })
    } catch (error) {
      console.error('Checkin error:', error)
    }
  }

  function handleLogout() {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.reLaunch({ url: '/pages/auth/welcome/index' })
        }
      }
    })
  }

  return (
    <View className="profile-page">
      <PageHeader title="我的" showBack={false} />

      <ScrollView scrollY className="profile-content">
        <View className="user-card">
          <View 
            className="avatar-wrapper"
            onClick={() => Taro.navigateTo({ url: '/pages/profile/avatar-edit/index' })}
          >
            <Image 
              src={user?.avatar || '/assets/images/avatar.png'} 
              className="avatar"
            />
            <View className="avatar-edit-hint">
              <Text>编辑</Text>
            </View>
          </View>
          
          <View className="user-info">
            <Text className="nickname">{user?.nickname || '未设置昵称'}</Text>
            {user?.signature && (
              <Text className="signature">{user.signature}</Text>
            )}
          </View>

          <View 
            className="edit-btn"
            onClick={() => Taro.navigateTo({ url: '/pages/profile/edit/index' })}
          >
            <ChevronRight size={18} />
          </View>
        </View>

        <View className="stats-card">
          <View className="stat-item">
            <View className="stat-value">
              <Award size={16} className="stat-icon" />
              <Text>{stats.checkInDays}</Text>
            </View>
            <Text className="stat-label">连续打卡</Text>
          </View>
          
          <View className="stat-divider" />
          
          <View className="stat-item">
            <View className="stat-value">
              <Star size={16} className="stat-icon" />
              <Text>{stats.favoriteCount}</Text>
            </View>
            <Text className="stat-label">收藏</Text>
          </View>
          
          <View className="stat-divider" />
          
          <View className="stat-item">
            <View className="stat-value">
              <Clock size={16} className="stat-icon" />
              <Text>{stats.browseCount}</Text>
            </View>
            <Text className="stat-label">浏览</Text>
          </View>
        </View>

        <View 
          className={`checkin-card ${checkedIn ? 'checked' : ''}`}
          onClick={handleCheckIn}
        >
          <View className="checkin-icon">
            <Calendar size={24} />
          </View>
          <View className="checkin-content">
            <Text className="checkin-title">
              {checkedIn ? '今日已打卡' : '每日打卡'}
            </Text>
            <Text className="checkin-subtitle">
              {checkedIn ? '明天再来吧~' : '点击打卡获取积分'}
            </Text>
          </View>
          {!checkedIn && <ChevronRight size={18} className="checkin-arrow" />}
        </View>

        <View className="menu-section">
          <View 
            className="menu-item"
            onClick={() => Taro.navigateTo({ url: '/pages/profile/favorites/index' })}
          >
            <Star size={20} className="menu-icon" />
            <Text className="menu-label">我的收藏</Text>
            <ChevronRight size={18} className="menu-arrow" />
          </View>

          <View 
            className="menu-item"
            onClick={() => Taro.navigateTo({ url: '/pages/profile/browse-history/index' })}
          >
            <Clock size={20} className="menu-icon" />
            <Text className="menu-label">浏览历史</Text>
            <ChevronRight size={18} className="menu-arrow" />
          </View>

          <View 
            className="menu-item"
            onClick={() => Taro.navigateTo({ url: '/pages/profile/calendar/index' })}
          >
            <Calendar size={20} className="menu-icon" />
            <Text className="menu-label">打卡日历</Text>
            <ChevronRight size={18} className="menu-arrow" />
          </View>

          <View 
            className="menu-item"
            onClick={() => Taro.navigateTo({ url: '/pages/settings/index' })}
          >
            <Settings size={20} className="menu-icon" />
            <Text className="menu-label">设置</Text>
            <ChevronRight size={18} className="menu-arrow" />
          </View>
        </View>

        <View className="logout-btn" onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </ScrollView>
    </View>
  )
}
