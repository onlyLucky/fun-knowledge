import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex, Space, Switch } from "antd";
import type { TablePaginationConfig } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
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
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(10),
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
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<KnowledgeType | null>(null);
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

  const toggleStatus = (record: KnowledgeType) => {
    const nextStatus =
      record.status === KnowledgeStatus.PUBLISHED
        ? KnowledgeStatus.OFFLINE
        : KnowledgeStatus.PUBLISHED;
    void httpClient.put(KNOWLEDGE_ENDPOINTS.toggleStatus(record.id), { status: nextStatus });
  };

  const confirmDelete = (record: KnowledgeType) => {
    modal.confirm({
      title: t`Are you absolutely sure?`,
      content: t`This action cannot be undone.`,
      okText: t`Delete`,
      okType: "danger",
      cancelText: t`Cancel`,
      onOk: () => deleteMutation.mutate(record.id),
    });
  };

  const STATUS_MAP: Record<number, { label: string; color: string }> = {
    [KnowledgeStatus.DRAFT]: { label: t`Draft`, color: "default" },
    [KnowledgeStatus.PUBLISHED]: { label: t`Published`, color: "success" },
    [KnowledgeStatus.OFFLINE]: { label: t`Offline`, color: "error" },
  };

  const columns = [
    {
      title: t`Title`,
      dataIndex: "title",
      key: "title",
      sorter: true,
      sortOrder: search.sortField === "title" ? search.sortOrder : null,
      ellipsis: true,
    },
    { title: t`Category`, dataIndex: "category_id", key: "category_id" },
    {
      title: t`Status`,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: number) => {
        const s = STATUS_MAP[status] ?? { label: String(status), color: "default" };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    {
      title: t`Views`,
      dataIndex: "view_count",
      key: "view_count",
      sorter: true,
      sortOrder: search.sortField === "view_count" ? search.sortOrder : null,
      width: 80,
    },
    {
      title: t`Actions`,
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: KnowledgeType) => (
        <Space>
          <Switch
            size="small"
            checked={record.status === KnowledgeStatus.PUBLISHED}
            onChange={() => toggleStatus(record)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <Pencil size={token.fontSize} />,
                  label: t`Edit`,
                  onClick: () => {
                    setEditing(record);
                    form.setFieldsValue(record);
                    setModalOpen(true);
                  },
                },
                {
                  key: "delete",
                  icon: <Trash2 size={token.fontSize} />,
                  label: t`Delete`,
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
              aria-label={t`Row actions`}
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
        onChange={(_pagination, _filters, sorter) => {
          if (Array.isArray(sorter)) return;
          void navigate({
            search: {
              ...search,
              sortField: sorter.order ? String(sorter.field) : null,
              sortOrder: sorter.order ?? null,
            },
          });
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
