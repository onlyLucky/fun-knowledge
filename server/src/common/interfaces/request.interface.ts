/**
 * 请求用户信息接口
 */
export interface RequestUser {
  id: string;
  openid?: string;
  nickname?: string;
  role?: number;
}

/**
 * 管理员请求信息接口
 */
export interface RequestAdmin {
  id: string;
  username: string;
  role: number;
}
