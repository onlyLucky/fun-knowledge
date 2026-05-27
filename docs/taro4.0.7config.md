Taro 4.0.7 完整配置项清单及注意事项

---

## 一、根配置项（config/index.ts）

| 配置项 | 类型 | 默认值 | 说明 | 注意事项 |
|--------|------|--------|------|----------|
| `projectName` | `string` | - | 项目名称 | **必须**，无默认值，用于编译缓存标识 |
| `date` | `string` | - | 项目创建日期 | **必须**，格式 `YYYY-MM-DD` |
| `designWidth` | `number` | `750` | 设计稿宽度 | **必须**，决定 px 转换基准，常见 750/640/375 |
| `deviceRatio` | `object` | `{640:2.34/2, 750:1, 828:1.81/2}` | 设备像素比映射 | **必须**，key 为 designWidth，value 为转换比例 |
| `sourceRoot` | `string` | `'src'` | 源码目录 | - |
| `outputRoot` | `string` | `'dist'` | 输出目录 | - |
| `alias` | `object` | `{}` | 路径别名 | 推荐配置 `@` 指向 `src`，避免相对路径地狱 |
| `defineConstants` | `object` | `{}` | 全局常量替换 | 值必须用 `JSON.stringify` 包裹 |
| `copy` | `object` | - | 静态资源复制 | `patterns` 数组，`from` 源路径，`to` 目标路径 |
| `compiler` | `string` | `'webpack5'` | 编译工具 | 可选 `webpack5` / `vite`，Taro 4.x 默认 webpack5 |
| `cache` | `object/boolean` | `{enable: true}` | 编译缓存 | 生产环境建议开启 |
| `logger` | `object` | `{quiet: false, stats: true}` | 日志配置 | `quiet: true` 静默模式，`stats` 显示编译统计 |
| `sourceMap` | `object/boolean` | `{enable: true}` | SourceMap | 生产环境建议 `enable: false` |
| `plugins` | `array` | `[]` | 插件列表 | **必须配置平台插件**，支持字符串或 `[plugin, options]` |

---

## 二、defineConstants 注意事项

```typescript
// ✅ 正确：字符串必须 JSON.stringify
defineConstants: {
  API_URL: JSON.stringify('https://api.example.com'),
  IS_DEV: JSON.stringify(process.env.NODE_ENV === 'development'),
  VERSION: JSON.stringify('1.0.0')
}

// ❌ 错误：直接写字符串会被当作代码片段
API_URL: 'https://api.example.com'  // 编译后变成变量名，不是字符串
```

---

## 三、copy 配置

| 属性 | 类型 | 说明 |
|------|------|------|
| `patterns` | `array` | 复制规则数组 |
| `patterns[].from` | `string` | 源路径（相对项目根目录）|
| `patterns[].to` | `string` | 目标路径（相对 outputRoot）|
| `patterns[].ignore` | `array` | 忽略文件模式 |
| `options.ignore` | `array` | 全局忽略 |

```typescript
copy: {
  patterns: [
    { from: 'src/assets/images', to: 'dist/images' },
    { from: 'src/assets/fonts', to: 'dist/fonts', ignore: ['*.md'] }
  ],
  options: {
    ignore: ['*.txt', 'README.md']
  }
}
```

---

## 四、多端平台配置

### 4.1 mini（微信小程序/抖音小程序/支付宝等）

| 配置项 | 类型 | 默认值 | 说明 | 注意事项 |
|--------|------|--------|------|----------|
| `mini.postcss.pxtransform` | `object` | `{enable: true}` | px 转换配置 | **核心配置**，决定样式适配 |
| `mini.postcss.pxtransform.config.onePxTransform` | `boolean` | `true` | 1px 是否转换 | 建议 `false`，保持边框 1px 不转 rpx |
| `mini.postcss.pxtransform.config.unitPrecision` | `number` | `5` | 转换精度 | 小数位精度 |
| `mini.postcss.pxtransform.config.propList` | `array` | `['*']` | 转换属性白名单 | `['*']` 全部转换，`['width', 'height']` 只转指定 |
| `mini.postcss.pxtransform.config.selectorBlackList` | `array` | `[]` | 选择器黑名单 | 第三方 UI 库前缀，如 `['nut-', 'van-']` |
| `mini.postcss.pxtransform.config.replace` | `boolean` | `true` | 直接替换 | `true` 替换，`false` 追加 rpx 规则 |
| `mini.postcss.pxtransform.config.mediaQuery` | `boolean` | `false` | 媒体查询转换 | 建议 `false` |
| `mini.postcss.pxtransform.config.minPixelValue` | `number` | `0` | 最小转换值 | 小于该值不转换，建议 `2` |
| `mini.postcss.cssModules` | `object` | `{enable: false}` | CSS Modules | 开启后按 `*.module.css` 处理 |
| `mini.compile` | `object` | - | 编译优化 | `jsMinimizer: 'terser'` / `'esbuild'` |
| `mini.optimizeMainPackage` | `object` | `{enable: false}` | 主包优化 | 建议 `true`，自动提取分包依赖 |

