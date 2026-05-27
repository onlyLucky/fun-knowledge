import http from '@/utils/http'
import type { ServerCategory } from './types'

export async function getCategories(): Promise<ServerCategory[]> {
  return http.get<ServerCategory[]>('/v1/category/list')
}
