import { View } from '@tarojs/components'
import { useState } from 'react'
import LottieView from './index'

// 示例动画数据（简单的圆形加载动画）
const loadingAnimation = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: 'Loading',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [360] }, { t: 60, s: [360] }] },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: 'gr',
          it: [
            {
              d: 1,
              ty: 'el',
              s: { a: 0, k: [80, 80] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: 'st',
              c: { a: 0, k: [0.2, 0.6, 1, 1] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 8 }
            },
            {
              ty: 'tr',
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ]
        }
      ],
      ip: 0,
      op: 60,
      st: 0
    }
  ]
}

export default function LottieExample() {
  const [isPlaying, setIsPlaying] = useState(true)

  const handleToggle = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <View style={{ padding: '20px' }}>
      <View style={{ marginBottom: '20px' }}>
        <LottieView
          source={loadingAnimation}
          style={{ width: '200px', height: '200px' }}
          autoPlay={true}
          loop={true}
          speed={isPlaying ? 1 : 0}
        />
      </View>
      <View
        style={{
          padding: '10px 20px',
          backgroundColor: '#347EFB',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center'
        }}
        onClick={handleToggle}
      >
        {isPlaying ? '暂停' : '播放'}
      </View>
    </View>
  )
}
