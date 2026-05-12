import { Form, Input, Select, InputNumber, Upload, Button, App } from "antd";
import type { FormInstance } from "antd/es/form";
import { UploadIcon } from "lucide-react";
import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import type { CreateKnowledgeRequest, Knowledge } from "@/api/knowledge";
import { CATEGORY_ENDPOINTS, CategorySchema } from "@/api/category";
import type { Category } from "@/api/category";
import { httpClient } from "@/utils/http";
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

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => httpClient.get(CATEGORY_ENDPOINTS.list),
    select: (raw) => categoryListSchema.parse(raw),
    enabled: open,
  });

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadFile(file, "knowledge");
      form.setFieldsValue({
        resource_url: result.url,
        resource_type: result.resource_type,
      });
      message.success(t`上传成功`);
    } catch {
      message.error(t`上传失败`);
    }
    return false; // 阻止 antd 默认上传行为
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
      <Form.Item label={t`资源文件`}>
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/*,video/*,audio/*,.glb,.gltf,.fbx,.obj"
        >
          <Button icon={<UploadIcon size={16} />}>{t`选择文件`}</Button>
        </Upload>
      </Form.Item>
      <Form.Item name="resource_url" label={t`资源链接`}>
        <Input placeholder={t`资源链接（上传后自动填入，也可手动输入）`} />
      </Form.Item>
      <Form.Item name="resource_type" label={t`资源类型`}>
        <Select placeholder={t`选择资源类型`} options={RESOURCE_TYPE_OPTIONS} allowClear />
      </Form.Item>
      <Form.Item name="source" label={t`来源`}>
        <Input placeholder={t`来源`} />
      </Form.Item>
      <Form.Item name="tags" label={t`标签`}>
        <Select mode="tags" placeholder={t`输入标签`} />
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
