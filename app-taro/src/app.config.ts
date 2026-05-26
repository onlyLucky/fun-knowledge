export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/discover/index',
    'pages/profile/index',
    'pages/auth/welcome/index',
    'pages/auth/login/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#1C1A1B',
    navigationBarTitleText: '冷知识星球',
    navigationBarTextStyle: 'white',
    backgroundColor: '#1C1A1B'
  },
  tabBar: {
    color: '#8C8A8B',
    selectedColor: '#FDFDFD',
    backgroundColor: '#1C1A1B',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/discover/index',
        text: '发现'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
