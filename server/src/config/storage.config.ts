import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  localPath: process.env.UPLOAD_LOCAL_PATH || './uploads',
  oss: {
    region: process.env.ALIYUN_OSS_REGION || '',
    accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.ALIYUN_OSS_BUCKET || '',
    endpoint: process.env.ALIYUN_OSS_ENDPOINT || '',
  },
}));
