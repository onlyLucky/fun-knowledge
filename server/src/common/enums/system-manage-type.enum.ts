/**
 * 系统管理功能类型枚举
 */
export enum SystemManageType {
  /** 知识卡片存储统计 */
  STORAGE_STATS = 'storage_stats',
  /** 清理知识卡片未使用资源 */
  STORAGE_CLEAN = 'storage_clean',
  /** 用户头像存储统计 */
  AVATAR_STORAGE_STATS = 'avatar_storage_stats',
  /** 清理用户头像未使用资源 */
  AVATAR_STORAGE_CLEAN = 'avatar_storage_clean',
}
