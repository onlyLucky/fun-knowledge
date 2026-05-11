import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex, Space, Switch } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import {
  KNOWLEDGE_ENDPOINTS,
  KnowledgeStatus,
  KnowledgeSchema,
  CreateKnowledgeRequestSchema,
} from "@/api/knowledge";
import { PaginatedResponseSchema } from "@/api/schemas";
import type { Knowledge as KnowledgeType, CreateKnowledgeRequest } from "@/api/knowledge";
import { z } from "zod/v4";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useResourceCRUD } from "@/hooks/useResourceCRUD";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { Toolbar } from "./-Toolbar";
import { FormModal } from "./-FormModal";

const SearchParamsSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().positive().catch(10),
  sortField: z.string().nullable().catch(null),
  sortOrder: z.enum(["ascend", "descend"]).nullable().catch(null),
  keyword: z.string().catch(""),
  category_id: z.string().catch(""),
  status: z.string().catch(""),
});

type Search = z.infer<typeof SearchParamsSchema>;

export const Route = createFileRoute("/_auth/knowledge/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: KnowledgePage,
});

const paginatedSchema = PaginatedResponseSchema(KnowledgeSchema);

function KnowledgePage() {
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
  const [editing, setEditing] = useState<KnowledgeType | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const setSearch = (next: Search) => void navigate({ search: next });

  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({ search, setSearch });

  const crudToasts = useCrudToasts({ message, resourceKey: "knowledge" });

  const { data, isLoading, createMutation, updateMutation, deleteMutation } = useResourceCRUD<
    { list: KnowledgeType[]; total: number },
    CreateKnowledgeRequest,
    CreateKnowledgeRequest & { id: string }
  >({
    queryKey: [
      "knowledge",
      search.page,
      search.pageSize,
      search.keyword,
      search.category_id,
      search.status,
      search.sortField,
      search.sortOrder,
    ],
    queryFn: () =>
      httpClient.get(KNOWLEDGE_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          keyword: search.keyword || undefined,
          category_id: search.category_id || undefined,
          status: search.status || undefined,
          sortField: search.sortField ?? undefined,
          sortOrder: search.sortOrder ?? undefined,
        },
      }),
    select: (raw) => paginatedSchema.shape.data.parse(raw),
    createFn: (values) =>
      httpClient.post(KNOWLEDGE_ENDPOINTS.create, CreateKnowledgeRequestSchema.parse(values)),
    updateFn: ({ id, ...values }) => httpClient.put(KNOWLEDGE_ENDPOINTS.update(id), values),
    deleteFn: (id) => httpClient.delete(KNOWLEDGE_ENDPOINTS.delete(id)),
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
      onSuccess: crudToasts.deleteLifecycle?.onSuccess,
      onError: crudToasts.deleteLifecycle?.onError,
    },
  });

  const toggleStatus = async (record: KnowledgeType) => {
    setTogglingId(record.id);
    try {
      const nextStatus =
        record.status === KnowledgeStatus.PUBLISHED
          ? KnowledgeStatus.OFFLINE
          : KnowledgeStatus.PUBLISHED;
      await httpClient.put(KNOWLEDGE_ENDPOINTS.toggleStatus(record.id), { status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = (record: KnowledgeType) => {
    modal.confirm({
      title: t`确定要删除吗？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const STATUS_MAP: Record<number, { label: string; color: string }> = {
    [KnowledgeStatus.DRAFT]: { label: t`草稿`, color: "default" },
    [KnowledgeStatus.PUBLISHED]: { label: t`已发布`, color: "success" },
    [KnowledgeStatus.OFFLINE]: { label: t`已下线`, color: "error" },
  };

  const columns = [
    {
      title: t`标题`,
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortOrder: search.sortField === "title" ? search.sortOrder : null,
      ellipsis: true,
    },
    { title: t`分类`, dataIndex: "category_id", key: "category_id" },
    {
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const s = STATUS_MAP[status] ?? { label: String(status), color: "default" };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: t`浏览量`,
      dataIndex: "view_count",
      key: "view_count",
      sorter: true,
      sortOrder: search.sortField === "view_count" ? search.sortOrder : null,
      width: 80,
    },
    {
      title: t`操作`,
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: KnowledgeType) => (
        <Space>
          <Switch
            size="small"
            loading={togglingId === record.id}
            checked={record.status === KnowledgeStatus.PUBLISHED}
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
      <Toolbar
        ref={toolbarRowRef}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={applyKeyword}
        onClearSearch={() => {
          setKeywordInput("");
          setSearch({ ...search, keyword: "", page: 1 });
        }}
        statusValue={search.status || undefined}
        onStatusChange={(status) => void navigate({ search: { ...search, status, page: 1 } })}
        onCreateClick={() => {
          setEditing(null);
          form.resetFields();
          setModalOpen(true);
        }}
      />

      <DataTable<KnowledgeType>
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
        onChange={(pagination, _filters, sorter) => {
          const next: Search = {
            ...search,
            page: pagination.current ?? 1,
            pageSize: pagination.pageSize ?? 10,
          };
          if (!Array.isArray(sorter)) {
            next.sortField = sorter.order ? String(sorter.field) : null;
            next.sortOrder = sorter.order ?? null;
          }
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
