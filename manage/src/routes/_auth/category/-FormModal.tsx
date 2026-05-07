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
      title={editing ? t`编辑分类` : t`新建分类`}
      okText={t`确定`}
      cancelText={t`取消`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item name="name" label={t`名称`} rules={[{ required: true, message: t`请输入名称` }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label={t`描述`}>
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item name="icon" label={t`图标`}>
        <Input />
      </Form.Item>
      <Form.Item name="sort_order" label={t`排序`}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
    </BaseFormModal>
  );
}
