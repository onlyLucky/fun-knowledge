import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { theme, Tag, Flex } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { LOG_ENDPOINTS, OperationLogSchema } from "@/api/log";
import { PaginatedResponseSchema } from "@/api/schemas";
import type { OperationLog } from "@/api/log";
import { z } from "zod/v4";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";

const SearchParamsSchema = z.object({
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(10),
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
  const { t } = useLingui();
  const { token } = theme.useToken();
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["logs", search.page, search.pageSize, search.module, search.action],
    queryFn: () =>
      httpClient.get(LOG_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          module: search.module || undefined,
          action: search.action || undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
  });

  const columns = [
    { title: t`Admin`, dataIndex: "admin_username", key: "admin_username", width: 120 },
    {
      title: t`Module`,
      dataIndex: "module",
      key: "module",
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    { title: t`Action`, dataIndex: "action", key: "action", width: 120 },
    { title: t`Description`, dataIndex: "description", key: "description", ellipsis: true },
    { title: t`IP`, dataIndex: "ip", key: "ip", width: 140 },
    {
      title: t`Status`,
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "error"}>{status === 1 ? "OK" : "FAIL"}</Tag>
      ),
    },
    {
      title: t`Duration`,
      dataIndex: "duration",
      key: "duration",
      width: 80,
      render: (v: number | null) => (v != null ? `${v}ms` : "—"),
    },
    { title: t`Time`, dataIndex: "created_at", key: "created_at", width: 180 },
  ];

  const showPagination = (data?.total ?? 0) > search.pageSize;

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
            showTotal: (total) => t`${total} rows`,
            onChange: (page, pageSize) => void navigate({ search: { ...search, page, pageSize } }),
          }
        : false,
    [showPagination, data?.total, search, navigate, t],
  );

  return (
    <Flex
      ref={pageShellRef}
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <div ref={toolbarRowRef} />

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
        style={{ flex: 1, minHeight: 0 }}
        scroll={tableScrollY != null ? { x: "max-content", y: tableScrollY } : { x: "max-content" }}
      />
    </Flex>
  );
}
