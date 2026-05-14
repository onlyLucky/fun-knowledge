import { createFileRoute } from "@tanstack/react-router";
import { Button, Form, App, Tag, theme, Flex, Tabs, Card, Empty, Spin, Typography } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { httpClient } from "@/utils/http";
import {
  CONFIG_ENDPOINTS,
  CONFIG_TYPE_LABELS,
  SystemConfigSchema,
  CreateConfigRequestSchema,
} from "@/api/config";
import type { SystemConfig, CreateConfigRequest } from "@/api/config";
import { z } from "zod/v4";
import { FormModal } from "./-FormModal";

const SearchParamsSchema = z.object({});

export const Route = createFileRoute("/_auth/config/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: ConfigPage,
});

function ConfigPage() {
  const { message, modal } = App.useApp();
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SystemConfig | null>(null);
  const [form] = Form.useForm();
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: rawList = [], isLoading } = useQuery<SystemConfig[]>({
    queryKey: ["config"],
    queryFn: () => httpClient.get(CONFIG_ENDPOINTS.list),
    select: (raw) => SystemConfigSchema.array().parse(raw),
  });

  const grouped = useMemo(() => {
    const map = new Map<string, SystemConfig[]>();
    for (const item of rawList) {
      const g = item.group ?? "General";
      const arr = map.get(g);
      if (arr) arr.push(item);
      else map.set(g, [item]);
    }
    return map;
  }, [rawList]);

  const tabItems = useMemo(
    () =>
      [...grouped.entries()].map(([group, items]) => ({
        key: group,
        label: `${group} (${items.length})`,
        children: (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: token.marginMD,
            }}
          >
            {items.map((item) => (
              <ConfigCard
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditing(item);
                  setModalOpen(true);
                }}
                onDelete={() => confirmDelete(item)}
              />
            ))}
          </div>
        ),
      })),
    [grouped, token.marginMD, form],
  );

  const createMutation = useMutation({
    mutationFn: (values: CreateConfigRequest) =>
      httpClient.post(CONFIG_ENDPOINTS.create, CreateConfigRequestSchema.parse(values)),
    onSuccess: () => {
      message.success(t`创建成功`);
      setModalOpen(false);
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err: Error) => message.error(err.message || t`创建失败`),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CreateConfigRequest) => httpClient.put(CONFIG_ENDPOINTS.update, values),
    onSuccess: () => {
      message.success(t`更新成功`);
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err: Error) => message.error(err.message || t`更新失败`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(CONFIG_ENDPOINTS.delete(id)),
    onSuccess: () => {
      message.success(t`删除成功`);
      void queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err: Error) => message.error(err.message || t`删除失败`),
  });

  const confirmDelete = (record: SystemConfig) => {
    modal.confirm({
      title: t`确定要删除吗？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  return (
    <Flex
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <Flex justify="flex-end" style={{ flexShrink: 0 }}>
        <Button
          type="primary"
          icon={<Plus size={token.fontSize} />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          {t`新增配置`}
        </Button>
      </Flex>

      <div
        ref={containerRef}
        style={{
          flex: "1 1 0%",
          minHeight: 0,
          overflowY: "auto",
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          padding: token.paddingMD,
        }}
      >
        <Spin spinning={isLoading}>
          {tabItems.length > 0 ? (
            <Tabs items={tabItems} destroyInactiveTabPane={false} />
          ) : (
            !isLoading && <Empty description={t`暂无配置`} />
          )}
        </Spin>
      </div>

      <FormModal
        open={modalOpen}
        editing={editing}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onFinish={(values) => {
          if (editing) {
            updateMutation.mutate(values);
          } else {
            createMutation.mutate(values);
          }
        }}
      />
    </Flex>
  );
}

/* ---- storage display ---- */

const STORAGE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const UNIT_BYTES: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

function formatStorage(bytes: number): string {
  if (bytes <= 0) return "0 B";
  let best = "B";
  let bestVal = bytes;
  for (const u of STORAGE_UNITS) {
    const v = bytes / UNIT_BYTES[u];
    if (v >= 1) {
      best = u;
      bestVal = v;
    }
  }
  const display = bestVal % 1 === 0 ? String(bestVal) : bestVal.toFixed(2);
  return `${display} ${best}`;
}

function formatConfigValue(item: SystemConfig): string {
  if (item.config_type === "storage" && item.config_value) {
    const bytes = Number(item.config_value);
    if (!isNaN(bytes)) return formatStorage(bytes);
  }
  return item.config_value || "—";
}

function ConfigCard({
  item,
  onEdit,
  onDelete,
}: {
  item: SystemConfig;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      size="small"
      styles={{
        body: { padding: token.paddingSM },
      }}
      extra={
        <Flex gap={token.marginXS} align="center">
          <Button
            type="text"
            size="small"
            icon={<Pencil size={token.fontSizeSM} />}
            onClick={onEdit}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<Trash2 size={token.fontSizeSM} />}
            onClick={onDelete}
          />
        </Flex>
      }
      title={
        <Typography.Text
          strong
          ellipsis={{ tooltip: item.config_key }}
          style={{ fontSize: token.fontSizeSM, maxWidth: 180 }}
        >
          {item.config_key}
        </Typography.Text>
      }
    >
      <Flex vertical gap={token.marginXXS}>
        <Flex align="center" gap={token.marginXS}>
          <Typography.Text
            ellipsis={{ tooltip: formatConfigValue(item) }}
            style={{ color: token.colorText }}
          >
            {formatConfigValue(item)}
          </Typography.Text>
          {item.config_type && item.config_type !== "input" && (
            <Tag style={{ marginRight: 0 }}>{CONFIG_TYPE_LABELS[item.config_type]}</Tag>
          )}
        </Flex>
        {item.description && (
          <Typography.Text
            type="secondary"
            ellipsis={{ tooltip: item.description }}
            style={{ fontSize: token.fontSizeSM }}
          >
            {item.description}
          </Typography.Text>
        )}
      </Flex>
    </Card>
  );
}
