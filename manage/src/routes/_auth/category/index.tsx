import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex, Space, Switch, Input } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { CATEGORY_ENDPOINTS, CategorySchema, CreateCategoryRequestSchema } from "@/api/category";
import type { Category as CategoryType, CreateCategoryRequest } from "@/api/category";
import { PaginatedResponseSchema } from "@/api/schemas";
import { z } from "zod/v4";
import { MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useResourceCRUD } from "@/hooks/useResourceCRUD";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { FormModal } from "./-FormModal";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(20),
  keyword: z.string().catch(""),
  status: z.string().catch(""),
});

type Search = z.infer<typeof SearchParamsSchema>;

export const Route = createFileRoute("/_auth/category/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: CategoryPage,
});

const paginatedSchema = PaginatedResponseSchema(CategorySchema);

function CategoryPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { message, modal } = App.useApp();
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const setSearch = (next: Search) => void navigate({ search: next });

  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({ search, setSearch });

  const crudToasts = useCrudToasts({ message, resourceKey: "category" });

  const queryKey = [
    "category",
    search.page,
    search.pageSize,
    search.keyword,
    search.status,
  ] as const;

  const correctPageAfterDelete = () => {
    const currentData = queryClient.getQueryData<{
      list: CategoryType[];
      total: number;
    }>([...queryKey]);
    if (currentData && currentData.list.length === 0 && search.page > 1) {
      void navigate({ search: { ...search, page: search.page - 1 } });
    }
  };

  const { data, isLoading, createMutation, updateMutation, deleteMutation } = useResourceCRUD<
    { list: CategoryType[]; total: number },
    CreateCategoryRequest,
    CreateCategoryRequest & { id: string }
  >({
    queryKey,
    queryFn: () =>
      httpClient.get(CATEGORY_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          name: search.keyword || undefined,
          status: search.status || undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
    createFn: (values) =>
      httpClient.post(CATEGORY_ENDPOINTS.create, CreateCategoryRequestSchema.parse(values)),
    updateFn: ({ id, ...values }) => httpClient.put(CATEGORY_ENDPOINTS.update(id), values),
    deleteFn: (id) => httpClient.delete(CATEGORY_ENDPOINTS.delete(id)),
    optimistic: { update: true, delete: true },
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
    deleteLifecycle: {
      onMutate: crudToasts.deleteLifecycle?.onMutate,
      onSuccess: (id) => {
        crudToasts.deleteLifecycle?.onSuccess?.(id);
        correctPageAfterDelete();
      },
      onError: crudToasts.deleteLifecycle?.onError,
    },
  });

  const toggleStatus = async (record: CategoryType) => {
    setTogglingId(record.id);
    try {
      await httpClient.put(CATEGORY_ENDPOINTS.toggleStatus(record.id));
      await queryClient.invalidateQueries({ queryKey: ["category"] });
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = (record: CategoryType) => {
    modal.confirm({
      title: t`确定要删除吗？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const columns = [
    { title: t`名称`, dataIndex: "name", key: "name" },
    { title: t`描述`, dataIndex: "description", key: "description", ellipsis: true },
    { title: t`排序`, dataIndex: "sort_order", key: "sort_order", width: 100 },
    {
      title: t`权重`,
      dataIndex: "weight",
      key: "weight",
      width: 70,
      render: (weight: number | undefined) => weight ?? 0,
    },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "default"}>{status === 1 ? t`启用` : t`停用`}</Tag>
      ),
    },
    {
      title: t`操作`,
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: CategoryType) => (
        <Space>
          <Switch
            size="small"
            loading={togglingId === record.id}
            disabled={togglingId === record.id}
            checked={record.status === 1}
            onChange={() => toggleStatus(record)}
          />
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
                {
                  key: "delete",
                  icon: <Trash2 size={token.fontSize} />,
                  label: t`删除`,
                  danger: true,
                  onClick: () => confirmDelete(record),
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
        </Space>
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
      <Flex ref={toolbarRowRef} justify="space-between" style={{ marginBottom: token.marginMD }}>
        <Space>
          <Input
            placeholder={t`搜索类目名称`}
            prefix={<Search size={token.fontSize} />}
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onPressEnter={() => applyKeyword(keywordInput)}
            allowClear
            onClear={() => {
              setKeywordInput("");
              setSearch({ ...search, keyword: "", page: 1 });
            }}
            style={{ width: 220 }}
          />
        </Space>
        <Button
          type="primary"
          icon={<Pencil size={token.fontSize} />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          {t`创建分类`}
        </Button>
      </Flex>

      <DataTable<CategoryType>
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
        onChange={(pagination) => {
          const next: Search = {
            ...search,
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? 20,
          };
          if (pagination.pageSize !== search.pageSize) {
            next.page = 1;
          }
          void navigate({ search: next });
        }}
      />

      <FormModal
        open={modalOpen}
        editing={editing}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
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
