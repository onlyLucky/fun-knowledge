# FunFact 多端适配检查清单

## 一、项目初始化

### 1.1 环境准备
- [ ] 安装 Node.js >= 18
- [ ] 安装 Taro CLI：`npm install -g @tarojs/cli`
- [ ] 安装微信开发者工具
- [ ] 安装抖音开发者工具
- [ ] 安装 Android Studio（Android 开发）
- [ ] 安装 Xcode（iOS 开发）
- [ ] 安装 DevEco Studio（鸿蒙开发）

### 1.2 Taro 项目创建
- [ ] 创建 Taro 4.x 项目：`taro init app-taro`
- [ ] 选择 React + TypeScript + Less 模板
- [ ] 配置多端编译支持
- [ ] 验证五端编译通过

### 1.3 依赖安装
- [ ] 安装 Zustand：`npm install zustand`
- [ ] 安装 Taro UI：`npm install @tarojs/ui`
- [ ] 安装 lucide-react-taro：`npm install lucide-react-taro`
- [ ] 安装 Lottie：`npm install lottie-taro`
- [ ] 安装 date-fns：`npm install date-fns`
- [ ] 安装 react-hook-form：`npm install react-hook-form`

---

## 二、基础设施迁移

### 2.1 样式系统
- [ ] 创建 Less 变量文件（variables.less）
- [ ] 创建 Less 混入文件（mixins.less）
- [ ] 创建 CSS 动画文件（animations.less）
- [ ] 迁移设计令牌（颜色、间距、圆角、字体）
- [ ] 迁移安全区域样式
- [ ] 迁移滚动条隐藏样式

### 2.2 工具函数
- [ ] 创建平台检测工具（platform.ts）
- [ ] 创建统一存储封装（storage.ts）
- [ ] 创建统一路由封装（router.ts）
- [ ] 创建 HTTP 请求封装（http.ts）
- [ ] 创建 Token 刷新逻辑
- [ ] 创建全局 Loading 封装

### 2.3 状态管理
- [ ] 创建 auth store（Zustand）
- [ ] 创建 user store（Zustand）
- [ ] 创建 favorites store（Zustand）
- [ ] 创建 settings store（Zustand）
- [ ] 配置 Zustand 持久化存储

---

## 三、API 服务层迁移

### 3.1 认证服务
- [ ] 迁移 auth.service.ts
- [ ] 适配 Taro.request
- [ ] 适配 Taro.uploadFile（头像上传）

### 3.2 知识服务
- [ ] 迁移 knowledge.service.ts
- [ ] 迁移推荐算法接口
- [ ] 迁移行为上报接口

### 3.3 分类服务
- [ ] 迁移 category.service.ts

### 3.4 收藏服务
- [ ] 迁移 favorite.service.ts

### 3.5 浏览历史服务
- [ ] 迁移 browse.service.ts

### 3.6 签到服务
- [ ] 迁移 checkin.service.ts

### 3.7 纠错服务
- [ ] 迁移 correction.service.ts

### 3.8 AI 服务
- [ ] 迁移 ai.service.ts

### 3.9 发现服务
- [ ] 迁移 discover.service.ts

---

## 四、公共组件迁移

### 4.1 核心组件
- [ ] 迁移 KnowledgeCard 组件
  - [ ] HTML 标签 → Taro 组件
  - [ ] Motion 动画 → CSS 动画
  - [ ] 拖拽手势 → Touch 事件
  - [ ] 图片懒加载
- [ ] 迁移 AIBottomSheet 组件
  - [ ] createPortal → Taro 弹窗
  - [ ] AnimatePresence → 条件渲染
- [ ] 迁移 PageHeader 组件
- [ ] 迁移 GlobalLoading 组件
- [ ] 迁移 ErrorReportSheet 组件
- [ ] 迁移 SwipeToDeleteItem 组件
- [ ] 迁移 AppLogo 组件
- [ ] 迁移 ModalRoute 组件
- [ ] 迁移 SubPageWrapper 组件

### 4.2 UI 基础组件
- [ ] 迁移 Button 组件
- [ ] 迁移 Input 组件
- [ ] 迁移 Textarea 组件
- [ ] 迁移 Image 组件（带 fallback）
- [ ] 迁移 Badge 组件
- [ ] 迁移 Card 组件
- [ ] 迁移 Skeleton 组件
- [ ] 迁移 Toast 组件

---

## 五、页面迁移

