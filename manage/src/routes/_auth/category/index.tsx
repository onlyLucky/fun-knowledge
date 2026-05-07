import { createFileRoute } from "@tanstack/react-router";
import { Button, Form, App, Dropdown, theme, Tag, Flex } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useRef, useState } from "react";
import { httpClient } from "@/utils/http";
import { CATEGORY_ENDPOINTS, CategorySchema, CreateCategoryRequestSchema } from "@/api/category";
import type { Category as CategoryType, CreateCategoryRequest } from "@/api/category";
import { z } from "zod/v4";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { useResourceCRUD, type ResourceListData } from "@/hooks/useResourceCRUD";
import { useTableFitHeight } from "@/hooks/useTableFitHeight";
import { useCrudToasts } from "@/hooks/useCrudToasts";
import { FormModal } from "./-FormModal";

const SearchParamsSchema = z.object({
  keyword: z.string().catch(""),
});

export const Route = createFileRoute("/_auth/category/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: CategoryPage,
});

function CategoryPage() {
  const search = Route.useSearch();
  const { message, modal } = App.useApp();
  const { t } = useLingui();
  const { token } = theme.useToken();
  const [modalOpen, setModalOpen] = useState(false);
  const pageShellRef = useRef<HTMLDivElement>(null);
  const toolbarRowRef = useRef<HTMLDivElement>(null);
  const middleSectionRef = useRef<HTMLDivElement>(null);
  const tableFrameRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [form] = Form.useForm();

  const crudToasts = useCrudToasts({ message, resourceKey: "category" });

  const { data, isLoading, createMutation, updateMutation, deleteMutation } = useResourceCRUD<
    ResourceListData<CategoryType>,
    CreateCategoryRequest,
    CreateCategoryRequest & { id: string }
  >({
    queryKey: ["category", search.keyword],
    queryFn: () =>
      httpClient.get(CATEGORY_ENDPOINTS.list, { params: { keyword: search.keyword || undefined } }),
    select: (raw) => {
      const arr = CategorySchema.array().parse(raw);
      return { list: arr, total: arr.length };
    },
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
      onSuccess: crudToasts.deleteLifecycle?.onSuccess,
      onError: crudToasts.deleteLifecycle?.onError,
    },
  });

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
      title: t`状态`,
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? "success" : "default"}>{status === 1 ? t`启用` : t`停用`}</Tag>
      ),
    },
    {
      title: t`操作`,
      key: "actions",
      width: 60,
      align: "right" as const,
      render: (_: unknown, record: CategoryType) => (
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
      ),
    },
  ];

  const { tableAreaMaxHeight, tableScrollY, lockScrollHeight } = useTableFitHeight({
    pageShellRef,
    toolbarRef: toolbarRowRef,
    middleRef: middleSectionRef,
    tableFrameRef,
    marginLG: token.marginLG,
    rowCount: data?.list?.length ?? 0,
    isLoading,
    showPagination: false,
  });

  return (
    <Flex
      ref={pageShellRef}
      vertical
      gap={token.marginMD}
      style={{ flex: "1 1 0%", minHeight: 0, overflow: "hidden" }}
    >
      <Flex ref={toolbarRowRef} justify="flex-end" style={{ marginBottom: token.marginMD }}>
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
        pagination={false}
        style={{ flex: 1, minHeight: 0 }}
        scroll={tableScrollY != null ? { x: "max-content", y: tableScrollY } : { x: "max-content" }}
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
