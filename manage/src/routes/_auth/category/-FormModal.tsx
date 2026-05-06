import { Form, Input, InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import type { CreateCategoryRequest, Category } from "@/api/category";
import { BaseFormModal } from "@/components/FormModal";

export type FormModalProps = {
  open: boolean;
  editing: Category | null;
  form: FormInstance<CreateCategoryRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateCategoryRequest) => void;
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
    <BaseFormModal<CreateCategoryRequest>
      open={open}
      title={editing ? t`Edit Category` : t`New Category`}
      okText={t`OK`}
      cancelText={t`Cancel`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label={t`Name`}
        rules={[{ required: true, message: t`Please enter name` }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="description" label={t`Description`}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="icon" label={t`Icon`}>
        <Input />
      </Form.Item>
      <Form.Item name="sort_order" label={t`Sort Order`}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </BaseFormModal>
  );
}
