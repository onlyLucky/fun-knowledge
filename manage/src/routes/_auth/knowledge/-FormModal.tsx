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
      title={editing ? t`Edit Knowledge` : t`New Knowledge`}
      okText={t`OK`}
      cancelText={t`Cancel`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item
        name="title"
        label={t`Title`}
        rules={[{ required: true, message: t`Please enter title` }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="content"
        label={t`Content`}
        rules={[{ required: true, message: t`Please enter content` }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="category_id"
        label={t`Category`}
        rules={[{ required: true, message: t`Please select category` }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="image_url" label={t`Image URL`}>
        <Input />
      </Form.Item>
      <Form.Item name="source" label={t`Source`}>
        <Input />
      </Form.Item>
      <Form.Item name="tags" label={t`Tags`}>
        <Select mode="tags" placeholder={t`Enter tags`} />
      </Form.Item>
      <Form.Item name="sort_weight" label={t`Sort Weight`}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </BaseFormModal>
  );
}
