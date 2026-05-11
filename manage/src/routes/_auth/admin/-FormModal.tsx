import { Form, Input, Select } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import { AdminRole } from "@/api/schemas";
import type { CreateAdminRequest, AdminItem } from "@/api/admin";
import { BaseFormModal } from "@/components/FormModal";

export type FormModalProps = {
  open: boolean;
  editing: AdminItem | null;
  form: FormInstance<CreateAdminRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateAdminRequest) => void;
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
    <BaseFormModal<CreateAdminRequest>
      open={open}
      title={editing ? t`编辑管理员` : t`新建管理员`}
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
        <Input disabled={!!editing} placeholder={t`请输入用户名`} />
      </Form.Item>
      {!editing && (
        <Form.Item
          name="password"
          label={t`密码`}
          rules={[{ required: true, message: t`请输入密码` }]}
        >
          <Input.Password placeholder={t`请输入密码`} />
        </Form.Item>
      )}
      <Form.Item name="real_name" label={t`真实姓名`}>
        <Input placeholder={t`真实姓名`} />
      </Form.Item>
      <Form.Item name="role" label={t`角色`} rules={[{ required: true, message: t`请选择角色` }]}>
        <Select
          placeholder={t`请选择角色`}
          options={[
            { label: t`超级管理员`, value: AdminRole.SUPER_ADMIN },
            { label: t`内容管理员`, value: AdminRole.CONTENT_ADMIN },
            { label: t`运营`, value: AdminRole.OPERATIONS },
            { label: t`审核员`, value: AdminRole.REVIEWER },
          ]}
        />
      </Form.Item>
    </BaseFormModal>
  );
}
