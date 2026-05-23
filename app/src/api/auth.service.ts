import client from '@/lib/http';
import type { ServerUser, LoginTokens } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface LoginParams {
  platform: 'phone' | 'email' | 'wechat' | 'apple';
  phone?: string;
  smsCode?: string;
  email?: string;
  password?: string;
  code?: string;
  nickname?: string;
  avatar?: string;
}

export interface RegisterParams {
  platform: 'phone' | 'email';
  nickname: string;
  phone?: string;
  smsCode?: string;
  email?: string;
  password?: string;
}

export async function login(params: LoginParams): Promise<{ user: ServerUser; tokens: LoginTokens }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return {
      user: {
        id: 'mock-1',
        nickname: params.platform === 'phone' ? `用户${params.phone?.slice(-4)}` : params.email?.split('@')[0] || '用户',
        avatar: null,
        phone: params.phone || null,
        email: params.email || null,
        streak_days: 0,
        total_check_in_days: 0,
        ai_usage_count: 0,
        created_at: new Date().toISOString(),
      },
      tokens: { accessToken: 'mock-token' },
    };
  }

  const body: Record<string, unknown> = { platform: params.platform };
  if (params.platform === 'phone') { body.phone = params.phone; body.smsCode = params.smsCode; }
  if (params.platform === 'email') { body.email = params.email; body.password = params.password; }
  if (params.platform === 'wechat' || params.platform === 'apple') { body.code = params.code; }
  if (params.nickname) body.nickname = params.nickname;
  if (params.avatar) body.avatar = params.avatar;

  return client.post('/v1/auth/login', body);
}

export async function register(params: RegisterParams): Promise<{ user: ServerUser; tokens: LoginTokens }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900));
    return {
      user: {
        id: 'mock-new',
        nickname: params.nickname,
        avatar: null,
        phone: params.phone || null,
        email: params.email || null,
        streak_days: 0,
        total_check_in_days: 0,
        ai_usage_count: 0,
        created_at: new Date().toISOString(),
      },
      tokens: { accessToken: 'mock-token' },
    };
  }

  const body: Record<string, unknown> = {
    platform: params.platform,
    nickname: params.nickname,
  };
  if (params.platform === 'phone') {
    body.phone = params.phone;
    body.smsCode = params.smsCode;
  }
  if (params.platform === 'email') {
    body.email = params.email;
    body.password = params.password;
  }

  return client.post('/v1/auth/register', body);
}

export async function sendSmsCode(phone: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return;
  }
  return client.post('/v1/auth/sms/send', { phone });
}

export async function getProfile(): Promise<ServerUser> {
  if (USE_MOCK) {
    const stored = localStorage.getItem('auth_user');
    if (!stored) throw new Error('Not logged in');
    const u = JSON.parse(stored);
    return {
      id: 'mock-1',
      nickname: u.name || '用户',
      avatar: null,
      phone: u.phone || null,
      email: u.email || null,
      streak_days: 12,
      total_check_in_days: 45,
      ai_usage_count: 0,
      created_at: new Date().toISOString(),
    };
  }
  return client.get('/v1/auth/profile');
}

export async function updateProfile(data: { nickname?: string; avatar?: string; signature?: string }): Promise<{ pending: boolean; id?: string; status?: number } | null> {
  if (USE_MOCK) return { pending: false };
  return client.put('/v1/auth/profile', data);
}

export async function uploadAvatar(file: File): Promise<{ url: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1000));
    return { url: URL.createObjectURL(file) };
  }
  const formData = new FormData();
  formData.append('file', file);
  return client.post('/v1/upload?type=avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function refreshToken(refreshToken: string): Promise<LoginTokens> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 500));
    return { accessToken: 'mock-new-token', refreshToken: 'mock-new-refresh-token', expiresIn: 7200 };
  }
  return client.post('/v1/auth/refresh', { refresh_token: refreshToken });
}
