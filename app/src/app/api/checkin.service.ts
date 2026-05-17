import client from './client';
import type { ServerCheckIn, PaginatedData } from './types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function checkIn(): Promise<void> {
  if (USE_MOCK) return;
  return client.post('/v1/check-in');
}

export async function getCheckInStatus(): Promise<{ checked_in: boolean; streak_days?: number }> {
  if (USE_MOCK) return { checked_in: false, streak_days: 0 };
  return client.get('/v1/check-in/status');
}

export async function getCheckInHistory(query: { page?: number; pageSize?: number; month?: string } = {}): Promise<PaginatedData<ServerCheckIn>> {
  if (USE_MOCK) {
    return { list: [], total: 0, page: 1, pageSize: 31, totalPages: 0 };
  }
  return client.get('/v1/check-in/history', { params: query });
}
