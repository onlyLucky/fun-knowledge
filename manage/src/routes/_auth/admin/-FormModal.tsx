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
      title={editing ? t`Edit Admin` : t`New Admin`}
      okText={t`OK`}
      cancelText={t`Cancel`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label={t`Username`}
        rules={[{ required: true, message: t`Please enter username` }]}
      >
        <Input disabled={!!editing} />
      </Form.Item>
      {!editing && (
        <Form.Item
          name="password"
          label={t`Password`}
          rules={[{ required: true, message: t`Please enter password` }]}
        >
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item name="real_name" label={t`Real Name`}>
        <Input />
      </Form.Item>
      <Form.Item
        name="role"
        label={t`Role`}
        rules={[{ required: true, message: t`Please select role` }]}
      >
        <Select
          options={[
            { label: t`Super Admin`, value: AdminRole.SUPER_ADMIN },
            { label: t`Content Admin`, value: AdminRole.CONTENT_ADMIN },
            { label: t`Operations`, value: AdminRole.OPERATIONS },
            { label: t`Reviewer`, value: AdminRole.REVIEWER },
          ]}
        />
      </Form.Item>
    </BaseFormModal>
  );
}
