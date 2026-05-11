import { Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import type { CreateKnowledgeRequest, Knowledge } from "@/api/knowledge";
import { CATEGORY_ENDPOINTS, CategorySchema } from "@/api/category";
import type { Category } from "@/api/category";
import { httpClient } from "@/utils/http";
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

export function FormModal({
  open,
  editing,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useLingui();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: () => httpClient.get(CATEGORY_ENDPOINTS.list),
    select: (raw) => categoryListSchema.parse(raw),
    enabled: open,
  });

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
      <Form.Item name="image_url" label={t`图片链接`}>
        <Input placeholder={t`图片链接`} />
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
