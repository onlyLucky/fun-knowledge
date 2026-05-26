import { View, Text, Image } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores'
import './index.less'

export default function WelcomePage() {
  const { isLoggedIn } = useAuthStore()
  const [animating, setAnimating] = useState(true)

  useEffect(() => {
    if (isLoggedIn) {
      Taro.switchTab({ url: '/pages/home/index' })
      return
    }

    const timer = setTimeout(() => {
      setAnimating(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [isLoggedIn])

  function handleLogin() {
    Taro.navigateTo({ url: '/pages/auth/login/index' })
  }

  function handleRegister() {
    Taro.navigateTo({ url: '/pages/auth/register/index' })
  }

  return (
    <View className="welcome-page">
      <View className={`welcome-content ${animating ? 'animating' : ''}`}>
        <View className="logo-wrapper">
          <Image 
            src="/assets/images/logo.png" 
            className="logo"
            mode="aspectFit"
          />
        </View>

        <View className="title-wrapper">
          <Text className="title">冷知识星球</Text>
          <Text className="subtitle">每天一个冷知识，涨姿势不重样</Text>
        </View>

        <View className="features">
          <View className="feature-item">
            <Text className="feature-icon">📚</Text>
            <Text className="feature-text">海量知识</Text>
          </View>
          <View className="feature-item">
            <Text className="feature-icon">🤖</Text>
            <Text className="feature-text">AI 解读</Text>
          </View>
          <View className="feature-item">
            <Text className="feature-icon">⭐</Text>
            <Text className="feature-text">收藏分享</Text>
          </View>
        </View>

        <View className="action-buttons">
          <View className="login-btn" onClick={handleLogin}>
            <Text>登录</Text>
          </View>
          <View className="register-btn" onClick={handleRegister}>
            <Text>注册账号</Text>
          </View>
        </View>

        <Text className="agreement-hint">
          登录即表示同意《用户协议》和《隐私政策》
        </Text>
      </View>
    </View>
  )
}
