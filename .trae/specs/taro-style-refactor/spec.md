# Taro 应用样式与组件改造 Spec

## Why
app-taro 项目原本从 app 项目迁移而来，但样式、组件和页面未能完整还原原始应用的设计风格。需要参考原始应用的设计系统，对 Taro 应用进行全面的样式和组件改造，以实现视觉和交互的一致性。

## What Changes
- 统一设计令牌（颜色、间距、圆角、字体、阴影）
- 改造核心组件（PageHeader、KnowledgeCard）
- 改造主要页面样式（Home、Profile、Discover）
- 添加动画效果支持
- 优化交互体验

## Impact
- Affected specs: UI 设计系统、组件库、页面样式
- Affected code: 
  - `app-taro/src/styles/` - 样式变量和全局样式
  - `app-taro/src/components/` - 核心组件
  - `app-taro/src/pages/` - 页面样式

## ADDED Requirements

### Requirement: 设计令牌统一
系统应使用与原始应用一致的设计令牌，确保视觉风格统一。

#### Scenario: 颜色系统
- **WHEN** 查看应用界面
- **THEN** 颜色应与原始应用一致：
  - 主色: `#292526` (深色模式) / `#FDFDFD` (浅色模式)
  - 页面背景: `#1C1A1B` (深色) / `#F2F2F2` (浅色)
  - 卡片背景: `#292526` (深色) / `#FDFDFD` (浅色)
  - 主文字: `#FDFDFD` (深色) / `#121111` (浅色)
  - 次文字: `#DFDEDE` (深色) / `#787676` (浅色)
  - 边框: `#3a3637` (深色) / `#DFDEDE` (浅色)

#### Scenario: 间距系统
- **WHEN** 查看应用布局
- **THEN** 间距应使用 4px 基准单位：4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

#### Scenario: 圆角系统
- **WHEN** 查看圆角元素
- **THEN** 圆角应使用：8px (sm), 12px (md), 16px (lg), 20px (xl), 24px (2xl), 100px (full)

#### Scenario: 字体系统
- **WHEN** 查看文字内容
- **THEN** 字体大小应使用：20px (xs), 24px (sm), 28px (base), 32px (lg), 36px (xl), 40px (2xl), 48px (3xl)

### Requirement: PageHeader 组件改造
PageHeader 组件应与原始应用保持一致的样式和交互。

#### Scenario: 基础布局
- **WHEN** 渲染 PageHeader 组件
- **THEN** 应显示：
  - 返回按钮（38x38px，圆角12px，带阴影）
  - 标题（17px 粗体）
  - 副标题（11px 灰色）
  - 右侧操作区

#### Scenario: 返回按钮交互
- **WHEN** 点击返回按钮
- **THEN** 应有缩放动画（scale: 0.88）

### Requirement: Home 页面改造
Home 页面应还原原始应用的卡片堆叠交互和样式。

#### Scenario: 分类筛选栏
- **WHEN** 查看 Home 页面
- **THEN** 应显示横向滚动的分类标签：
  - 激活状态：主色背景，白色文字，带阴影
  - 未激活状态：卡片背景，边框，灰色文字

#### Scenario: 知识卡片
- **WHEN** 查看知识卡片
- **THEN** 应显示：
  - 图片区域（占 45% 高度）
  - 分类标签（左上角，圆角徽章）
  - 标题（20px 粗体，单行截断）
  - 描述（14px，最多6行）
  - 来源信息（底部边框分隔）
  - 操作栏（收藏、AI解读、纠错）

#### Scenario: 卡片滑动交互
- **WHEN** 上滑卡片
- **THEN** 应切换到下一张卡片，带动画效果

#### Scenario: 下拉刷新
- **WHEN** 在第一张卡片下拉
- **THEN** 应显示刷新指示器，松开后刷新数据

### Requirement: Profile 页面改造
Profile 页面应还原原始应用的用户信息卡片和菜单样式。

#### Scenario: 用户信息卡片
- **WHEN** 查看 Profile 页面
- **THEN** 应显示：
  - 深色渐变背景卡片
  - 头像（54x54px，圆角100px，带编辑按钮）
  - 昵称和签名
  - 统计数据（连续打卡、累计打卡、收藏数）

#### Scenario: 本周打卡卡片
- **WHEN** 查看打卡区域
- **THEN** 应显示周一到周日的打卡状态，已打卡显示勾号

#### Scenario: 菜单列表
- **WHEN** 查看菜单区域
- **THEN** 应显示分组菜单项，每项带图标、标题、箭头

### Requirement: Discover 页面改造
Discover 页面应还原原始应用的搜索和热搜样式。

#### Scenario: 搜索栏
- **WHEN** 查看 Discover 页面
- **THEN** 应显示：
  - 搜索输入框（圆角14px，带边框和阴影）
  - 搜索按钮（主色背景，圆角100px）

#### Scenario: 热搜榜单
- **WHEN** 查看热搜区域
- **THEN** 应显示：
  - 标题带火焰图标
  - 两列布局的热搜项
  - 前3名显示红色排名和火焰图标
  - 趋势箭头（上升/下降/持平）

## MODIFIED Requirements

### Requirement: Less 变量文件更新
更新 `variables.less` 以匹配原始应用的设计令牌。

**变更内容**：
- 颜色值调整为与原始应用一致
- 间距值调整为 4px 基准
- 圆角值调整为与原始应用一致
- 字体大小调整为与原始应用一致

## REMOVED Requirements

### Requirement: 旧版深色主题配色
**Reason**: 统一使用与原始应用一致的设计令牌
**Migration**: 将所有颜色引用更新为新的设计令牌
