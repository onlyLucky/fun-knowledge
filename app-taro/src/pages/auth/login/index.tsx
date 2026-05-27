import { View, Text, Input } from '@tarojs/components'
import { ChevronLeft } from 'lucide-taro-react'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/stores'
import { authService } from '@/api'
import { isValidPhone } from '@/utils'
import './index.less'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuthStore()

  async function sendCode() {
    if (!isValidPhone(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    if (countdown > 0) return
    
    try {
      await authService.sendSmsCode(phone)
      Taro.showToast({ title: '验证码已发送', icon: 'success' })
      
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Send code error:', error)
    }
  }

  async function handleLogin() {
    if (!isValidPhone(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    
    if (!code.trim()) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }
    
    setLoading(true)
    
    try {
      const result = await authService.loginByPhone(phone, code)
      
      login(result.user, result.tokens.accessToken, result.tokens.refreshToken)
      Taro.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login-page">
      <View className="page-header">
        <View className="back-btn" onClick={() => Taro.navigateBack()}>
          <ChevronLeft size={24} />
        </View>
        <Text className="header-title">登录</Text>
        <View className="header-placeholder" />
      </View>

      <View className="form-content">
        <View className="input-group">
          <Text className="input-label">手机号</Text>
          <Input
            className="input-field"
            type="number"
            maxlength={11}
            placeholder="请输入手机号"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
          />
        </View>

        <View className="input-group">
          <Text className="input-label">验证码</Text>
          <View className="code-input-wrapper">
            <Input
              className="input-field code-input"
              type="number"
              maxlength={6}
              placeholder="请输入验证码"
              value={code}
              onInput={(e) => setCode(e.detail.value)}
            />
            <View 
              className={`send-code-btn ${countdown > 0 ? 'disabled' : ''}`}
              onClick={sendCode}
            >
              <Text>{countdown > 0 ? `${countdown}s` : '发送验证码'}</Text>
            </View>
          </View>
        </View>

        <View 
          className={`submit-btn ${loading ? 'loading' : ''}`}
          onClick={handleLogin}
        >
          <Text>{loading ? '登录中...' : '登录'}</Text>
        </View>

        <View className="footer-links">
          <Text className="link-text">还没有账号？</Text>
          <Text 
            className="link-action"
            onClick={() => Taro.navigateTo({ url: '/pages/auth/register/index' })}
          >
            立即注册
          </Text>
        </View>
      </View>
    </View>
  )
}
