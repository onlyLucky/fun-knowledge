import { View, Text } from '@tarojs/components'
import { ChevronLeft } from 'lucide-taro-react'
import Taro from '@tarojs/taro'
import './index.less'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
}

export function PageHeader({
  title,
  subtitle,
  right,
  showBack = true,
  onBack
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      Taro.navigateBack()
    }
  }

  return (
    <View className="page-header">
      <View className="page-header-left">
        {showBack && (
          <View 
            className="page-header-back" 
            onClick={handleBack}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </View>
        )}
        <View className="page-header-title-wrapper">
          <Text className="page-header-title">{title}</Text>
          {subtitle && (
            <Text className="page-header-subtitle">{subtitle}</Text>
          )}
        </View>
      </View>
      {right && <View className="page-header-right">{right}</View>}
    </View>
  )
}

export default PageHeader
