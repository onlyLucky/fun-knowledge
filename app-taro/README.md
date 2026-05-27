# 冷知识星球 - Taro 多端应用

基于 Taro 4.0.7 + React 18 + TypeScript 构建的跨平台应用，支持微信小程序、H5、支付宝小程序、字节小程序等多端运行。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Taro | 4.0.7 | 跨平台框架 |
| React | 18.3.1 | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Webpack5 | 5.91.0 | 构建工具 |
| LESS | 4.x | 样式预处理器 |

## 快速开始

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发

```bash
# H5 开发（浏览器）
npm run dev:h5

# 微信小程序开发
npm run dev:weapp

# 支付宝小程序开发
npm run dev:alipay

# 字节小程序开发
npm run dev:tt
```

### 构建

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:weapp

# 其他平台...
npm run build:<platform>
```

## 项目结构

```
app-taro/
├── config/                 # 构建配置
│   ├── index.ts           # 主配置
│   ├── dev.ts             # 开发环境配置
│   └── prod.ts            # 生产环境配置
├── src/
│   ├── api/               # API 接口
│   ├── components/        # 公共组件
│   ├── pages/             # 页面
│   │   ├── home/          # 首页
│   │   ├── discover/      # 发现页
│   │   ├── profile/       # 个人中心
│   │   ├── auth/          # 认证相关
│   │   └── settings/      # 设置页
│   ├── stores/            # 状态管理
│   ├── styles/            # 全局样式
│   ├── utils/             # 工具函数
│   ├── app.tsx            # 应用入口
│   ├── app.config.ts      # 应用配置
│   └── index.html         # H5 HTML 模板
├── package.json
└── tsconfig.json
```

## 多端适配

### 支持平台

| 平台 | 命令 | 状态 |
|------|------|------|
| H5 | `dev:h5` | ✅ 已适配 |
| 微信小程序 | `dev:weapp` | ✅ 已适配 |
| 支付宝小程序 | `dev:alipay` | ✅ 已适配 |
| 字节小程序 | `dev:tt` | ✅ 已适配 |
| QQ 小程序 | `dev:qq` | ✅ 已适配 |
| 京东小程序 | `dev:jd` | ✅ 已适配 |
| React Native | `dev:rn` | ⚠️ 待适配 |
| HarmonyOS | `dev:harmony` | ⚠️ 待适配 |

### 样式适配

- 使用 `px` 单位，Taro 编译时自动转换
- 设计稿宽度：750px
- H5 端使用 `postcss-pxtransform` 自动转换
- 小程序端使用 `pxTransform` API

### 平台差异处理

```typescript
// 判断平台
import { PLATFORM } from '@tarojs/taro'

if (process.env.TARO_PLATFORM === 'web') {
  // H5 平台特定逻辑
} else {
  // 小程序平台特定逻辑
}
```

## 已知问题与解决方案

### 1. H5 端页面空白问题（已解决）

**问题描述**：
H5 模式下，页面内容为空白，只显示底部 TabBar 和顶部导航栏。

**根本原因**：
Taro 4.0.7 的路由模块 `@tarojs/router` 在构建路由时，使用 `addLeadingSlash` 给路径添加前导斜杠（如 `/pages/home/index`）。但 UniversalRouter 在匹配时会剥离 `baseUrl`（配置为 `/`），导致实际匹配路径变成 `pages/home/index`（无前导斜杠），与路由模式不匹配，返回 404 错误。

**解决方案**：
修改 `node_modules/@tarojs/router/dist/index.esm.js` 文件，移除路由路径的前导斜杠：

```javascript
// 修改前（约第 1509 行）
const routePath = addLeadingSlash(route.path);

// 修改后
const routePath = route.path;
```

**持久化修复**：
已使用 `pnpm patch` 创建补丁文件 `patches/@tarojs__router@4.0.7.patch`，并在 `package.json` 中配置了 `pnpm.patchedDependencies`。

重新安装依赖时会自动应用补丁：
```bash
pnpm install
```

如需重新创建补丁：
```bash
pnpm patch @tarojs/router@4.0.7
# 编辑 node_modules/.pnpm_patches/@tarojs/router@4.0.7/dist/index.esm.js
pnpm patch-commit '/path/to/node_modules/.pnpm_patches/@tarojs/router@4.0.7'
```

### 2. 版本兼容性

**重要**：所有 `@tarojs/*` 依赖必须锁定为 `4.0.7` 版本，不能使用 `^` 或 `~` 前缀。

```json
{
  "dependencies": {
    "@tarojs/cli": "4.0.7",
    "@tarojs/components": "4.0.7",
    "@tarojs/helper": "4.0.7",
    "@tarojs/plugin-framework-react": "4.0.7",
    "@tarojs/plugin-platform-alipay": "4.0.7",
    "@tarojs/plugin-platform-h5": "4.0.7",
    "@tarojs/plugin-platform-tt": "4.0.7",
    "@tarojs/plugin-platform-weapp": "4.0.7",
    "@tarojs/react": "4.0.7",
    "@tarojs/runtime": "4.0.7",
    "@tarojs/shared": "4.0.7",
    "@tarojs/taro": "4.0.7"
  }
}
```

## 配置说明

### 路由配置（app.config.ts）

```typescript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/discover/index',
    'pages/profile/index',
    // ...
  ],
  tabBar: {
    color: '#8C8A8B',
    selectedColor: '#FDFDFD',
    backgroundColor: '#1C1A1B',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/discover/index', text: '发现' },
      { pagePath: 'pages/profile/index', text: '我的' }
    ]
  },
  window: {
    navigationBarBackgroundColor: '#1C1A1B',
    navigationBarTitleText: '冷知识星球',
    navigationBarTextStyle: 'white'
  }
})
```

### H5 配置（config/index.ts）

```typescript
h5: {
  publicPath: '/',           // 必须为 '/'
  router: {
    mode: 'hash',            // 路由模式
    basename: '/'            // 基础路径
  },
  devServer: {
    port: 10086,             // 开发服务器端口
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
}
```

## 开发规范

### 代码规范

- 使用 TypeScript 编写
- 组件使用函数式组件 + Hooks
- 样式使用 LESS 预处理器
- 遵循 Taro 命名规范

### 提交规范

```
feat(scope): 新功能
fix(scope): 修复 Bug
docs(scope): 文档更新
style(scope): 代码格式调整
refactor(scope): 重构
perf(scope): 性能优化
test(scope): 测试相关
chore(scope): 构建/工具相关
```

## 调试技巧

### H5 调试

1. 启动开发服务器：`npm run dev:h5`
2. 访问 `http://localhost:10086`
3. 打开浏览器开发者工具查看控制台

### 小程序调试

1. 启动对应平台开发服务器：`npm run dev:weapp`
2. 打开对应小程序开发者工具
3. 导入项目目录下的 `dist` 文件夹

### 常用调试命令

```bash
# 清除缓存重新编译
rm -rf node_modules/.cache && npm run dev:h5

# 查看编译日志
npm run dev:h5 2>&1 | tee build.log
```

## 相关文档

- [Taro 官方文档](https://taro.zone/)
- [React 文档](https://react.dev/)
- [Taro 配置说明](https://taro.zone/docs/config)

## License

MIT
