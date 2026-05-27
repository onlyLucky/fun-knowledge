import path from 'path'
import os from 'os'

const config = {
  projectName: 'funfact-taro',
  date: '2026-5-26',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    '@tarojs/plugin-html',
    '@tarojs/plugin-platform-weapp',
    '@tarojs/plugin-platform-tt',
    '@tarojs/plugin-platform-alipay',
    '@tarojs/plugin-platform-h5',
    '@tarojs/plugin-platform-harmony-cpp'
  ],
  defineConstants: {},
  alias: {
    '@': path.resolve(__dirname, '..', 'src')
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: { enable: false }
  },
  cache: {
    enable: false
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          onePxTransform: false,
          unitPrecision: 5,
          propList: ['*'],
          selectorBlackList: ['nut-', 'van-', 'taro-'],
          replace: true,
          mediaQuery: false,
          minPixelValue: 2
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    optimizeMainPackage: {
      enable: true
    }
  },
  h5: {
    publicPath: './',
    staticDirectory: 'static',
    output: {
      filename: 'js/[name].[hash:8].js',
      chunkFilename: 'chunks/[name].[chunkhash:8].js'
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
      filename: 'css/[name].[hash:8].css',
      chunkFilename: 'css/[name].[chunkhash:8].css'
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {
          overrideBrowserslist: ['last 3 versions', 'Android >= 4.1', 'ios >= 8']
        }
      },
      pxtransform: {
        enable: true,
        config: {
          platform: 'h5',
          designWidth: 750,
          unitPrecision: 5,
          propList: ['*'],
          selectorBlackList: ['nut-', 'van-', 'taro-'],
          onePxTransform: false,
          replace: true,
          minPixelValue: 2
        }
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    esnextModules: ['taro-ui', 'nutui-react', 'lodash-es'],
    router: {
      mode: 'hash',
      basename: '/',
      customRoutes: {
        '/pages/home/index': '/home',
        '/pages/discover/index': '/discover',
        '/pages/profile/index': '/profile'
      }
    },
    devServer: {
      port: 10086,
      host: '0.0.0.0',
      https: false,
      hot: true,
      compress: true,
      historyApiFallback: true,
      static: {
        watch: true,
        directory: path.resolve(__dirname, '../static')
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: { '^/api': '' },
          secure: false
        }
      }
    }
  },
  harmony: {
    projectPath: path.join(os.homedir(), 'HarmonyProjects/FunFact'),
    hapName: 'entry',
    compileMode: 'c_api'
  }
}

module.exports = function (merge: any) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
