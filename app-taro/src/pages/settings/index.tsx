import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useDarkMode } from '../../utils/theme'
import PageHeader from '../../components/PageHeader'
import './index.less'

export default function SettingsPage() {
  const { isDark, toggleDark } = useDarkMode()

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')
          Taro.reLaunch({ url: '/pages/auth/welcome/index' })
        }
      }
    })
  }

  return (
    <View className="settings-page">
      <PageHeader title="设置" />

      <View className="settings-section">
        <Text className="section-title">通用设置</Text>

        <View className="settings-item">
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Text className="item-icon">🌙</Text>
            </View>
            <View className="item-content">
              <Text className="item-label">深色模式</Text>
              <Text className="item-desc">切换深色/浅色主题</Text>
            </View>
          </View>
          <View className="item-right">
            <View
              className={`toggle-switch ${isDark ? 'active' : ''}`}
              onClick={toggleDark}
            />
          </View>
        </View>

        <View className="settings-item" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Text className="item-icon">ℹ️</Text>
            </View>
            <View className="item-content">
              <Text className="item-label">关于我们</Text>
            </View>
          </View>
          <View className="item-right">
            <Text className="item-arrow">›</Text>
          </View>
        </View>
      </View>

      <View className="settings-section">
        <Text className="section-title">账号与安全</Text>

        <View className="settings-item" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Text className="item-icon">👤</Text>
            </View>
            <View className="item-content">
              <Text className="item-label">账号管理</Text>
            </View>
          </View>
          <View className="item-right">
            <Text className="item-arrow">›</Text>
          </View>
        </View>

        <View className="settings-item" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
          <View className="item-left">
            <View className="item-icon-wrapper">
              <Text className="item-icon">🔒</Text>
            </View>
            <View className="item-content">
              <Text className="item-label">隐私设置</Text>
            </View>
          </View>
          <View className="item-right">
            <Text className="item-arrow">›</Text>
          </View>
        </View>
      </View>

      <View className="logout-btn" onClick={handleLogout}>
        退出登录
      </View>

      <View className="version-info">
        <Text className="version-label">冷知识星球</Text>
        <Text className="version-number">v1.0.0</Text>
      </View>
    </View>
  )
}
