import { Component, PropsWithChildren } from 'react'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { getDarkMode } from './utils/theme'
import './styles/app.less'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // 初始化应用
    this.initApp()
  }

  async initApp() {
    try {
      // 初始化暗色模式
      const isDark = getDarkMode()
      document.documentElement.classList.toggle('dark', isDark)

      // 初始化设置
      const settings = useSettingsStore.getState()
      await settings.init()

      // 检查登录状态
      const auth = useAuthStore.getState()
      if (auth.token) {
        // 验证 token 有效性
        try {
          await auth.checkAuth()
        } catch {
          // Token 无效，清除登录状态
          auth.logout()
        }
      }
    } catch (error) {
      console.error('App init error:', error)
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
