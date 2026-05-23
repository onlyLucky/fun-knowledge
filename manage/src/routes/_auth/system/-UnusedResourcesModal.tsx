import { Modal, List, Image, Button, App, Typography, Flex, Empty, Spin, Popconfirm } from "antd";
import { Trash2, HardDrive } from "lucide-react";
import { useLingui } from "@lingui/react/macro";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { SYSTEM_ENDPOINTS, SystemManageType, StorageStatsDataSchema } from "@/api/system";
import type { StorageStatsData, UnusedResourceItem } from "@/api/system";
import { resolveUrl } from "@/utils/utils";

export type UnusedResourcesModalProps = {
  open: boolean;
  storageType: "knowledge" | "avatar" | null;
  onClose: () => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UnusedResourcesModal({ open, storageType, onClose }: UnusedResourcesModalProps) {
  const { t } = useLingui();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const targetType =
    storageType === "avatar"
      ? SystemManageType.AVATAR_STORAGE_STATS
      : SystemManageType.STORAGE_STATS;

  const { data, isLoading } = useQuery<StorageStatsData>({
    queryKey: ["system-data"],
    queryFn: () => httpClient.get(SYSTEM_ENDPOINTS.data),
    select: (raw) => {
      const resp = raw as {
        groups?: Array<{ key?: string; items?: Array<{ type?: string; data?: unknown }> }>;
      };
      const storageGroup = resp.groups?.find((g) => g.key === "storage");
      const statsItem = storageGroup?.items?.find((i) => i.type === targetType)?.data;
      return StorageStatsDataSchema.parse(statsItem);
    },
    enabled: open,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: (item: UnusedResourceItem) =>
      httpClient.delete(SYSTEM_ENDPOINTS.deleteResource(item.path)),
    onSuccess: () => {
      message.success(t`资源已删除`);
      void queryClient.invalidateQueries({ queryKey: ["system-data"] });
    },
    onError: (err: Error) => message.error(err.message || t`删除失败`),
  });

  const unusedItems = data?.unused_items ?? [];
  const unusedSize = data?.unused_size ?? 0;

  return (
    <Modal title={t`未使用资源`} open={open} onCancel={onClose} footer={null} width={640}>
      {isLoading ? (
        <Flex justify="center" align="center" style={{ padding: 40 }}>
          <Spin />
        </Flex>
      ) : unusedItems.length === 0 ? (
        <Empty description={t`暂无未使用的资源`} />
      ) : (
        <>
          <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
            <Typography.Text type="secondary">
              <HardDrive size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
              {t`共 ${unusedItems.length} 个文件，占用 ${formatSize(unusedSize)}`}
            </Typography.Text>
          </Flex>
          <List
            dataSource={unusedItems}
            style={{ maxHeight: 400, overflow: "auto" }}
            renderItem={(item: UnusedResourceItem) => (
              <List.Item
                key={item.path}
                actions={[
                  <Popconfirm
                    key="delete"
                    title={t`确定删除该资源？`}
                    description={item.filename}
                    onConfirm={() => deleteMutation.mutate(item)}
                    okText={t`删除`}
                    cancelText={t`取消`}
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 size={14} />}
                      loading={deleteMutation.isPending}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.path.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i) ? (
                      <Image
                        src={resolveUrl(item.path)}
                        width={48}
                        height={48}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        preview={{ src: resolveUrl(item.path) }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 4,
                          background: "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#999",
                        }}
                      >
                        {item.path.split(".").pop()?.toUpperCase()}
                      </div>
                    )
                  }
                  title={
                    <Typography.Text ellipsis style={{ maxWidth: 320 }}>
                      {item.filename}
                    </Typography.Text>
                  }
                  description={
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {formatSize(item.size)} &middot;{" "}
                      {new Date(item.modified_at).toLocaleString("zh-CN")}
                    </Typography.Text>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </Modal>
  );
}
