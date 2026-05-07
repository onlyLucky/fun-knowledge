import { Form, Input, Select, InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import type { CreateKnowledgeRequest, Knowledge } from "@/api/knowledge";
import { BaseFormModal } from "@/components/FormModal";

export type FormModalProps = {
  open: boolean;
  editing: Knowledge | null;
  form: FormInstance<CreateKnowledgeRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateKnowledgeRequest) => void;
};

export function FormModal({
  open,
  editing,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useLingui();

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
        <Input />
      </Form.Item>
      <Form.Item
        name="content"
        label={t`内容`}
        rules={[{ required: true, message: t`请输入内容` }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="category_id"
        label={t`分类`}
        rules={[{ required: true, message: t`请选择分类` }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="image_url" label={t`图片链接`}>
        <Input />
      </Form.Item>
      <Form.Item name="source" label={t`来源`}>
        <Input />
      </Form.Item>
      <Form.Item name="tags" label={t`标签`}>
        <Select mode="tags" placeholder={t`输入标签`} />
      </Form.Item>
      <Form.Item name="sort_weight" label={t`排序权重`}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </BaseFormModal>
  );
}
