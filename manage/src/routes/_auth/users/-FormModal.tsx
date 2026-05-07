import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import type { CreateUserRequest, User } from "@/api/schemas";
import { BaseFormModal } from "@/components/FormModal";

export type FormModalProps = {
  open: boolean;
  editingUser: User | null;
  form: FormInstance<CreateUserRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateUserRequest) => void;
};

export function FormModal({
  open,
  editingUser,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useLingui();

  return (
    <BaseFormModal<CreateUserRequest>
      open={open}
      title={editingUser ? t`编辑用户` : t`新建用户`}
      okText={t`确定`}
      cancelText={t`取消`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label={t`用户名`}
        rules={[{ required: true, message: t`请输入用户名` }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="roles" label={t`角色`} rules={[{ required: true, message: t`请选择角色` }]}>
        <Select
          mode="multiple"
          options={[
            { label: t`管理员`, value: "admin" },
            { label: t`编辑`, value: "editor" },
          ]}
        />
      </Form.Item>
      <Form.Item name="email" label={t`邮箱`}>
        <Input />
      </Form.Item>
    </BaseFormModal>
  );
}
