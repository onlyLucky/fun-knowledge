import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Avatar, theme, Flex, Switch, App, Button } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { httpClient } from "@/utils/http";
import { USER_ENDPOINTS } from "@/api/user";
import { PaginatedResponseSchema, UserSchema } from "@/api/schemas";
import type { User } from "@/api/schemas";
import { z } from "zod/v4";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { Toolbar } from "./-Toolbar";
import { DetailDrawer } from "./-DetailDrawer";

const UserSearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  sortField: z.string().nullable().catch(null),
  sortOrder: z.enum(["ascend", "descend"]).nullable().catch(null),
  keyword: z.string().catch(""),
  role: z.string().catch(""),
  status: z.string().catch(""),
});

type UserSearch = z.infer<typeof UserSearchParamsSchema>;

export const Route = createFileRoute("/_auth/users/")({
  validateSearch: (search) => UserSearchParamsSchema.parse(search),
  component: UsersPage,
});

const paginatedUserSchema = PaginatedResponseSchema(UserSchema);

function UsersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { t } = useLingui();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);

  const toggleStatus = async (record: User) => {
    setTogglingId(record.id);
    try {
      const nextStatus = record.status === 0 ? 1 : 0;
      await httpClient.put(USER_ENDPOINTS.updateStatus(record.id), { status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t`操作失败`;
      message.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const setSearch = (next: UserSearch) => {
    void navigate({ search: next });
  };

  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({
    search,
    setSearch,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "users",
      search.page,
      search.pageSize,
      search.keyword,
      search.role,
      search.status,
      search.sortField,
      search.sortOrder,
    ],
    queryFn: () =>
      httpClient.get(USER_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          nickname: search.keyword || undefined,
          role: search.role || undefined,
          status: search.status || undefined,
          sortField: search.sortField ?? undefined,
          sortOrder: search.sortOrder ?? undefined,
        },
      }),
    select: (raw) => paginatedUserSchema.shape.data.parse(raw),
  });

  const columns = [
    /* {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: search.sortField === "id" ? search.sortOrder : null,
    }, */
    {
      title: t`用户昵称`,
      dataIndex: "nickname",
      key: "nickname",
      sorter: true,
      sortOrder: search.sortField === "nickname" ? search.sortOrder : null,
      render: (_: unknown, record: User) => {
        const src = (record.avatar ?? "").trim() || undefined;
        return (
          <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
            <Avatar size={24} src={src} shape="circle" style={{ flexShrink: 0 }}>
              {record.nickname?.[0]?.toUpperCase()}
            </Avatar>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.nickname}
            </span>
          </Flex>
        );
      },
    },
    {
      title: t`邮箱`,
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: search.sortField === "email" ? search.sortOrder : null,
    },
    {
      title: t`手机号`,
      dataIndex: "phone",
      key: "phone",
      width: 180,
    },
    {
      title: t`打卡天数`,
      dataIndex: "total_check_in_days",
      key: "total_check_in_days",
      width: 100,
      sorter: true,
      sortOrder: search.sortField === "total_check_in_days" ? search.sortOrder : null,
      render: (val: number | undefined) => val ?? 0,
    },
    {
      title: t`收藏数`,
      dataIndex: "favorites_count",
      key: "favorites_count",
      width: 100,
      sorter: true,
      sortOrder: search.sortField === "favorites_count" ? search.sortOrder : null,
      render: (val: number | undefined) => val ?? 0,
    },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (_: unknown, record: User) => (
        <Switch
          size="small"
          loading={togglingId === record.id}
          disabled={togglingId === record.id}
          checked={record.status === 0}
          onChange={() => toggleStatus(record)}
        />
      ),
    },
    {
      title: t`操作`,
      key: "actions",
      width: 60,
      align: "right" as const,
      render: (_: unknown, record: User) => (
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
      <Toolbar
        ref={toolbarRowRef}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={applyKeyword}
        onClearSearch={() => {
          setKeywordInput("");
          setSearch({ ...search, keyword: "", page: 1 });
        }}
        roleValue={search.role || undefined}
        onRoleChange={(role) =>
          void navigate({
            search: { ...search, role, page: 1 },
          })
        }
        statusValue={search.status || undefined}
        onStatusChange={(status) =>
          void navigate({
            search: { ...search, status, page: 1 },
          })
        }
      />

      <DataTable<User>
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
        onRow={(record) => ({
          onClick: (e) => {
            if ((e.target as HTMLElement).closest(".ant-switch, .ant-btn")) return;
            setSelected(record);
            setDrawerOpen(true);
          },
          style: { cursor: "pointer" },
        })}
        style={{ flex: 1, minHeight: 0 }}
        scroll={tableScrollY != null ? { x: "max-content", y: tableScrollY } : { x: "max-content" }}
        onChange={(_pagination, _filters, sorter) => {
          if (Array.isArray(sorter)) return;
          const nextSortField = sorter.order ? String(sorter.field) : "nickname";
          const nextSortOrder = sorter.order ? sorter.order : "descend";
          void navigate({
            search: {
              ...search,
              sortField: nextSortField,
              sortOrder: nextSortOrder,
            },
          });
        }}
      />

      <DetailDrawer
        open={drawerOpen}
        user={selected}
        onClose={() => {
          setDrawerOpen(false);
          setSelected(null);
        }}
        onStatusChange={(user) => toggleStatus(user)}
      />
    </Flex>
  );
}