**pxtransform 完整配置：**

```typescript
mini: {
  postcss: {
    pxtransform: {
      enable: true,
      config: {
        onePxTransform: false,        // 1px 边框不转换
        unitPrecision: 5,             // 5位小数精度
        propList: ['*'],              // 转换所有属性
        selectorBlackList: [          // 不转换的选择器
          'nut-',
          'van-',
          'taro-',
          /^body$/                   // 正则匹配
        ],
        replace: true,                // 直接替换原值
        mediaQuery: false,            // 不转换媒体查询
        minPixelValue: 2              // 小于 2px 不转换
      }
    },
    cssModules: {
      enable: true,
      config: {
        namingPattern: 'module',      // 文件名匹配 .module.css
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      }
    }
  },
  compile: {
    jsMinimizer: 'terser',
    cssMinimizer: 'cssnano'
  },
  optimizeMainPackage: {
    enable: true
  }
}
```

---

### 4.2 h5

| 配置项 | 类型 | 默认值 | 说明 | 注意事项 |
|--------|------|--------|------|----------|
| `h5.publicPath` | `string` | `'/'` | 资源公共路径 | **file 协议访问必须改为 `'./'`** |
| `h5.staticDirectory` | `string` | `'static'` | 静态资源目录 | - |
| `h5.router.mode` | `string` | `'hash'` | 路由模式 | `hash` 兼容 file 协议，`browser` 需服务器支持 |
| `h5.router.basename` | `string` | `'/'` | 基础路径 | 部署到子目录时配置，如 `'/mobile/'` |
| `h5.router.customRoutes` | `object` | `{}` | 自定义路由映射 | `{'/pages/index/index': '/home'}` |
| `h5.devServer` | `object` | - | 开发服务器 | Webpack devServer 配置 |
| `h5.devServer.port` | `number` | `10086` | 端口 | - |
| `h5.devServer.host` | `string` | `'0.0.0.0'` | 主机 | `'localhost'` 或 `'0.0.0.0'` |
| `h5.devServer.proxy` | `object` | - | 代理配置 | API 跨域必备 |
| `h5.postcss` | `object` | - | PostCSS 配置 | H5 端 px 转 rem |
| `h5.postcss.pxtransform.config.platform` | `string` | `'h5'` | 目标平台 | 必须 `'h5'` |
| `h5.postcss.pxtransform.config.rootValue` | `number` | `16` | rem 基准值 | `1rem = 16px`，根据设计稿调整 |
| `h5.webpackChain` | `function` | - | Webpack 链式配置 | 高级自定义 |
| `h5.esnextModules` | `array` | `[]` | ES Module 转换白名单 | 第三方库未转 ES5 时添加 |

**H5 完整配置：**

```typescript
h5: {
  publicPath: './',                    // file 协议必需
  staticDirectory: 'static',
  
  router: {
    mode: 'hash',                     // hash 兼容 file 协议
    basename: '/',
    customRoutes: {
      '/pages/index/index': '/home',
      '/pages/detail/index': '/detail/:id'
    }
  },
  
  devServer: {
    port: 10086,
    host: '0.0.0.0',
    https: false,
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        secure: false
      }
    },
    historyApiFallback: true
  },
  
  postcss: {
    pxtransform: {
      enable: true,
      config: {
        platform: 'h5',               // 必须
        designWidth: 750,
        rootValue: 16,                // 1rem = 16px
        unitPrecision: 5,
        propList: ['*'],
        selectorBlackList: ['nut-', 'van-'],
        onePxTransform: true,
        replace: true
      }
    },
    autoprefixer: { enable: true }
  },
  
  esnextModules: ['taro-ui', 'nutui-react', 'lodash-es'],
  
  webpackChain(chain) {
    // 输出配置
    chain.output
      .publicPath('./')
      .chunkFilename('js/[name].[contenthash:8].js')
      .filename('js/[name].[contenthash:8].js')
    
    // 代码分割
    chain.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all'
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all'
        }
      }
    })
    
    // HTML 插件
    chain.plugin('html').tap(args => {
      args[0].title = '我的应用'
      args[0].templateParameters = {
        BUILD_TIME: new Date().toISOString(),
        APP_VERSION: '1.0.0'
      }
      return args
    })
  }
}
```

