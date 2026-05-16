import { ApiProperty } from '@nestjs/swagger';

export class StorageTypeStats {
  @ApiProperty({ description: '资源类型' })
  type: string;

  @ApiProperty({ description: '文件数' })
  count: number;

  @ApiProperty({ description: '大小(bytes)' })
  size: number;
}

export class UnusedResourceItem {
  @ApiProperty({ description: '相对路径' })
  path: string;

  @ApiProperty({ description: '文件名' })
  filename: string;

  @ApiProperty({ description: '大小(bytes)' })
  size: number;

  @ApiProperty({ description: '修改时间' })
  modified_at: Date;
}

export class StorageStatsData {
  @ApiProperty({ description: '知识资源总文件数' })
  total_files: number;

  @ApiProperty({ description: '知识资源总大小(bytes)' })
  total_size: number;

  @ApiProperty({ description: '已引用文件数' })
  used_files: number;

  @ApiProperty({ description: '已引用文件大小(bytes)' })
  used_size: number;

  @ApiProperty({ description: '未引用文件数' })
  unused_files: number;

  @ApiProperty({ description: '未引用文件大小(bytes)' })
  unused_size: number;

  @ApiProperty({ description: '按类型分组统计', type: [StorageTypeStats] })
  types: StorageTypeStats[];

  @ApiProperty({ description: '未使用文件列表', type: [UnusedResourceItem] })
  unused_items: UnusedResourceItem[];
}

export class CleanResultData {
  @ApiProperty({ description: '删除文件数' })
  deleted_count: number;

  @ApiProperty({ description: '释放空间(bytes)' })
  freed_size: number;
}
