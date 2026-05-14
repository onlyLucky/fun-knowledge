import {
  Form,
  Input,
  Select,
  InputNumber,
  ColorPicker,
  DatePicker,
  Button,
  Space,
  Flex,
  theme,
} from "antd";
import type { FormInstance } from "antd/es/form";
import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Plus, Trash2 } from "lucide-react";
import {
  CONFIG_ENDPOINTS,
  CONFIG_TYPES,
  CONFIG_TYPE_LABELS,
  ConfigOptionSchema,
} from "@/api/config";
import type { ConfigType, CreateConfigRequest, SystemConfig } from "@/api/config";
import { httpClient } from "@/utils/http";
import { BaseFormModal } from "@/components/FormModal";
import { z } from "zod/v4";

export type FormModalProps = {
  open: boolean;
  editing: SystemConfig | null;
  form: FormInstance<CreateConfigRequest>;
  confirmLoading: boolean;
  onCancel: () => void;
  onFinish: (values: CreateConfigRequest) => void;
};

const optionsListSchema = z.array(ConfigOptionSchema);

function parseOptions(raw: string | null | undefined): { label: string; value: string }[] {
  if (!raw) return [];
  try {
    return optionsListSchema.parse(JSON.parse(raw));
  } catch {
    return [];
  }
}

/* ---- storage helpers ---- */

const STORAGE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
type StorageUnit = (typeof STORAGE_UNITS)[number];

const UNIT_BYTES: Record<StorageUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

function bytesToBest(bytes: number): { value: number; unit: StorageUnit } {
  if (bytes <= 0) return { value: 0, unit: "B" };
  let best: StorageUnit = "B";
  let bestVal = bytes;
  for (const u of STORAGE_UNITS) {
    const v = bytes / UNIT_BYTES[u];
    if (v >= 1) {
      best = u;
      bestVal = v;
    }
  }
  return { value: Number(bestVal.toFixed(2)), unit: best };
}

function storageToBytes(value: number, unit: StorageUnit): number {
  return Math.round(value * UNIT_BYTES[unit]);
}

export function FormModal({
  open,
  editing,
  form,
  confirmLoading,
  onCancel,
  onFinish,
}: FormModalProps) {
  const { t } = useLingui();
  const { token } = theme.useToken();
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [storageValue, setStorageValue] = useState<number>(0);
  const [storageUnit, setStorageUnit] = useState<StorageUnit>("MB");

  const { data: groups = [] } = useQuery<string[]>({
    queryKey: ["config", "groups"],
    queryFn: () => httpClient.get(CONFIG_ENDPOINTS.groups),
    staleTime: 5 * 60 * 1000,
    enabled: open,
  });

  const configType = Form.useWatch("config_type", form) as ConfigType | undefined;
  const rawOptions = Form.useWatch("options", form) as string | undefined;
  const showOptionsEditor = configType === "select" || configType === "switch";

  // config_type changed to "date" while modal is open: convert string → dayjs
  useEffect(() => {
    if (configType !== "date") return;
    const raw = form.getFieldValue("config_value");
    if (raw && typeof raw === "string") {
      form.setFieldValue("config_value", dayjs(raw));
    }
  }, [configType, form]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const type = editing.config_type ?? "input";
      let value = editing.config_value ?? "";

      // storage: bytes → best-fit display
      if (type === "storage" && value) {
        const bytes = Number(value);
        if (!isNaN(bytes)) {
          const { value: v, unit } = bytesToBest(bytes);
          setStorageValue(v);
          setStorageUnit(unit);
        }
      }

      // date: string → dayjs object
      if (type === "date" && value) {
        value = dayjs(value) as unknown as string;
      }

      form.setFieldsValue({
        config_key: editing.config_key,
        config_value: value,
        description: editing.description ?? undefined,
        group: editing.group ?? undefined,
        config_type: type,
        options: editing.options ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldValue("config_type", "input");
      setStorageValue(0);
      setStorageUnit("MB");
    }
    setAddGroupOpen(false);
    setNewGroupName("");
  }, [open, editing, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    const submitValues: CreateConfigRequest = {
      config_key: values.config_key as string,
      config_value: "",
      description: values.description as string | undefined,
      group: values.group as string,
      config_type: values.config_type as ConfigType | undefined,
      options: values.options as string | undefined,
    };
    // storage: convert to bytes string
    if (submitValues.config_type === "storage") {
      submitValues.config_value = String(storageToBytes(storageValue, storageUnit));
    } else {
      // ColorPicker returns { toHexString() }, DatePicker returns dayjs
      const raw = values.config_value;
      if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as { toHexString?: () => string }).toHexString === "function"
      ) {
        submitValues.config_value = (raw as { toHexString: () => string }).toHexString();
      } else if (
        raw &&
        typeof raw === "object" &&
        typeof (raw as { format?: (f?: string) => string }).format === "function"
      ) {
        submitValues.config_value = (raw as { format: (f?: string) => string }).format(
          "YYYY-MM-DD",
        );
      } else {
        submitValues.config_value =
          raw == null ? "" : typeof raw === "string" ? raw : JSON.stringify(raw);
      }
    }
    if (!showOptionsEditor) {
      submitValues.options = undefined;
    }
    onFinish(submitValues);
  };

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    form.setFieldValue("group", name);
    setAddGroupOpen(false);
    setNewGroupName("");
  };

  return (
    <BaseFormModal<CreateConfigRequest>
      open={open}
      title={editing ? t`编辑配置` : t`新增配置`}
      okText={t`确定`}
      cancelText={t`取消`}
      form={form}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onFinish={handleFinish as (values: CreateConfigRequest) => void}
    >
      <Form.Item
        name="config_key"
        label={t`配置键`}
        rules={[{ required: true, message: t`请输入配置键` }]}
      >
        <Input placeholder={t`请输入配置键`} disabled={!!editing} />
      </Form.Item>
      <Form.Item name="group" label={t`分组`} rules={[{ required: true, message: t`请选择分组` }]}>
        <Select
          placeholder={t`请选择分组`}
          showSearch
          options={groups.map((g) => ({ label: g, value: g }))}
          dropdownRender={(menu) => (
            <>
              {menu}
              {addGroupOpen ? (
                <Flex gap={token.marginXS} style={{ padding: token.paddingXXS }}>
                  <Input
                    size="small"
                    placeholder={t`新分组名`}
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onPressEnter={handleAddGroup}
                    style={{ flex: 1 }}
                  />
                  <Button size="small" type="primary" onClick={handleAddGroup}>
                    {t`添加`}
                  </Button>
                  <Button size="small" onClick={() => setAddGroupOpen(false)}>
                    {t`取消`}
                  </Button>
                </Flex>
              ) : (
                <Button
                  type="text"
                  block
                  icon={<Plus size={token.fontSize} />}
                  onClick={() => setAddGroupOpen(true)}
                  style={{ padding: token.paddingXXS }}
                >
                  {t`新增分组`}
                </Button>
              )}
            </>
          )}
        />
      </Form.Item>
      <Form.Item name="config_type" label={t`配置类型`}>
        <Select
          placeholder={t`请选择配置类型`}
          options={CONFIG_TYPES.map((type) => ({
            label: CONFIG_TYPE_LABELS[type],
            value: type,
          }))}
        />
      </Form.Item>
      <Form.Item
        name="config_value"
        label={t`配置值`}
        rules={[{ required: true, message: t`请输入配置值` }]}
      >
        {configType === "number" ? (
          <InputNumber style={{ width: "100%" }} placeholder={t`请输入数字`} />
        ) : configType === "switch" ? (
          <Select
            placeholder={t`请选择`}
            options={parseOptions(rawOptions).map((o) => ({
              label: o.label,
              value: o.value,
            }))}
          />
        ) : configType === "select" ? (
          <Select
            placeholder={t`请选择`}
            options={parseOptions(rawOptions).map((o) => ({
              label: o.label,
              value: o.value,
            }))}
          />
        ) : configType === "textarea" || configType === "json" ? (
          <Input.TextArea rows={4} placeholder={t`请输入`} />
        ) : configType === "color" ? (
          <ColorPicker showText format="hex" />
        ) : configType === "date" ? (
          <DatePicker style={{ width: "100%" }} />
        ) : configType === "storage" ? (
          <>
            <Input style={{ display: "none" }} />
            <StorageInput
              value={storageValue}
              unit={storageUnit}
              onValueChange={setStorageValue}
              onUnitChange={setStorageUnit}
            />
          </>
        ) : (
          <Input placeholder={t`请输入`} />
        )}
      </Form.Item>
      <Form.Item name="options" hidden>
        <Input />
      </Form.Item>
      {showOptionsEditor && (
        <Form.Item label={t`选项配置`}>
          <OptionsEditor form={form} />
        </Form.Item>
      )}
      <Form.Item name="description" label={t`说明`}>
        <Input placeholder={t`请输入说明`} />
      </Form.Item>
    </BaseFormModal>
  );
}

