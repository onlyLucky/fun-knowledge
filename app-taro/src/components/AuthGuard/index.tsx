import { View, Text } from '@tarojs/components'
import { useAuthStore } from '@/stores/auth'
import { router } from '@/utils/platform'
import { useEffect, useState } from 'react'
import './index.less'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn, isInitialized, checkAuth, setInitialized } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function init() {
      if (!isInitialized) {
        const valid = await checkAuth()
        setInitialized(true)
        if (!valid) {
          router.replace('/pages/auth/welcome/index')
        }
      }
      setChecking(false)
    }
    init()
  }, [isInitialized, checkAuth, setInitialized])

  if (checking) {
    return (
      <View className="auth-guard-loading">
        <View className="loading-spinner" />
        <Text className="loading-text">加载中...</Text>
      </View>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