### 5.1 认证模块
- [ ] 迁移 SplashScreen 启动屏
- [ ] 迁移 WelcomePage 欢迎页
- [ ] 迁移 LoginPage 登录页
- [ ] 迁移 RegisterPage 注册页
- [ ] 迁移 Field 表单组件

### 5.2 首页模块
- [ ] 迁移 Home 首页
  - [ ] 卡片堆叠逻辑
  - [ ] 分类筛选
  - [ ] 下拉刷新
  - [ ] 自动播放
  - [ ] 签到提示
- [ ] 迁移 CardDetailPage 卡片详情
- [ ] 迁移 CategoryDetail 分类详情

### 5.3 发现模块
- [ ] 迁移 Discover 发现页
- [ ] 迁移 HotSearchPage 热搜页

### 5.4 个人中心模块
- [ ] 迁移 Profile 个人中心
- [ ] 迁移 ProfileEditPage 编辑页
- [ ] 迁移 AvatarEditPage 头像编辑
- [ ] 迁移 AvatarCropPage 头像裁剪
- [ ] 迁移 NicknameEditPage 昵称编辑
- [ ] 迁移 SignatureEditPage 签名编辑
- [ ] 迁移 Favorites 收藏列表
- [ ] 迁移 BrowseHistory 浏览历史
- [ ] 迁移 CalendarPage 日历页

### 5.5 设置模块
- [ ] 迁移 SettingsPage 设置页
- [ ] 迁移 AccountEditPage 账号编辑
- [ ] 迁移 AboutPage 关于页
- [ ] 迁移 ContactUsPage 联系我们
- [ ] 迁移 PrivacyPolicyPage 隐私政策
- [ ] 迁移 UserAgreementPage 用户协议

### 5.6 举报模块
- [ ] 迁移 ErrorReportPage 举报列表
- [ ] 迁移 ErrorReportDetailPage 举报详情
- [ ] 迁移 ReportContentPage 举报内容

---

## 六、平台适配

### 6.1 微信小程序
- [ ] 配置 appid
- [ ] 配置权限（用户信息、相册等）
- [ ] 配置分包
- [ ] 真机测试
- [ ] 性能优化

### 6.2 抖音小程序
- [ ] 配置 appid
- [ ] 配置权限
- [ ] 真机测试
- [ ] 性能优化

### 6.3 H5
- [ ] 配置路由模式
- [ ] 配置 SEO
- [ ] 配置 PWA
- [ ] 浏览器兼容测试
- [ ] 响应式测试

### 6.4 Android
- [ ] 配置签名
- [ ] 配置权限
- [ ] 真机测试
- [ ] 性能优化

### 6.5 iOS
- [ ] 配置 Bundle ID
- [ ] 配置签名
- [ ] 配置权限
- [ ] 真机测试
- [ ] 性能优化

### 6.6 鸿蒙
- [ ] 配置应用信息
- [ ] 配置权限
- [ ] 真机测试
- [ ] 性能优化

---

## 七、测试验证

### 7.1 功能测试
- [ ] 登录/注册流程
- [ ] 首页卡片浏览
- [ ] 分类筛选
- [ ] 收藏功能
- [ ] AI 解读功能
- [ ] 个人中心功能
- [ ] 设置功能
- [ ] 举报功能

### 7.2 性能测试
- [ ] 页面加载时间 < 3s
- [ ] 动画帧率 ≥ 60fps
- [ ] 内存占用合理
- [ ] 包体积 < 2MB（主包）

### 7.3 兼容性测试
- [ ] 微信小程序：iOS 真机
- [ ] 微信小程序：Android 真机
- [ ] 抖音小程序：iOS 真机
- [ ] 抖音小程序：Android 真机
- [ ] H5：Chrome
- [ ] H5：Safari
- [ ] Android：真机
- [ ] iOS：真机
- [ ] 鸿蒙：真机

---

## 八、上线准备

### 8.1 微信小程序上线
- [ ] 提交审核
- [ ] 审核通过
- [ ] 发布上线

### 8.2 抖音小程序上线
- [ ] 提交审核
- [ ] 审核通过
- [ ] 发布上线

### 8.3 App 上线
- [ ] Android 打包
- [ ] iOS 打包
- [ ] 应用商店提交

### 8.4 鸿蒙上线
- [ ] 打包
- [ ] 应用市场提交

---

## 九、文档完善

- [ ] 更新 README.md
- [ ] 编写多端开发指南
- [ ] 编写平台差异说明
- [ ] 编写测试报告
- [ ] 编写性能报告
