import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex, Space, Switch } from "antd";
import type { TablePaginationConfig, Key } from "antd/es/table/interface";
import { useLingui } from "@lingui/react/macro";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import {
  KNOWLEDGE_ENDPOINTS,
  KnowledgeStatus,
  KnowledgeSchema,
  CreateKnowledgeRequestSchema,
  AiExtendType,
} from "@/api/knowledge";
import { CATEGORY_ENDPOINTS, CategorySchema } from "@/api/category";
import { PaginatedResponseSchema } from "@/api/schemas";
import type { Knowledge as KnowledgeType, CreateKnowledgeRequest } from "@/api/knowledge";
import { z } from "zod/v4";
import { MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useResourceCRUD } from "@/hooks/useResourceCRUD";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { useUrlSearchState } from "@/hooks/useUrlSearchState";
import { Toolbar } from "./-Toolbar";
import { FormModal } from "./-FormModal";
import { ImportModal } from "./-ImportModal";
import { DetailDrawer } from "./-DetailDrawer";

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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<KnowledgeType | null>(null);
  const [detailRecord, setDetailRecord] = useState<KnowledgeType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [form] = Form.useForm();

  const setSearch = (next: Search) => void navigate({ search: next });

  const { keywordInput, setKeywordInput, applyKeyword } = useUrlSearchState({ search, setSearch });

  const crudToasts = useCrudToasts({ message, resourceKey: "knowledge" });

  const queryKey = [
    "knowledge",
    search.page,
    search.pageSize,
    search.keyword,
    search.category_id,
    search.status,
    search.sortField,
    search.sortOrder,
  ] as const;

  const correctPageAfterDelete = () => {
    const currentData = queryClient.getQueryData<{
      list: KnowledgeType[];
      total: number;
    }>([...queryKey]);
    if (currentData && currentData.list.length === 0 && search.page > 1) {
      void navigate({ search: { ...search, page: search.page - 1 } });
    }
  };

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => httpClient.delete(KNOWLEDGE_ENDPOINTS.batchDelete, { ids }),
    onSuccess: async () => {
      message.success(t`删除成功`);
      setSelectedRowKeys([]);
      await queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      correctPageAfterDelete();
    },
    onError: (err: Error) => message.error(err.message || t`删除失败`),
  });

  const confirmBatchDelete = () => {
    modal.confirm({
      title: t`确定删除选中的 ${selectedRowKeys.length} 条记录？`,
      content: t`此操作不可撤销。`,
      okText: t`删除`,
      okType: "danger",
      cancelText: t`取消`,
      onOk: () => batchDeleteMutation.mutate(selectedRowKeys as string[]),
    });
  };

  const { data: categories } = useQuery({
    queryKey: ["categories", "enabled"],
    queryFn: () => httpClient.get(CATEGORY_ENDPOINTS.enabled),
    select: (raw: unknown) => {
      const list = raw as unknown[];
      return list.map((item) => CategorySchema.parse(item));
    },
  });

  const { data, isLoading, createMutation, updateMutation, deleteMutation } = useResourceCRUD<
    { list: KnowledgeType[]; total: number },
    CreateKnowledgeRequest,
    CreateKnowledgeRequest & { id: string }
  >({
    queryKey,
    queryFn: () =>
      httpClient.get(KNOWLEDGE_ENDPOINTS.list, {
        params: {
          page: search.page,
          pageSize: search.pageSize,
          title: search.keyword || undefined,
          category_id: search.category_id || undefined,
          status: search.status || undefined,
          sortField: search.sortField ?? undefined,
          sortOrder: search.sortOrder ?? undefined,
        },
      }),
    select: (raw) => {
      const result = paginatedSchema.shape.data.safeParse(raw);
      if (!result.success) {
        console.error("Knowledge list parse error:", result.error);
        // 回退：直接从 raw 中提取 list 和 total
        const r = raw as { list?: KnowledgeType[]; total?: number };
        return { list: r.list ?? [], total: r.total ?? 0 };
      }
      return result.data;
    },
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
      onSuccess: (id) => {
        crudToasts.deleteLifecycle?.onSuccess?.(id);
        setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
        correctPageAfterDelete();
      },
      onError: crudToasts.deleteLifecycle?.onError,
    },
  });

  const toggleStatus = async (record: KnowledgeType) => {
    setTogglingId(record.id);
    try {
      const nextStatus =
        record.status === KnowledgeStatus.ONLINE ? KnowledgeStatus.OFFLINE : KnowledgeStatus.ONLINE;
      await httpClient.put(KNOWLEDGE_ENDPOINTS.toggleStatus(record.id), { status: nextStatus });
      await queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t`操作失败`;
      message.error(msg);
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
    [KnowledgeStatus.ONLINE]: { label: t`上架`, color: "success" },
    [KnowledgeStatus.OFFLINE]: { label: t`下架`, color: "default" },
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
    {
      title: t`分类`,
      key: "category_id",
      render: (_: unknown, record: KnowledgeType) => record.category?.name ?? record.category_id,
    },
    {
      title: t`标签`,
      key: "tags",
      width: 300,
      render: (_: unknown, record: KnowledgeType) =>
        record.tags && record.tags.length > 0
          ? record.tags.map((tag) => (
              <Tag key={tag} style={{ marginBottom: 2 }}>
                {tag}
              </Tag>
            ))
          : "—",
    },
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
      title: t`权重`,
      dataIndex: "weight",
      key: "weight",
      sorter: true,
      sortOrder: search.sortField === "weight" ? search.sortOrder : null,
      width: 70,
      render: (weight: number | undefined) => weight ?? 0,
    },
    {
      title: t`AI解读`,
      dataIndex: "ai_extend_count",
      key: "ai_extend_count",
      sorter: true,
      sortOrder: search.sortField === "ai_extend_count" ? search.sortOrder : null,
      width: 120,
      render: (_: unknown, record: KnowledgeType) => (
        <Space size={4}>
          <span>{record.ai_extend_count ?? 0}</span>
          <Tag
            color={record.ai_extend_type === AiExtendType.STATIC_DATA ? "blue" : "green"}
            style={{ marginLeft: 4 }}
          >
            {record.ai_extend_type === AiExtendType.STATIC_DATA ? t`静态` : t`AI`}
          </Tag>
        </Space>
      ),
    },
    {
      title: t`操作`,
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: KnowledgeType) => (
        <Space>
          {/* <Button
            type="text"
            icon={<Eye size={token.fontSize} />}
            onClick={(e) => {
              e.stopPropagation();
              setDetailRecord(record);
              setDetailOpen(true);
            }}
          /> */}
          <Switch
            size="small"
            loading={togglingId === record.id}
            disabled={togglingId === record.id}
            checked={record.status === KnowledgeStatus.ONLINE}
            onChange={() => toggleStatus(record)}
          />
          <Dropdown
            menu={{
              items: [
                {
                  key: "look",
                  icon: <Eye size={token.fontSize} />,
                  label: t`查看`,
                  onClick: () => {
                    setDetailRecord(record);
                    setDetailOpen(true);
                  },
                },
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
      <Toolbar
        ref={toolbarRowRef}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={applyKeyword}
        onClearSearch={() => {
          setKeywordInput("");
          setSearch({ ...search, keyword: "", page: 1 });
        }}
        categoryIdValue={search.category_id || undefined}
        onCategoryChange={(categoryId) =>
          void navigate({ search: { ...search, category_id: categoryId, page: 1 } })
        }
        statusValue={search.status || undefined}
        onStatusChange={(status) => void navigate({ search: { ...search, status, page: 1 } })}
        categories={categories}
        onCreateClick={() => {
          setEditing(null);
          form.resetFields();
          setModalOpen(true);
        }}
        onImportClick={() => setImportModalOpen(true)}
        selectedCount={selectedRowKeys.length}
        onBatchDelete={confirmBatchDelete}
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
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        style={{ flex: 1, minHeight: 0 }}
        onRow={(record) => ({
          onClick: (e) => {
            if ((e.target as HTMLElement).closest(".ant-switch, .ant-dropdown, .ant-btn")) return;
            setDetailRecord(record);
            setDetailOpen(true);
          },
          style: { cursor: "pointer" },
        })}
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
          setSelectedRowKeys([]);
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

      <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />

      <DetailDrawer
        open={detailOpen}
        knowledge={detailRecord}
        onClose={() => {
          setDetailOpen(false);
          setDetailRecord(null);
        }}
      />
    </Flex>
  );
}
