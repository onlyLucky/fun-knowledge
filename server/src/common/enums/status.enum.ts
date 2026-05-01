/**
 * 通用状态枚举
 */
export enum Status {
  /** 正常/启用 */
  ACTIVE = 0,
  /** 禁用 */
  DISABLED = 1,
}

/**
 * 知识卡片状态枚举
 */
export enum KnowledgeStatus {
  /** 下架 */
  OFFLINE = 0,
  /** 上架 */
  ONLINE = 1,
}

/**
 * 纠错状态枚举
 */
export enum CorrectionStatus {
  /** 待审核 */
  PENDING = 0,
  /** 已采纳 */
  ACCEPTED = 1,
  /** 已驳回 */
  REJECTED = 2,
}

/**
 * 导入任务状态枚举
 */
export enum ImportStatus {
  /** 处理中 */
  PROCESSING = 0,
  /** 成功 */
  SUCCESS = 1,
  /** 失败 */
  FAILED = 2,
}

/**
 * 纠错类型枚举
 */
export enum CorrectionType {
  /** 内容错误 */
  CONTENT = 1,
  /** 分类错误 */
  CATEGORY = 2,
  /** 图片不符 */
  IMAGE = 3,
  /** 其他 */
  OTHER = 4,
}

/**
 * 登录平台枚举
 */
export enum LoginPlatform {
  WECHAT = 'wechat',
  QQ = 'qq',
  DOUYIN = 'douyin',
  PHONE = 'phone',
  EMAIL = 'email',
  APPLE = 'apple',
}
