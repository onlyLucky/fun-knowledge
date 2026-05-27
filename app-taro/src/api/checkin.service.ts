import http from '@/utils/http'
import type { ServerCheckIn } from './types'

export interface CheckInStatus {
  checked_in: boolean
  streak_days?: number
}

export async function getCheckInStatus(): Promise<CheckInStatus> {
  return http.get<CheckInStatus>('/v1/check-in/status')
}

export async function checkIn(): Promise<ServerCheckIn> {
  return http.post<ServerCheckIn>('/v1/check-in')
}

export async function getCheckInHistory(query: { page?: number; pageSize?: number } = {}): Promise<ServerCheckIn[]> {
  return http.get<ServerCheckIn[]>('/v1/check-in/history', query)
}
