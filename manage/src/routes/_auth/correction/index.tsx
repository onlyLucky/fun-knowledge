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
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(10),
  status: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/correction/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: CorrectionPage,
});

const paginatedSchema = PaginatedResponseSchema(CorrectionSchema);

const TYPE_MAP: Record<number, string> = {
  [CorrectionType.FACT_ERROR]: "Fact Error",
  [CorrectionType.TYPO]: "Typo",
  [CorrectionType.OUTDATED]: "Outdated",
  [CorrectionType.OTHER]: "Other",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [CorrectionStatus.PENDING]: { label: "Pending", color: "warning" },
  [CorrectionStatus.APPROVED]: { label: "Approved", color: "success" },
  [CorrectionStatus.REJECTED]: { label: "Rejected", color: "error" },
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
    { title: t`Knowledge`, dataIndex: "knowledge_id", key: "knowledge_id", ellipsis: true },
    {
      title: t`Type`,
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: number) => TYPE_MAP[type] ?? String(type),
    },
    { title: t`Description`, dataIndex: "description", key: "description", ellipsis: true },
    {
      title: t`Status`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const s = STATUS_MAP[status] ?? { label: String(status), color: "default" };
        return <Tag color={s.color}>{t`${s.label}`}</Tag>;
      },
    },
    { title: t`Created`, dataIndex: "created_at", key: "created_at", width: 180 },
    {
      title: t`Actions`,
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
      <Flex ref={toolbarRowRef} justify="flex-end">
        <Button.Group>
          {[undefined, "0", "1", "2"].map((s) => (
            <Button
              key={s ?? "all"}
              type={search.status === (s ?? "") ? "primary" : "default"}
              onClick={() => void navigate({ search: { ...search, status: s ?? "", page: 1 } })}
            >
              {s === undefined ? t`All` : (STATUS_MAP[Number(s)]?.label ?? s)}
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