function StorageInput({
  value,
  unit,
  onValueChange,
  onUnitChange,
}: {
  value: number;
  unit: StorageUnit;
  onValueChange: (v: number) => void;
  onUnitChange: (u: StorageUnit) => void;
}) {
  const { t } = useLingui();

  return (
    <Space.Compact style={{ width: "100%" }}>
      <InputNumber
        min={0}
        value={value}
        onChange={(v) => onValueChange(v ?? 0)}
        style={{ width: "60%" }}
        placeholder={t`请输入大小`}
      />
      <Select
        value={unit}
        onChange={(u) => onUnitChange(u)}
        style={{ width: "40%" }}
        options={STORAGE_UNITS.map((u) => ({ label: u, value: u }))}
      />
    </Space.Compact>
  );
}

function OptionsEditor({ form }: { form: FormInstance }) {
  const { t } = useLingui();
  const { token } = theme.useToken();
  const rawOptions = Form.useWatch("options", form) as string | undefined;
  const options = parseOptions(rawOptions);

  const updateOptions = (next: { label: string; value: string }[]) => {
    form.setFieldValue("options", JSON.stringify(next));
  };

  return (
    <Flex vertical gap={token.marginSM} style={{ width: "100%" }}>
      {options.map((opt, idx) => (
        <Space key={idx} align="start" style={{ width: "100%" }}>
          <Input
            placeholder={t`标签`}
            value={opt.label}
            onChange={(e) => {
              const next = [...options];
              next[idx] = { ...next[idx], label: e.target.value };
              updateOptions(next);
            }}
            style={{ width: 140 }}
          />
          <Input
            placeholder={t`值`}
            value={opt.value}
            onChange={(e) => {
              const next = [...options];
              next[idx] = { ...next[idx], value: e.target.value };
              updateOptions(next);
            }}
            style={{ width: 140 }}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 size={token.fontSizeSM} />}
            onClick={() => {
              const next = options.filter((_, i) => i !== idx);
              updateOptions(next);
            }}
          />
        </Space>
      ))}
      <Button
        type="dashed"
        icon={<Plus size={token.fontSize} />}
        onClick={() => updateOptions([...options, { label: "", value: "" }])}
        style={{ alignSelf: "flex-start" }}
      >
        {t`添加选项`}
      </Button>
    </Flex>
  );
}
