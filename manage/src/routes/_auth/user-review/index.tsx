import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, App, Tag, Avatar, Space, Input, Select, Flex, theme } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search } from "lucide-react";
import { httpClient } from "@/utils/http";
import { resolveUrl } from "@/utils/utils";
import {
  USER_REVIEW_ENDPOINTS,
  USER_REVIEW_STATUS,
  USER_REVIEW_STATUS_LABELS,
  USER_REVIEW_STATUS_COLORS,
  UserReviewSchema,
  ReviewUserReviewRequestSchema,
} from "@/api/user-review";
import type { UserReview, UserReviewStatus } from "@/api/user-review";
import { PaginatedResponseSchema } from "@/api/schemas";
import { z } from "zod/v4";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { DetailDrawer } from "./-DetailDrawer";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  status: z.coerce.number().optional(),
  keyword: z.string().catch(""),
});

type Search = z.infer<typeof SearchParamsSchema>;

export const Route = createFileRoute("/_auth/user-review/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: UserReviewPage,
});

const paginatedSchema = PaginatedResponseSchema(UserReviewSchema);

function UserReviewPage() {
  const { message } = App.useApp();
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<UserReview | null>(null);

  const setSearch = (next: Search) => void navigate({ search: next });

  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({
    search,
    setSearch,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["user-review", search.page, search.pageSize, search.status, search.keyword],
    queryFn: () =>
      httpClient.get(USER_REVIEW_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          status: search.status,
          keyword: search.keyword || undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: { status: number; review_remark?: string };
    }) =>
      httpClient.put(USER_REVIEW_ENDPOINTS.review(id), ReviewUserReviewRequestSchema.parse(values)),
    onSuccess: () => {
      message.success(t`审核成功`);
      setDrawerOpen(false);
      setSelected(null);
      void queryClient.invalidateQueries({ queryKey: ["user-review"] });
    },
    onError: (err: Error) => message.error(err.message || t`审核失败`),
  });

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

  const columns = [
    {
      title: t`用户`,
      key: "user",
      width: 200,
      render: (_: unknown, record: UserReview) => (
        <Space>
          <Avatar src={resolveUrl(record.user?.avatar ?? "") || undefined} size="small">
            {record.user?.nickname?.[0]}
          </Avatar>
          <span>{record.user?.nickname || "-"}</span>
        </Space>
      ),
    },
    {
      title: t`审核类型`,
      key: "review_type",
      width: 200,
      render: (_: unknown, record: UserReview) => {
        const types: Array<{ label: string; color: string }> = [];
        if (record.nickname) types.push({ label: t`昵称`, color: "blue" });
        if (record.avatar) types.push({ label: t`头像`, color: "green" });
        if (record.signature) types.push({ label: t`签名`, color: "orange" });
        return types.length > 0 ? (
          <Space size={4}>
            {types.map((item) => (
              <Tag key={item.label} color={item.color}>
                {item.label}
              </Tag>
            ))}
          </Space>
        ) : (
          "-"
        );
      },
    },
    {
      title: t`审核状态`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: UserReviewStatus) => (
        <Tag color={USER_REVIEW_STATUS_COLORS[status]}>{USER_REVIEW_STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: t`提交时间`,
      dataIndex: "created_at",
      key: "created_at",
      width: 180,
      render: (time: string) => new Date(time).toLocaleString("zh-CN"),
    },
    {
      title: t`操作`,
      key: "action",
      width: 60,
      align: "right" as const,
      render: (_: unknown, record: UserReview) => (
        <Button
          type="text"
          icon={<Eye size={token.fontSize} />}
          onClick={(e) => {
            e.stopPropagation();
            setSelected(record);
            setDrawerOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <Flex
      ref={pageShellRef}
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <Flex ref={toolbarRowRef} justify="flex-start" align="center">
        <Space>
          <Input
            placeholder={t`搜索用户昵称`}
            prefix={<Search size={token.fontSizeSM} />}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onPressEnter={() => applyKeyword(keywordInput)}
            allowClear
            onClear={() => {
              setKeywordInput("");
              setSearch({ ...search, keyword: "", page: 1 });
            }}
            style={{ width: 200 }}
          />
          <Select
            placeholder={t`审核状态`}
            value={search.status}
            onChange={(value) => void navigate({ search: { ...search, status: value, page: 1 } })}
            allowClear
            style={{ width: 120 }}
            options={[
              { label: t`待审核`, value: USER_REVIEW_STATUS.PENDING },
              { label: t`已通过`, value: USER_REVIEW_STATUS.APPROVED },
              { label: t`已驳回`, value: USER_REVIEW_STATUS.REJECTED },
            ]}
          />
        </Space>
      </Flex>

      <DataTable<UserReview>
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
        onRow={(record) => ({
          onClick: (e) => {
            if ((e.target as HTMLElement).closest(".ant-btn")) return;
            setSelected(record);
            setDrawerOpen(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      <DetailDrawer
        open={drawerOpen}
        review={selected}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        onReview={(values) => {
          if (selected) {
            reviewMutation.mutate({ id: selected.id, values });
          }
        }}
        reviewLoading={reviewMutation.isPending}
      />
    </Flex>
  );
}
