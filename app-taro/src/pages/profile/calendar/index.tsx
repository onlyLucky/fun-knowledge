import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import PageHeader from '../../../components/PageHeader'
import './index.less'

interface CalendarDay {
  date: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  isChecked: boolean
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [checkinDays, setCheckinDays] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [isTodayChecked, setIsTodayChecked] = useState(false)

  useEffect(() => {
    generateCalendar()
    loadCheckinData()
  }, [currentDate])

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: CalendarDay[] = []

    // 上个月的日期
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: false,
        isToday: false,
        isChecked: false,
      })
    }

    // 本月的日期
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isChecked: false,
      })
    }

    // 下个月的日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date: i,
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: false,
        isToday: false,
        isChecked: false,
      })
    }

    setCalendarDays(days)
  }

  const loadCheckinData = async () => {
    try {
      // TODO: 调用 API 获取签到数据
      setCheckinDays(15)
      setTotalDays(30)
      setIsTodayChecked(false)
    } catch (error) {
      console.error('Failed to load checkin data', error)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleCheckin = async () => {
    try {
      // TODO: 调用 API 进行签到
      setIsTodayChecked(true)
      setCheckinDays(prev => prev + 1)

      Taro.showToast({
        title: '签到成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('Failed to checkin', error)
      Taro.showToast({
        title: '签到失败',
        icon: 'none',
      })
    }
  }

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
  }

  return (
    <View className="calendar-page">
      <PageHeader title="签到日历" />

      <View className="month-selector">
        <View className="month-nav-btn" onClick={handlePrevMonth}>
          <Text className="nav-icon">‹</Text>
        </View>
        <Text className="current-month">{formatMonth(currentDate)}</Text>
        <View className="month-nav-btn" onClick={handleNextMonth}>
          <Text className="nav-icon">›</Text>
        </View>
      </View>

      <View className="stats-card">
        <View className="stats-row">
          <View className="stat-item">
            <Text className="stat-value">{checkinDays}</Text>
            <Text className="stat-label">已签到</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{totalDays}</Text>
            <Text className="stat-label">本月天数</Text>
          </View>
          <View className="stat-item">
            <Text className="stat-value">{Math.round(checkinDays / totalDays * 100)}%</Text>
            <Text className="stat-label">签到率</Text>
          </View>
        </View>
      </View>

      <View className="calendar-grid">
        <View className="weekday-header">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <Text key={day} className="weekday-item">{day}</Text>
          ))}
        </View>
        <View className="days-grid">
          {calendarDays.map((day, index) => (
            <View key={index} className="day-item">
              <View className={`day-number ${day.isChecked ? 'checked' : ''} ${day.isToday ? 'today' : ''} ${!day.isCurrentMonth ? 'other-month' : ''}`}>
                {day.date}
              </View>
              {day.isCurrentMonth && (
                <View className={`day-dot ${day.isChecked ? '' : 'unchecked'}`} />
              )}
            </View>
          ))}
        </View>
      </View>

      <View className="checkin-btn-wrapper">
        <button
          className="checkin-btn"
          disabled={isTodayChecked}
          onClick={handleCheckin}
        >
          {isTodayChecked ? '今日已签到' : '立即签到'}
        </button>
      </View>
    </View>
  )
}
