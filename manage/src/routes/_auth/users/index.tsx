import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Avatar, Space, theme, Tag, Flex } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { USER_ENDPOINTS } from "@/api/user";
import { PaginatedResponseSchema, UserSchema } from "@/api/schemas";
import type { User } from "@/api/schemas";
import { z } from "zod/v4";
import { DataTable } from "@/components/DataTable";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { Toolbar } from "./-Toolbar";

const UserSearchParamsSchema = z.object({
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(10),
  sortField: z.string().nullable().catch(null),
  sortOrder: z.enum(["ascend", "descend"]).nullable().catch(null),
  keyword: z.string().catch(""),
  role: z.string().catch(""),
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
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);

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
      search.sortField,
      search.sortOrder,
    ],
    queryFn: () =>
      httpClient.get(USER_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          keyword: search.keyword || undefined,
          role: search.role || undefined,
          sortField: search.sortField ?? undefined,
          sortOrder: search.sortOrder ?? undefined,
        },
      }),
    select: (raw) => paginatedUserSchema.shape.data.parse(raw),
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      sortOrder: search.sortField === "id" ? search.sortOrder : null,
    },
    {
      title: t`Username`,
      dataIndex: "username",
      key: "username",
      sorter: true,
      sortOrder: search.sortField === "username" ? search.sortOrder : null,
      render: (_: unknown, record: User) => {
        const src = (record.avatar ?? "").trim() || undefined;
        return (
          <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
            <Avatar size={24} src={src} shape="circle" style={{ flexShrink: 0 }}>
              {record.username?.[0]?.toUpperCase()}
            </Avatar>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.username}
            </span>
          </Flex>
        );
      },
    },
    {
      title: t`Email`,
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: search.sortField === "email" ? search.sortOrder : null,
    },
    {
      title: t`Roles`,
      dataIndex: "roles",
      key: "roles",
      sorter: true,
      sortOrder: search.sortField === "roles" ? search.sortOrder : null,
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map((role) => (
            <Tag
              key={role}
              variant="outlined"
              styles={{
                root: {
                  borderRadius: 9999,
                  background: "transparent",
                  boxShadow: "none",
                },
              }}
            >
              {role}
            </Tag>
          ))}
        </Space>
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
            onChange: (page, pageSize) => {
              void navigate({
                search: { ...search, page, pageSize },
              });
            },
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
        style={{ flex: 1, minHeight: 0 }}
        scroll={tableScrollY != null ? { x: "max-content", y: tableScrollY } : { x: "max-content" }}
        onChange={(_pagination, _filters, sorter) => {
          if (Array.isArray(sorter)) return;
          const nextSortField = sorter.order ? String(sorter.field) : "username";
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
    </Flex>
  );
}
