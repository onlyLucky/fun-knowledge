import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecommendLogDocument = HydratedDocument<RecommendLog>;

/**
 * 推荐日志 MongoDB Schema
 */
@Schema({ collection: 'recommend_logs', timestamps: { createdAt: 'created_at', updatedAt: false } })
export class RecommendLog {
  @Prop({ comment: '用户 ID' })
  user_id: string;

  @Prop({ required: true, comment: '推荐的卡片 ID' })
  knowledge_id: string;

  @Prop({ required: true, comment: '推荐策略' })
  strategy: string;

  @Prop({ comment: '推荐分数' })
  score: number;

  @Prop({ comment: '推荐位置' })
  position: number;

  @Prop({ default: 0, comment: '是否被点击：0-未点击，1-已点击' })
  is_clicked: number;

  @Prop({ comment: '点击时间' })
  clicked_at: Date;

  @Prop({ comment: '浏览时长（秒）' })
  browse_duration: number;

  @Prop({ comment: '行为类型：browse/favorite/ai_extend' })
  action: string;

  @Prop({ default: () => new Date(), comment: '推荐时间' })
  recommended_at: Date;
}

export const RecommendLogSchema = SchemaFactory.createForClass(RecommendLog);

// 创建索引
RecommendLogSchema.index({ user_id: 1 });
RecommendLogSchema.index({ knowledge_id: 1 });
RecommendLogSchema.index({ strategy: 1 });
RecommendLogSchema.index({ created_at: -1 });
RecommendLogSchema.index({ user_id: 1, created_at: -1 });
RecommendLogSchema.index({ user_id: 1, knowledge_id: 1, action: 1, created_at: -1 });
