import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, App, theme, Tag, Flex, Descriptions, Drawer, Dropdown } from "antd";
import type { Key, TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { httpClient } from "@/utils/http";
import { LOG_ENDPOINTS, OperationLogSchema } from "@/api/log";
import { PaginatedResponseSchema } from "@/api/schemas";
import type { OperationLog } from "@/api/log";
import { AdminRole } from "@/api/schemas";
import { useAuthStore } from "@/stores/auth";
import { z } from "zod/v4";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  module: z.string().catch(""),
  action: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/logs/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: LogsPage,
});

const paginatedSchema = PaginatedResponseSchema(OperationLogSchema);

function LogsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { message, modal } = App.useApp();
  const { t } = useLingui();
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  const canDelete = admin?.role === AdminRole.SUPER_ADMIN;
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [detailRecord, setDetailRecord] = useState<OperationLog | null>(null);

  const queryKey = ["logs", search.page, search.pageSize, search.module, search.action] as const;

  const correctPageAfterDelete = () => {
    const currentData = queryClient.getQueryData<{
      list: OperationLog[];
      total: number;
    }>([...queryKey]);
    if (currentData && currentData.list.length === 0 && search.page > 1) {
      void navigate({ search: { ...search, page: search.page - 1 } });
    }
  };

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      httpClient.get(LOG_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          module: search.module || undefined,
          action: search.action || undefined,
        },
      }),
    select: (raw) => {
      const envelope = raw as { list?: unknown[]; total?: number };
      const normalized = {
        ...envelope,
        list: (envelope.list ?? []).map((item) => {
          const r = item as Record<string, unknown>;
          return { ...r, id: r.id ?? r._id };
        }),
      };
      return paginatedSchema.shape.data.parse(normalized);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(LOG_ENDPOINTS.delete(id)),
    onSuccess: async () => {
      message.success(t`删除成功`);
      await queryClient.invalidateQueries({ queryKey: ["logs"] });
      correctPageAfterDelete();
    },
    onError: (err: Error) => message.error(err.message || t`删除失败`),
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => httpClient.delete(LOG_ENDPOINTS.batchDelete, { ids }),
    onSuccess: async () => {
      message.success(t`删除成功`);
      setSelectedRowKeys([]);
      await queryClient.invalidateQueries({ queryKey: ["logs"] });
      correctPageAfterDelete();
    },
    onError: (err: Error) => message.error(err.message || t`删除失败`),
  });

  const confirmDelete = (record: OperationLog) => {
    modal.confirm({
      title: t`确定要删除吗？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const confirmBatchDelete = () => {
    modal.confirm({
      title: t`确定删除选中的 ${selectedRowKeys.length} 条记录？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => batchDeleteMutation.mutate(selectedRowKeys as string[]),
    });
  };

  const columns = [
    { title: t`管理员`, dataIndex: "admin_username", key: "admin_username", width: 120 },
    {
      title: t`模块`,
      dataIndex: "module",
      key: "module",
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: t`操作类型`, dataIndex: "action", key: "action", width: 120 },
    { title: t`操作描述`, dataIndex: "description", key: "description", ellipsis: true },
    { title: t`IP地址`, dataIndex: "ip", key: "ip", width: 140 },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "error"}>{status === 1 ? "OK" : "FAIL"}</Tag>
      ),
    },
    {
      title: t`耗时`,
      dataIndex: "duration",
      key: "duration",
      width: 80,
      render: (v: number | null) => (v != null ? `${v}ms` : "—"),
    },
    { title: t`操作时间`, dataIndex: "created_at", key: "created_at", width: 180 },
    {
      title: t`操作`,
      key: "actions",
      width: 80,
      align: "right" as const,
      render: (_: unknown, record: OperationLog) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "detail",
                icon: <Eye size={token.fontSize} />,
                label: t`查看详情`,
                onClick: () => setDetailRecord(record),
              },
              ...(canDelete
                ? [
                    {
                      key: "delete",
                      icon: <Trash2 size={token.fontSize} />,
                      label: t`删除`,
                      danger: true,
                      onClick: () => confirmDelete(record),
                    },
                  ]
                : []),
            ],
          }}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreVertical size={token.fontSize} />}
            aria-label={t`行操作`}
          />
        </Dropdown>
      ),
    },
  ];

  const showPagination = true;

  const { tableAreaMaxHeight, tableScrollY, lockScrollHeight } = useTableFitHeight({
    pageShellRef,
    toolbarRef: toolbarRowRef,
    middleRef: middleSectionRef,
    tableFrameRef,
    marginLG: token.marginLG,
    rowCount: data?.list?.length ?? 0,
    isLoading,
    showPagination,
  });

  const tablePagination: false | TablePaginationConfig = useMemo(
    () =>
      showPagination
        ? {
            total: data?.total ?? 0,
            current: search.page,
            pageSize: search.pageSize,
            showSizeChanger: true,
            showTotal: (total) => t`${total} 条记录`,
          }
        : false,
    [showPagination, data?.total, search.page, search.pageSize, t],
  );

  return (
    <Flex
      ref={pageShellRef}
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <div ref={toolbarRowRef}>
        {canDelete && selectedRowKeys.length > 0 && (
          <Flex justify="flex-end" style={{ marginBottom: token.marginSM }}>
            <Button
              danger
              icon={<Trash2 size={token.fontSize} />}
              onClick={confirmBatchDelete}
              loading={batchDeleteMutation.isPending}
            >
              {t`批量删除`} ({selectedRowKeys.length})
            </Button>
          </Flex>
        )}
      </div>

      <DataTable<OperationLog>
        layoutRef={middleSectionRef}
        frameRef={tableFrameRef}
        lockScrollHeight={lockScrollHeight}
        maxHeight={tableAreaMaxHeight}
        frameHeight={
          tableScrollY != null && tableAreaMaxHeight != null ? tableAreaMaxHeight : undefined
        }
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data?.list ?? []}
        loading={isLoading}
        pagination={tablePagination}
        rowSelection={
          canDelete
            ? {
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
              }
            : undefined
        }
        style={{ flex: 1, minHeight: 0 }}
        scroll={tableScrollY != null ? { x: "max-content", y: tableScrollY } : { x: "max-content" }}
        onChange={(pagination, _filters, _sorter) => {
          setSelectedRowKeys([]);
          void navigate({
            search: {
              ...search,
              page: pagination.current ?? 1,
              pageSize: pagination.pageSize ?? 10,
            },
          });
        }}
      />

      <Drawer
        title={t`操作日志详情`}
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        width={520}
      >
        {detailRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={t`管理员`}>{detailRecord.admin_username}</Descriptions.Item>
            <Descriptions.Item label={t`模块`}>{detailRecord.module}</Descriptions.Item>
            <Descriptions.Item label={t`操作类型`}>{detailRecord.action}</Descriptions.Item>
            <Descriptions.Item label={t`操作描述`}>
              {detailRecord.description ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t`目标ID`}>{detailRecord.target_id ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t`IP地址`}>{detailRecord.ip ?? "—"}</Descriptions.Item>
            <Descriptions.Item label={t`状态`}>
              <Tag color={detailRecord.status === 1 ? "success" : "error"}>
                {detailRecord.status === 1 ? "OK" : "FAIL"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t`耗时`}>
              {detailRecord.duration != null ? `${detailRecord.duration}ms` : "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t`错误信息`}>
              {detailRecord.error_message ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label={t`操作时间`}>
              {detailRecord.created_at ?? "—"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </Flex>
  );
}