---

### 4.3 rn（React Native）

| 配置项 | 类型 | 默认值 | 说明 | 注意事项 |
|--------|------|--------|------|----------|
| `rn.appName` | `string` | - | RN 应用名称 | **必须**，与原生工程名一致 |
| `rn.output.ios` | `string` | `'./ios'` | iOS 输出目录 | - |
| `rn.output.android` | `string` | `'./android'` | Android 输出目录 | - |
| `rn.nativeModules` | `array` | `[]` | 原生模块列表 | 自动链接的原生依赖 |
| `rn.metro` | `object` | - | Metro 配置 | `resetCache`, `maxWorkers` |
| `rn.postcss` | `object` | - | 样式转换 | 通常无需额外配置 |

```typescript
rn: {
  appName: 'MyUniversalApp',
  output: {
    ios: './ios',
    android: './android'
  },
  nativeModules: [
    '@react-native-async-storage/async-storage',
    'react-native-device-info',
    '@react-native-community/netinfo'
  ],
  metro: {
    resetCache: true,
    maxWorkers: 4
  }
}
```

---

### 4.4 harmony（鸿蒙）

| 配置项 | 类型 | 默认值 | 说明 | 注意事项 |
|--------|------|--------|------|----------|
| `harmony.projectPath` | `string` | - | 鸿蒙工程路径 | **必须**，指向 DevEco Studio 工程 |
| `harmony.hapName` | `string` | `'entry'` | HAP 模块名 | - |
| `harmony.compileMode` | `string` | `'c_api'` | 编译模式 | `c_api`（高性能）或 `arkts` |
| `harmony.postcss` | `object` | - | 样式配置 | 通常自动处理 |

```typescript
import os from 'os'
import path from 'path'

harmony: {
  projectPath: path.join(os.homedir(), 'HarmonyProjects/MyApp'),
  hapName: 'entry',
  compileMode: 'c_api'               // C-API 高性能方案
}
```

**鸿蒙注意事项：**
- `projectPath` 必须指向已创建的 DevEco Studio 空工程
- `autoDesignWidth: false`（Taro 自动设置）
- `200px` → 自适应，`100PX`（大写）→ `100vp` 固定

---

## 五、插件配置（plugins）

| 插件 | 用途 | 是否必需 |
|------|------|---------|
| `@tarojs/plugin-platform-weapp` | 微信小程序 | ✅ |
| `@tarojs/plugin-platform-tt` | 抖音小程序 | 按需 |
| `@tarojs/plugin-platform-alipay` | 支付宝小程序 | 按需 |
| `@tarojs/plugin-platform-swan` | 百度小程序 | 按需 |
| `@tarojs/plugin-platform-jd` | 京东小程序 | 按需 |
| `@tarojs/plugin-platform-qq` | QQ 小程序 | 按需 |
| `@tarojs/plugin-platform-h5` | H5 | ✅ |
| `@tarojs/plugin-platform-rn` | React Native | 按需 |
| `@tarojs/plugin-platform-harmony-cpp` | 鸿蒙 C-API | 按需 |
| `@tarojs/plugin-compiler-optimization` | 编译优化 | 推荐 |

```typescript
plugins: [
  // 字符串形式（无配置）
  '@tarojs/plugin-platform-weapp',
  '@tarojs/plugin-platform-tt',
  '@tarojs/plugin-platform-h5',
  '@tarojs/plugin-platform-rn',
  
  // 数组形式（带配置）
  ['@tarojs/plugin-platform-harmony-cpp', {
    // useChoreLibrary: "4.1.1"
  }],
  
  ['@tarojs/plugin-compiler-optimization', {
    enable: true
  }],
  
  // 本地插件路径
  path.resolve(__dirname, '..', 'plugins/my-custom-plugin')
]
```

