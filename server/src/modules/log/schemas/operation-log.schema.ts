import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OperationLogDocument = HydratedDocument<OperationLog>;

/**
 * 操作日志 MongoDB Schema
 */
@Schema({ collection: 'operation_logs', timestamps: { createdAt: 'created_at', updatedAt: false } })
export class OperationLog {
  @Prop({ required: true, comment: '操作人 ID' })
  admin_id: string;

  @Prop({ required: true, comment: '操作人用户名' })
  admin_username: string;

  @Prop({ required: true, comment: '操作模块' })
  module: string;

  @Prop({ required: true, comment: '操作类型' })
  action: string;

  @Prop({ comment: '操作对象 ID' })
  target_id: string;

  @Prop({ comment: '操作描述' })
  description: string;

  @Prop({ type: Object, comment: '请求参数' })
  request_data: Record<string, any>;

  @Prop({ type: Object, comment: '响应数据' })
  response_data: Record<string, any>;

  @Prop({ comment: 'IP 地址' })
  ip: string;

  @Prop({ comment: 'User-Agent' })
  user_agent: string;

  @Prop({ comment: '操作状态', default: 1 })
  status: number;

  @Prop({ comment: '错误信息' })
  error_message: string;

  @Prop({ comment: '耗时（毫秒）' })
  duration: number;

  @Prop({ default: () => new Date(), comment: '创建时间' })
  created_at: Date;
}

export const OperationLogSchema = SchemaFactory.createForClass(OperationLog);

// 创建索引
OperationLogSchema.index({ admin_id: 1 });
OperationLogSchema.index({ module: 1 });
OperationLogSchema.index({ action: 1 });
OperationLogSchema.index({ created_at: -1 });
