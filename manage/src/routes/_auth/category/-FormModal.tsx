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
        <Input placeholder={t`请输入名称`} />
      </Form.Item>
      <Form.Item name="description" label={t`描述`}>
        <Input.TextArea rows={2} placeholder={t`请输入描述`} />
      </Form.Item>
      <Form.Item name="icon" label={t`图标`}>
        <Input placeholder={t`请输入图标`} />
      </Form.Item>
      <Form.Item name="sort_order" label={t`排序`} initialValue={0}>
        <InputNumber
          min={0}
          step={1}
          precision={0}
          style={{ width: "100%" }}
          placeholder={t`请输入排序`}
        />
      </Form.Item>
      <Form.Item
        name="weight"
        label={t`运营权重`}
        initialValue={0}
        tooltip={t`-2到2，影响推荐排序`}
      >
        <InputNumber
          min={-2}
          max={2}
          step={1}
          precision={0}
          style={{ width: "100%" }}
          placeholder={t`运营权重`}
        />
      </Form.Item>
    </BaseFormModal>
  );
}
