import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex, Switch, Input } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { ADMIN_ENDPOINTS, AdminItemSchema, CreateAdminRequestSchema } from "@/api/admin";
import { PaginatedResponseSchema, AdminRole } from "@/api/schemas";
import type { AdminItem, CreateAdminRequest } from "@/api/admin";
import { useAuthStore } from "@/stores/auth";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { z } from "zod/v4";
import { MoreVertical, Pencil, Plus, Search } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useResourceCRUD, type ResourceListData } from "@/hooks/useResourceCRUD";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { FormModal } from "./-FormModal";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  keyword: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/admin/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: AdminPage,
});

const paginatedSchema = PaginatedResponseSchema(AdminItemSchema);

const ROLE_MAP: Record<number, string> = {
  [AdminRole.SUPER_ADMIN]: "Super Admin",
  [AdminRole.CONTENT_ADMIN]: "Content Admin",
  [AdminRole.OPERATIONS]: "Operations",
  [AdminRole.REVIEWER]: "Reviewer",
};

function AdminPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { message } = App.useApp();
  const { t } = useLingui();
  const { token } = theme.useToken();
  const queryClient = useQueryClient();
  const admin = useAuthStore((s) => s.admin);
  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;
  const [modalOpen, setModalOpen] = useState(false);
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const setSearch = (next: typeof search) => void navigate({ search: next });
  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({ search, setSearch });

  const toggleStatus = async (record: AdminItem) => {
    setTogglingId(record.id);
    try {
      const nextStatus = record.status === 0 ? 1 : 0;
      await httpClient.put(ADMIN_ENDPOINTS.updateStatus(record.id), { status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t`操作失败`;
      message.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const crudToasts = useCrudToasts({ message, resourceKey: "admin" });

  const { data, isLoading, createMutation, updateMutation } = useResourceCRUD<
    ResourceListData<AdminItem>,
    CreateAdminRequest,
    CreateAdminRequest & { id: string }
  >({
    queryKey: ["admin", search.page, search.pageSize, search.keyword],
    queryFn: () =>
      httpClient.get(ADMIN_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          username: search.keyword || undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
    createFn: (values) =>
      httpClient.post(ADMIN_ENDPOINTS.create, CreateAdminRequestSchema.parse(values)),
    updateFn: ({ id, ...values }) => httpClient.put(ADMIN_ENDPOINTS.update(id), values),
    deleteFn: async () => {}, // 服务端无 DELETE 端点
    optimistic: { update: true },
    createLifecycle: {
      onSuccess: (values) => {
        crudToasts.createLifecycle?.onSuccess?.(values);
        setModalOpen(false);
        form.resetFields();
      },
      onError: crudToasts.createLifecycle?.onError,
    },
    updateLifecycle: {
      onMutate: crudToasts.updateLifecycle?.onMutate,
      onSuccess: (values) => {
        crudToasts.updateLifecycle?.onSuccess?.(values);
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
      },
      onError: crudToasts.updateLifecycle?.onError,
    },
  });

  const columns = [
    { title: t`用户名`, dataIndex: "username", key: "username" },
    { title: t`真实姓名`, dataIndex: "real_name", key: "real_name" },
    {
      title: t`角色`,
      dataIndex: "role",
      key: "role",
      width: 140,
      render: (role: number) => <Tag>{ROLE_MAP[role] ?? String(role)}</Tag>,
    },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (_: unknown, record: AdminItem) => (
        <Switch
          size="small"
          loading={togglingId === record.id}
          disabled={togglingId === record.id || !isSuperAdmin}
          checked={record.status === 0}
          onChange={() => toggleStatus(record)}
        />
      ),
    },
    { title: t`最后登录`, dataIndex: "last_login_time", key: "last_login_time", width: 180 },
    ...(isSuperAdmin
      ? [
          {
            title: t`操作`,
            key: "actions",
            width: 60,
            align: "right" as const,
            render: (_: unknown, record: AdminItem) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      icon: <Pencil size={token.fontSize} />,
                      label: t`编辑`,
                      onClick: () => {
                        setEditing(record);
                        form.setFieldsValue(record);
                        setModalOpen(true);
                      },
                    },
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
        ]
      : []),
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
      <Flex ref={toolbarRowRef} justify="space-between" align="center">
        <Input
          placeholder={t`搜索用户名`}
          prefix={<Search size={token.fontSize} />}
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onPressEnter={() => applyKeyword(keywordInput)}
          allowClear
          onClear={() => {
            setKeywordInput("");
            setSearch({ ...search, keyword: "", page: 1 });
          }}
          style={{ width: 240 }}
        />
        {isSuperAdmin && (
          <Button
            type="primary"
            icon={<Plus size={token.fontSize} />}
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            {t`创建管理员`}
          </Button>
        )}
      </Flex>

      <DataTable<AdminItem>
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

      <FormModal
        open={modalOpen}
        editing={editing}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        isSuperAdmin={isSuperAdmin}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        onFinish={(values) => {
          if (editing) {
            updateMutation.mutate({ ...values, id: editing.id });
          } else {
            createMutation.mutate(values);
          }
        }}
      />
    </Flex>
  );
}
