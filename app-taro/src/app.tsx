import { Component, PropsWithChildren } from 'react'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import './styles/app.less'

class App extends Component<PropsWithChildren> {
  componentDidMount() {
    // 初始化应用
    this.initApp()
  }

  async initApp() {
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
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
