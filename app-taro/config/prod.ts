module.exports = {
  env: {
    NODE_ENV: '"production"'
  },
  defineConstants: {},
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
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        keep_fnames: false
      }
    }
  },
  csso: {
    enable: true,
    config: {
      restructureOff: false
    }
  },
  mini: {},
  h5: {
    enableSourceMap: false
  }
}
