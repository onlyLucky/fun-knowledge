import { Form, Input, Select, InputNumber, Upload, Button, App, Space, Spin } from "antd";
import type { FormInstance } from "antd/es/form";
import { UploadIcon, XIcon } from "lucide-react";
import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { CreateKnowledgeRequest, Knowledge } from "@/api/knowledge";
import { CATEGORY_ENDPOINTS, CategorySchema } from "@/api/category";
import type { Category } from "@/api/category";
import { httpClient } from "@/utils/http";
import { API_BASE_URL } from "@/utils/constants";
import { uploadFile } from "@/api/upload";
import { BaseFormModal } from "@/components/FormModal";
import { z } from "zod/v4";

export type FormModalProps = {
  open: boolean;
  editing: Knowledge | null;
  form: FormInstance<CreateKnowledgeRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateKnowledgeRequest) => void;
};

const categoryListSchema = z.array(CategorySchema);

const RESOURCE_TYPE_OPTIONS = [
  { label: "图片", value: "image" },
  { label: "视频", value: "video" },
  { label: "音频", value: "audio" },
  { label: "3D模型", value: "model_3d" },
  { label: "网页", value: "webpage" },
];

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
const VIDEO_EXTS = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;

function guessResourceType(url: string): string | undefined {
  if (!url) return undefined;
  if (IMAGE_EXTS.test(url)) return "image";
  if (VIDEO_EXTS.test(url)) return "video";
  return undefined;
}

function resolvePreviewUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API_BASE_URL || window.location.origin;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function FormModal({
  open,
  editing,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useLingui();
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => httpClient.get(CATEGORY_ENDPOINTS.list),
    select: (raw) => categoryListSchema.parse(raw),
    staleTime: 5 * 60 * 1000,
  });

  const resourceUrl = Form.useWatch("resource_url", form) as string | undefined;
  const resourceType = Form.useWatch("resource_type", form) as string | undefined;

  const previewType = useMemo(() => {
    if (resourceType === "image" || resourceType === "video") return resourceType;
    if (resourceUrl) return guessResourceType(resourceUrl);
    return undefined;
  }, [resourceUrl, resourceType]);

  useEffect(() => {
    setImgError(false);
    setImgLoading(!!resourceUrl);
  }, [resourceUrl]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file, "knowledge");
      form.setFieldsValue({
        resource_url: result.url,
        resource_type: result.resource_type,
      });
      message.success(t`上传成功`);
    } catch {
      message.error(t`上传失败`);
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const detected = guessResourceType(url);
    if (detected && !form.getFieldValue("resource_type")) {
      form.setFieldValue("resource_type", detected);
    }
  };

  const handleClearResource = () => {
    form.setFieldsValue({ resource_url: undefined, resource_type: undefined });
  };

  return (
    <BaseFormModal<CreateKnowledgeRequest>
      open={open}
      title={editing ? t`编辑知识` : t`新建知识`}
      okText={t`确定`}
      cancelText={t`取消`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item name="title" label={t`标题`} rules={[{ required: true, message: t`请输入标题` }]}>
        <Input placeholder={t`请输入标题`} />
      </Form.Item>
      <Form.Item
        name="content"
        label={t`内容`}
        rules={[{ required: true, message: t`请输入内容` }]}
      >
        <Input.TextArea rows={4} placeholder={t`请输入内容`} />
      </Form.Item>
      <Form.Item
        name="category_id"
        label={t`分类`}
        rules={[{ required: true, message: t`请选择分类` }]}
      >
        <Select
          placeholder={t`请选择分类`}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
        />
      </Form.Item>
      <Form.Item label={t`资源`}>
        <Space direction="vertical" style={{ width: "100%" }} size="small">
          <Form.Item name="resource_url" noStyle>
            <Input
              placeholder={t`输入图片或视频链接`}
              onChange={handleUrlChange}
              addonAfter={
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept="image/*,video/*"
                  disabled={uploading}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<UploadIcon size={14} />}
                    loading={uploading}
                    style={{ margin: -4 }}
                  />
                </Upload>
              }
            />
          </Form.Item>
          {resourceUrl && (
            <div style={{ position: "relative" }}>
              <Button
                type="text"
                size="small"
                icon={<XIcon size={14} />}
                onClick={handleClearResource}
                style={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
              />
              {previewType === "image" &&
                (imgError ? (
                  <div
                    style={{
                      maxHeight: 200,
                      borderRadius: 8,
                      border: "1px dashed #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 16,
                      color: "#999",
                      fontSize: 12,
                    }}
                  >
                    {t`图片加载失败`}
                  </div>
                ) : (
                  <Spin spinning={imgLoading}>
                    <img
                      src={resolvePreviewUrl(resourceUrl)}
                      alt={resourceUrl}
                      onLoad={() => setImgLoading(false)}
                      onError={() => {
                        setImgError(true);
                        setImgLoading(false);
                      }}
                      style={{
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "contain",
                        display: "block",
                        maxWidth: "100%",
                      }}
                    />
                  </Spin>
                ))}
              {previewType === "video" && (
                <video
                  src={resolvePreviewUrl(resourceUrl)}
                  controls
                  style={{ maxHeight: 200, borderRadius: 8, width: "100%" }}
                />
              )}
            </div>
          )}
        </Space>
      </Form.Item>
      <Form.Item name="resource_type" label={t`资源类型`}>
        <Select placeholder={t`选择资源类型`} options={RESOURCE_TYPE_OPTIONS} allowClear />
      </Form.Item>
      <Form.Item name="source" label={t`来源`}>
        <Input placeholder={t`来源`} />
      </Form.Item>
      <Form.Item name="tags" label={t`标签`}>
        <Select
          mode="tags"
          placeholder={t`输入标签，多个标签用顿号分隔`}
          tokenSeparators={["、"]}
        />
      </Form.Item>
      <Form.Item name="sort_weight" label={t`排序权重`} initialValue={0}>
        <InputNumber
          min={0}
          step={1}
          precision={0}
          style={{ width: "100%" }}
          placeholder={t`排序权重`}
        />
      </Form.Item>
    </BaseFormModal>
  );
}