---

## 六、编译优化配置

### 6.1 terser（代码压缩）

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `terser.enable` | `boolean` | `true` | 是否启用 |
| `terser.config.compress.drop_console` | `boolean` | `false` | 移除 console |
| `terser.config.compress.drop_debugger` | `boolean` | `true` | 移除 debugger |
| `terser.config.compress.pure_funcs` | `array` | `[]` | 移除指定函数调用 |
| `terser.config.mangle.keep_fnames` | `boolean` | `false` | 保留函数名 |

```typescript
terser: {
  enable: true,
  config: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info']
    },
    mangle: {
      keep_fnames: false
    }
  }
}
```

### 6.2 csso（CSS 压缩）

```typescript
csso: {
  enable: true,
  config: {
    restructureOff: false  // 是否禁用结构优化
  }
}
```

---

## 七、Babel 配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `babel.sourceMap` | `boolean` | 生成 SourceMap |
| `babel.presets` | `array` | 预设列表 |
| `babel.plugins` | `array` | 插件列表 |

```typescript
babel: {
  sourceMap: true,
  presets: [
    ['env', { modules: false }]
  ],
  plugins: [
    'transform-decorators-legacy',
    'transform-class-properties',
    'transform-object-rest-spread',
    'transform-async-to-generator'
  ]
}
```

---

## 八、环境配置（config/dev.ts / config/prod.ts）

**config/dev.ts：**

```typescript
export default {
  logger: {
    quiet: false,
    stats: true
  },
  sourceMap: {
    enable: true,
    hidden: false
  },
  mini: {
    compile: {
      jsMinimizer: 'esbuild'  // 开发用 esbuild 更快
    }
  }
}
```

**config/prod.ts：**

```typescript
export default {
  logger: {
    quiet: true,
    stats: false
  },
  sourceMap: {
    enable: false
  },
  terser: {
    enable: true,
    config: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  mini: {
    compile: {
      jsMinimizer: 'terser'  // 生产用 terser 压缩更好
    }
  }
}
```

---

## 九、关键注意事项汇总

| 注意点 | 说明 | 后果 |
|--------|------|------|
| `designWidth` 必须与真实设计稿一致 | 750 设计稿写 750，375 设计稿写 375 | 样式尺寸错乱 |
| `deviceRatio` key 必须包含 `designWidth` | 如 `designWidth: 375`，必须有 `375: ...` | 编译报错 |
| `defineConstants` 值必须 `JSON.stringify` | 字符串、数字都要包裹 | 编译后变成变量名，运行报错 |
| `h5.publicPath` file 协议访问必须 `'./'` | 默认 `'/'` 在 file 协议下找不到资源 | 白屏 |
| `h5.router.mode` file 协议必须用 `'hash'` | `browser` 模式依赖 History API | 路由失效白屏 |
| `plugins` 必须包含目标平台插件 | 如编译 weapp 必须有 `plugin-platform-weapp` | 编译报错找不到平台 |
| `harmony.projectPath` 必须指向有效工程 | 需提前用 DevEco Studio 创建 | 鸿蒙编译失败 |
| `onePxTransform: false` 建议开启 | 1px 边框转 rpx 会变粗 | 边框显示过粗 |
| `selectorBlackList` 必须包含第三方库前缀 | 如 `nut-`, `van-` | UI 库样式被重复转换，尺寸错乱 |
| 全局 CLI 与项目依赖版本必须一致 | `taro --version` vs `package.json` | 各种诡异编译错误 |

---

## 十、最小可用配置模板

```typescript
// config/index.ts
import path from 'path'

const config = {
  projectName: 'my-app',
  date: '2026-05-27',
  designWidth: 750,
  deviceRatio: { 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
  
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  
  defineConstants: {
    API_URL: JSON.stringify('https://api.example.com')
  },
  
  plugins: [
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-tt',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-platform-rn'
  ],
  
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          onePxTransform: false,
          selectorBlackList: ['nut-', 'van-']
        }
      }
    }
  },
  
  h5: {
    publicPath: './',
    router: { mode: 'hash' },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          platform: 'h5',
          designWidth: 750,
          rootValue: 16
        }
      }
    }
  }
}

export default config
```

以上为 Taro 4.0.7 全部核心配置项及注意事项，按项目需求裁剪即可。