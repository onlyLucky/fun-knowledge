import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { theme, Tag, Flex, Button } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import {
  CORRECTION_ENDPOINTS,
  CorrectionStatus,
  CorrectionType,
  CorrectionSchema,
} from "@/api/correction";
import { PaginatedResponseSchema } from "@/api/schemas";
import type { Correction as CorrectionT } from "@/api/correction";
import { z } from "zod/v4";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { DetailDrawer } from "./-DetailDrawer";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  status: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/correction/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: CorrectionPage,
});

const paginatedSchema = PaginatedResponseSchema(CorrectionSchema);

const TYPE_MAP: Record<number, string> = {
  [CorrectionType.FACT_ERROR]: "事实错误",
  [CorrectionType.TYPO]: "错别字",
  [CorrectionType.OUTDATED]: "内容过时",
  [CorrectionType.OTHER]: "其他",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [CorrectionStatus.PENDING]: { label: "待审核", color: "warning" },
  [CorrectionStatus.APPROVED]: { label: "已通过", color: "success" },
  [CorrectionStatus.REJECTED]: { label: "已拒绝", color: "error" },
};

function CorrectionPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { t } = useLingui();
  const { token } = theme.useToken();
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<CorrectionT | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["correction", search.page, search.pageSize, search.status],
    queryFn: () =>
      httpClient.get(CORRECTION_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          status: search.status || undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
  });

  const columns = [
    { title: t`知识标题`, dataIndex: "knowledge_id", key: "knowledge_id", ellipsis: true },
    {
      title: t`类型`,
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: number) => TYPE_MAP[type] ?? String(type),
    },
    { title: t`描述`, dataIndex: "description", key: "description", ellipsis: true },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const s = STATUS_MAP[status] ?? { label: String(status), color: "default" };
        return <Tag color={s.color}>{t`${s.label}`}</Tag>;
      },
    },
    { title: t`创建时间`, dataIndex: "created_at", key: "created_at", width: 180 },
    {
      title: t`操作`,
      key: "actions",
      width: 60,
      align: "right" as const,
      render: (_: unknown, record: CorrectionT) => (
        <Button
          type="text"
          icon={<Eye size={token.fontSize} />}
          onClick={() => {
            setSelected(record);
            setDrawerOpen(true);
          }}
        />
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
            onChange: (page, pageSize) =>
              void navigate({
                search: { ...search, page: pageSize !== search.pageSize ? 1 : page, pageSize },
              }),
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
      <Flex ref={toolbarRowRef} justify="flex-end">
        <Button.Group>
          {[undefined, "0", "1", "2"].map((s) => (
            <Button
              key={s ?? "all"}
              type={search.status === (s ?? "") ? "primary" : "default"}
              loading={isLoading && search.status === (s ?? "")}
              onClick={() => void navigate({ search: { ...search, status: s ?? "", page: 1 } })}
            >
              {s === undefined ? t`全部` : (STATUS_MAP[Number(s)]?.label ?? s)}
            </Button>
          ))}
        </Button.Group>
      </Flex>

      <DataTable<CorrectionT>
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

      <DetailDrawer
        open={drawerOpen}
        correction={selected}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
      />
    </Flex>
  );
}
