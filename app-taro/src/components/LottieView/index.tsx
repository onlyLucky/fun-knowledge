import { Component } from 'react'
import TaroLottie, { LottieViewType } from 'taro-lottie'

interface LottieViewProps {
  source: any
  style?: React.CSSProperties
  autoPlay?: boolean
  loop?: boolean
  speed?: number
  progress?: number
  onAnimationFinish?: (isCancelled: boolean) => void
}

export default class LottieView extends Component<LottieViewProps> {
  animation: LottieViewType | null = null

  componentDidMount() {
    // 小程序需要在页面 onReady 后初始化
    setTimeout(() => {
      this.animation?.init()
    }, 100)
  }

  play = (startFrame?: number, endFrame?: number) => {
    this.animation?.play(startFrame, endFrame)
  }

  reset = () => {
    this.animation?.reset()
  }

  pause = () => {
    this.animation?.pause()
  }

  resume = () => {
    this.animation?.resume()
  }

  render() {
    const { source, style, autoPlay = false, loop = true, speed = 1, progress, onAnimationFinish } = this.props

    return (
      <TaroLottie
        ref={(animation) => {
          this.animation = animation
        }}
        style={style}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        progress={progress}
        source={source}
        onAnimationFinish={onAnimationFinish}
      />
    )
  }
}
