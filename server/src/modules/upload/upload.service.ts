import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as OSS from 'ali-oss';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { ConfigService as AppConfigService } from '../config/config.service';
import { ResourceType } from '../../common/enums/resource-type.enum';
import { UploadType } from './dto/upload.dto';

/** MIME type → ResourceType 映射 */
const MIME_TO_RESOURCE_TYPE: Record<string, ResourceType> = {
  'image/jpeg': ResourceType.IMAGE,
  'image/png': ResourceType.IMAGE,
  'image/gif': ResourceType.IMAGE,
  'image/webp': ResourceType.IMAGE,
  'image/svg+xml': ResourceType.IMAGE,
  'video/mp4': ResourceType.VIDEO,
  'video/webm': ResourceType.VIDEO,
  'video/quicktime': ResourceType.VIDEO,
  'video/x-msvideo': ResourceType.VIDEO,
  'audio/mpeg': ResourceType.AUDIO,
  'audio/wav': ResourceType.AUDIO,
  'audio/ogg': ResourceType.AUDIO,
  'model/gltf-binary': ResourceType.MODEL_3D,
  'model/gltf+json': ResourceType.MODEL_3D,
  'application/octet-stream': ResourceType.MODEL_3D, // .glb fallback
};

/** 扩展名 → ResourceType 映射（MIME 不可靠时的备选） */
const EXT_TO_RESOURCE_TYPE: Record<string, ResourceType> = {
  '.jpg': ResourceType.IMAGE,
  '.jpeg': ResourceType.IMAGE,
  '.png': ResourceType.IMAGE,
  '.gif': ResourceType.IMAGE,
  '.webp': ResourceType.IMAGE,
  '.svg': ResourceType.IMAGE,
  '.mp4': ResourceType.VIDEO,
  '.webm': ResourceType.VIDEO,
  '.mov': ResourceType.VIDEO,
  '.avi': ResourceType.VIDEO,
  '.mp3': ResourceType.AUDIO,
  '.wav': ResourceType.AUDIO,
  '.ogg': ResourceType.AUDIO,
  '.glb': ResourceType.MODEL_3D,
  '.gltf': ResourceType.MODEL_3D,
  '.fbx': ResourceType.MODEL_3D,
  '.obj': ResourceType.MODEL_3D,
};

/** 允许的头像 MIME 类型 */
const AVATAR_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/** 默认上传大小限制（字节） */
const DEFAULT_UPLOAD_LIMITS: Record<string, number> = {
  image: 3 * 1024 * 1024,      // 3MB
  video: 50 * 1024 * 1024,     // 50MB
  model_3d: 30 * 1024 * 1024,  // 30MB
  audio: 10 * 1024 * 1024,     // 10MB
};

/** 头像默认大小限制 */
const AVATAR_MAX_SIZE = 3 * 1024 * 1024; // 3MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private ossClient: OSS | null = null;
  private useOss = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.initOss();
  }

  private initOss() {
    const region = this.configService.get<string>('storage.oss.region');
    const accessKeyId = this.configService.get<string>('storage.oss.accessKeyId');
    const accessKeySecret = this.configService.get<string>('storage.oss.accessKeySecret');
    const bucket = this.configService.get<string>('storage.oss.bucket');

    // 仅当配置非占位值时启用 OSS
    if (
      region &&
      accessKeyId &&
      accessKeySecret &&
      bucket &&
      accessKeyId !== 'your-access-key-id'
    ) {
      this.ossClient = new OSS({
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
      });
      this.useOss = true;
      this.logger.log('使用阿里云 OSS 存储');
    } else {
      this.useOss = false;
      this.logger.log('使用本地磁盘存储');
    }
  }

  /**
   * 上传文件
   */
  async upload(
    file: Express.Multer.File,
    uploadType: UploadType,
  ): Promise<{ url: string; resource_type?: string }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let resourceType: ResourceType | undefined;

    if (uploadType === UploadType.AVATAR) {
      this.validateAvatar(file);
      resourceType = ResourceType.IMAGE;
    } else {
      resourceType = this.detectResourceType(file.mimetype, ext);
      if (!resourceType) {
        throw new BadRequestException('不支持的文件类型');
      }
      await this.validateKnowledgeFile(file, resourceType);
    }

    const filename = `${uuid()}${ext}`;

    let url: string;
    if (this.useOss) {
      url = await this.uploadToOss(file, filename, uploadType);
    } else {
      url = await this.uploadToLocal(file, filename);
    }

    return {
      url,
      resource_type: uploadType === UploadType.KNOWLEDGE ? resourceType : undefined,
    };
  }

  /**
   * 校验头像文件
   */
  private validateAvatar(file: Express.Multer.File): void {
    if (!AVATAR_ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('头像仅支持 JPG、PNG、GIF、WebP 格式');
    }
    if (file.size > AVATAR_MAX_SIZE) {
      throw new BadRequestException(`头像文件大小不能超过 ${AVATAR_MAX_SIZE / 1024 / 1024}MB`);
    }
  }

  /**
   * 校验知识卡片资源文件
   */
  private async validateKnowledgeFile(
    file: Express.Multer.File,
    resourceType: ResourceType,
  ): Promise<void> {
    const limits = await this.getUploadLimits();
    const maxSize = limits[resourceType] || DEFAULT_UPLOAD_LIMITS[resourceType] || 10 * 1024 * 1024;

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / 1024 / 1024);
      throw new BadRequestException(`文件大小不能超过 ${sizeMB}MB`);
    }
  }

  /**
   * 从 SystemConfig 获取上传大小限制
   */
  private async getUploadLimits(): Promise<Record<string, number>> {
    try {
      const config = await this.appConfigService.findByKey('upload_limits');
      return JSON.parse(config.config_value);
    } catch {
      return DEFAULT_UPLOAD_LIMITS;
    }
  }

  /**
   * 检测资源类型
   */
  private detectResourceType(mimeType: string, ext: string): ResourceType | undefined {
    return MIME_TO_RESOURCE_TYPE[mimeType] || EXT_TO_RESOURCE_TYPE[ext];
  }

  /**
   * 上传到本地磁盘
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    filename: string,
  ): Promise<string> {
    const uploadDir = this.configService.get<string>('storage.localPath', './uploads');

    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    this.logger.log(`文件已保存到本地: ${filePath}`);
    return `/uploads/${filename}`;
  }

  /**
   * 上传到阿里云 OSS
   */
  private async uploadToOss(
    file: Express.Multer.File,
    filename: string,
    uploadType: UploadType,
  ): Promise<string> {
    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const ossPath = `${uploadType}/${month}/${filename}`;

    const result = await this.ossClient!.put(ossPath, file.buffer, {
      headers: { 'Content-Type': file.mimetype },
    });

    this.logger.log(`文件已上传到 OSS: ${result.name}`);
    return result.url;
  }
}
