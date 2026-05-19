import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SearchKeywordDocument = HydratedDocument<SearchKeyword>;

@Schema({ collection: 'search_keywords', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SearchKeyword {
  @Prop({ required: true })
  keyword: string;

  @Prop({ default: 0 })
  search_count: number;

  @Prop({ default: 0 })
  today_count: number;

  @Prop({ default: 0 })
  yesterday_count: number;

  @Prop()
  last_searched_at: Date;
}

export const SearchKeywordSchema = SchemaFactory.createForClass(SearchKeyword);

SearchKeywordSchema.index({ keyword: 1 }, { unique: true });
SearchKeywordSchema.index({ search_count: -1 });
SearchKeywordSchema.index({ today_count: -1 });
