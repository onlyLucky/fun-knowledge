import Taro from '@tarojs/taro'

// ============================================
// 平台检测 - Platform Detection
// ============================================

export const PLATFORM = {
  get isWeapp() {
    return process.env.TARO_ENV === 'weapp'
  },
  get isTT() {
    return process.env.TARO_ENV === 'tt'
  },
  get isH5() {
    return process.env.TARO_ENV === 'h5'
  },
  get isRN() {
    return process.env.TARO_ENV === 'rn'
  },
  get isHarmony() {
    return process.env.TARO_ENV === 'harmony' || process.env.TARO_ENV === 'harmony_cpp'
  },
  get isMini() {
    return this.isWeapp || this.isTT
  }
}

export function getPlatformName(): string {
  if (PLATFORM.isWeapp) return '微信小程序'
  if (PLATFORM.isTT) return '抖音小程序'
  if (PLATFORM.isH5) return 'H5'
  if (PLATFORM.isRN) return 'React Native'
  if (PLATFORM.isHarmony) return '鸿蒙'
  return '未知'
}

// ============================================
// 统一存储 - Storage
// ============================================

export const storage = {
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const res = await Taro.getStorage({ key })
      return res.data as T
    } catch {
      return null
    }
  },

  async set(key: string, value: any): Promise<void> {
    try {
      await Taro.setStorage({ key, data: value })
    } catch (error) {
      console.error(`Storage set error: ${key}`, error)
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await Taro.removeStorage({ key })
    } catch (error) {
      console.error(`Storage remove error: ${key}`, error)
    }
  },

  async clear(): Promise<void> {
    try {
      await Taro.clearStorage()
    } catch (error) {
      console.error('Storage clear error', error)
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const res = await Taro.getStorageInfo()
      return res.keys
    } catch {
      return []
    }
  }
}

// ============================================
// 统一路由 - Router
// ============================================

export const router = {
  push(url: string, params?: Record<string, any>) {
    const fullUrl = params ? `${url}?${formatParams(params)}` : url
    return Taro.navigateTo({ url: fullUrl })
  },

  replace(url: string, params?: Record<string, any>) {
    const fullUrl = params ? `${url}?${formatParams(params)}` : url
    return Taro.redirectTo({ url: fullUrl })
  },

  back(delta = 1) {
    return Taro.navigateBack({ delta })
  },

  switchTab(url: string) {
    return Taro.switchTab({ url })
  },

  reLaunch(url: string, params?: Record<string, any>) {
    const fullUrl = params ? `${url}?${formatParams(params)}` : url
    return Taro.reLaunch({ url: fullUrl })
  },

  getCurrentPages() {
    return Taro.getCurrentPages()
  },

  getParams() {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return (currentPage as any).options || {}
  }
}

function formatParams(params: Record<string, any>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&')
}

// ============================================
// 统一登录 - Login
// ============================================

export async function login(): Promise<string> {
  if (PLATFORM.isWeapp) {
    const { code } = await Taro.login()
    return code
  }
  if (PLATFORM.isTT) {
    const { code } = await Taro.login({ force: true })
    return code
  }
  return ''
}

// ============================================
// 用户信息
// ============================================

export async function getUserInfo(): Promise<Taro.getUserInfo.SuccessCallbackResult | null> {
  if (PLATFORM.isWeapp || PLATFORM.isTT) {
    try {
      return await Taro.getUserInfo()
    } catch {
      return null
    }
  }
  return null
}

// ============================================
// 分享
// ============================================

export function setupShareMenu() {
  if (PLATFORM.isWeapp) {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }
}

// ============================================
// 系统信息
// ============================================

export function getSystemInfo() {
  const info = Taro.getSystemInfoSync()
  return {
    platform: info.platform,
    model: info.model,
    brand: info.brand,
    system: info.system,
    version: info.version,
    SDKVersion: info.SDKVersion,
    screenWidth: info.screenWidth,
    screenHeight: info.screenHeight,
    windowWidth: info.windowWidth,
    windowHeight: info.windowHeight,
    statusBarHeight: info.statusBarHeight || 0,
    safeArea: info.safeArea,
    pixelRatio: info.pixelRatio
  }
}

// ============================================
// 剪贴板
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await Taro.setClipboardData({ data: text })
    return true
  } catch {
    return false
  }
}

export async function getClipboardData(): Promise<string | null> {
  try {
    const res = await Taro.getClipboardData()
    return res.data
  } catch {
    return null
  }
}

// ============================================
// 震动反馈
// ============================================

export function vibrateShort() {
  Taro.vibrateShort({ type: 'light' }).catch(() => {})
}

export function vibrateLong() {
  Taro.vibrateLong().catch(() => {})
}

// ============================================
// 图片预览
// ============================================

export function previewImage(urls: string[], current?: string) {
  return Taro.previewImage({
    urls,
    current: current || urls[0]
  })
}

// ============================================
// 保存图片到相册
// ============================================

export async function saveImageToPhotosAlbum(filePath: string): Promise<boolean> {
  try {
    await Taro.saveImageToPhotosAlbum({ filePath })
    return true
  } catch {
    return false
  }
}
