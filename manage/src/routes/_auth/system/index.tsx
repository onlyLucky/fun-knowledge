import { createFileRoute } from "@tanstack/react-router";
import {
  App,
  theme,
  Flex,
  Tabs,
  Card,
  Empty,
  Spin,
  Typography,
  Button,
  Progress,
  Statistic,
  Divider,
} from "antd";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, Eye } from "lucide-react";
import { httpClient } from "@/utils/http";
import { formatStorage } from "@/utils/utils";
import {
  SYSTEM_ENDPOINTS,
  SystemManageType,
  SystemDataResponseSchema,
  StorageStatsDataSchema,
  CleanResultDataSchema,
} from "@/api/system";
import type { SystemDataGroup, StorageStatsData } from "@/api/system";
import { z } from "zod/v4";
import { UnusedResourcesModal } from "./-UnusedResourcesModal";

const SearchParamsSchema = z.object({});

export const Route = createFileRoute("/_auth/system/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: SystemPage,
});

function SystemPage() {
  const { message, modal } = App.useApp();
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [unusedResourcesOpen, setUnusedResourcesOpen] = useState(false);

  const { data: systemData, isLoading } = useQuery({
    queryKey: ["system-data"],
    queryFn: () => httpClient.get(SYSTEM_ENDPOINTS.data),
    select: (raw) => SystemDataResponseSchema.parse(raw),
  });

  const cleanMutation = useMutation({
    mutationFn: () =>
      httpClient.post(SYSTEM_ENDPOINTS.action, {
        type: SystemManageType.STORAGE_CLEAN,
      }),
    onSuccess: (raw) => {
      const result = CleanResultDataSchema.parse(raw);
      message.success(
        t`清理完成：删除 ${result.deleted_count} 个文件，释放 ${formatStorage(result.freed_size)}`,
      );
      void queryClient.invalidateQueries({ queryKey: ["system-data"] });
    },
    onError: (err: Error) => message.error(err.message || t`清理失败`),
  });

  const confirmClean = () => {
    modal.confirm({
      title: t`确定要清理未使用的资源吗？`,
      content: t`此操作将删除所有未被知识卡片引用的上传文件，不可撤销。`,
      okText: t`清理`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => cleanMutation.mutate(),
    });
  };

  const tabItems = useMemo(() => {
    if (!systemData) return [];
    return systemData.groups.map((group: SystemDataGroup) => {
      const storageItem = group.items.find((i) => i.type === SystemManageType.STORAGE_STATS);
      const otherItems = group.items.filter((i) => i.type !== SystemManageType.STORAGE_STATS);

      return {
        key: group.key,
        label: group.label,
        children: (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: token.marginMD,
            }}
          >
            {storageItem && (
              <StorageCard
                stats={StorageStatsDataSchema.parse(storageItem.data)}
                onClean={confirmClean}
                cleanLoading={cleanMutation.isPending}
                onViewUnused={() => setUnusedResourcesOpen(true)}
              />
            )}
            {otherItems.map((item) => (
              <Card
                key={item.type}
                size="small"
                styles={{ body: { padding: token.paddingSM } }}
                title={
                  <Typography.Text
                    strong
                    ellipsis={{ tooltip: item.label }}
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {item.label}
                  </Typography.Text>
                }
              >
                <Typography.Text type="secondary">{t`未知数据类型`}</Typography.Text>
              </Card>
            ))}
          </div>
        ),
      };
    });
  }, [systemData, token, cleanMutation.isPending]);

  return (
    <Flex
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <div
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
            !isLoading && <Empty description={t`暂无数据`} />
          )}
        </Spin>
      </div>

      <UnusedResourcesModal
        open={unusedResourcesOpen}
        onClose={() => setUnusedResourcesOpen(false)}
      />
    </Flex>
  );
}

/* ---- 存储统计卡片 ---- */

function StorageCard({
  stats,
  onClean,
  cleanLoading,
  onViewUnused,
}: {
  stats: StorageStatsData;
  onClean: () => void;
  cleanLoading: boolean;
  onViewUnused: () => void;
}) {
  const { t } = useLingui();
  const { token } = theme.useToken();
  const usedPercent =
    stats.total_size > 0 ? Math.round((stats.used_size / stats.total_size) * 100) : 0;

  return (
    <Card
      size="small"
      styles={{ body: { padding: token.paddingSM } }}
      title={
        <Typography.Text
          strong
          ellipsis={{ tooltip: t`知识卡片存储` }}
          style={{ fontSize: token.fontSizeSM }}
        >
          {t`知识卡片存储`}
        </Typography.Text>
      }
    >
      <Flex vertical gap={token.marginSM}>
        <Flex justify="space-between">
          <Statistic title={t`总文件数`} value={stats.total_files} />
          <Statistic
            title={t`总大小`}
            style={{ textAlign: "right" }}
            value={formatStorage(stats.total_size)}
          />
        </Flex>
        <Flex justify="space-between">
          <Statistic
            title={t`已引用`}
            value={stats.used_files}
            suffix={`/ ${formatStorage(stats.used_size)}`}
          />
          <Statistic
            title={t`未引用`}
            value={stats.unused_files}
            suffix={`/ ${formatStorage(stats.unused_size)}`}
            valueStyle={{ color: stats.unused_files > 0 ? token.colorWarning : undefined }}
            style={{ textAlign: "right" }}
          />
        </Flex>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {t`使用率`}
          </Typography.Text>
          <Progress percent={usedPercent} size="small" />
        </div>

        {stats.types.length > 0 && (
          <>
            <Divider style={{ margin: 0 }} />
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {t`按类型分布`}
              </Typography.Text>
              {stats.types.map((item) => (
                <Flex key={item.type} justify="space-between" align="center">
                  <Typography.Text>{item.type}</Typography.Text>
                  <Typography.Text type="secondary">
                    {item.count} {t`个`} / {formatStorage(item.size)}（
                    {stats.total_size > 0 ? ((item.size / stats.total_size) * 100).toFixed(1) : 0}
                    %）
                  </Typography.Text>
                </Flex>
              ))}
            </Flex>
          </>
        )}

        {stats.unused_files > 0 && (
          <>
            <Divider style={{ margin: 0 }} />
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                {t`未使用资源`}
              </Typography.Text>
              <Flex justify="space-between" align="center">
                <Typography.Text>
                  {stats.unused_files} {t`个文件`}
                </Typography.Text>
                <Typography.Text type="warning">{formatStorage(stats.unused_size)}</Typography.Text>
              </Flex>
            </Flex>
          </>
        )}

        {stats.unused_files === 0 && (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {t`所有资源均已被引用`}
          </Typography.Text>
        )}

        <Flex gap={token.marginSM}>
          <Button
            block
            icon={<Eye size={token.fontSize} />}
            disabled={stats.unused_files === 0}
            onClick={onViewUnused}
          >
            {t`查看未使用资源`}
          </Button>
          <Button
            danger
            block
            icon={<Trash2 size={token.fontSize} />}
            loading={cleanLoading}
            disabled={stats.unused_files === 0}
            onClick={onClean}
          >
            {t`清理未使用资源`}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
