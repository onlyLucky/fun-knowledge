import http from '@/utils/http'
import type { ServerUser, LoginTokens } from './types'

export interface LoginResult {
  user: ServerUser
  tokens: LoginTokens
}

export async function loginByPhone(phone: string, code: string): Promise<LoginResult> {
  return http.post<LoginResult>('/v1/auth/login', {
    platform: 'phone',
    phone,
    code
  })
}

export async function sendSmsCode(phone: string): Promise<void> {
  return http.post('/v1/auth/sms/send', { phone })
}

export async function registerByPhone(phone: string, code: string, nickname?: string): Promise<LoginResult> {
  return http.post<LoginResult>('/v1/auth/register', {
    platform: 'phone',
    phone,
    code,
    nickname
  })
}

export async function refreshToken(refreshToken: string): Promise<LoginTokens> {
  return http.post<LoginTokens>('/v1/auth/refresh', { refresh_token: refreshToken })
}

export async function getProfile(): Promise<ServerUser> {
  return http.get<ServerUser>('/v1/auth/profile')
}

export interface UpdateProfileData {
  avatar?: string
  nickname?: string
  signature?: string
}

export async function updateProfile(data: UpdateProfileData): Promise<{ pending: boolean }> {
  return http.put<{ pending: boolean }>('/v1/auth/profile', data)
}
