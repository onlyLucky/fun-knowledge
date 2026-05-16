import { ApiProperty } from '@nestjs/swagger';

export class SystemDataItem {
  @ApiProperty({ description: '功能类型' })
  type: string;

  @ApiProperty({ description: '功能名称' })
  label: string;

  @ApiProperty({ description: '业务数据' })
  data: unknown;
}

export class SystemDataGroup {
  @ApiProperty({ description: '分组标识' })
  key: string;

  @ApiProperty({ description: '分组名称' })
  label: string;

  @ApiProperty({ description: '功能项列表', type: [SystemDataItem] })
  items: SystemDataItem[];
}

export class SystemDataDto {
  @ApiProperty({ description: '分组列表', type: [SystemDataGroup] })
  groups: SystemDataGroup[];
}
