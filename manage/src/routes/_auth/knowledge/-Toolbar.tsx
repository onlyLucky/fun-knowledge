import { Button, Input, Select, theme } from "antd";
import { useLingui } from "@lingui/react/macro";
import { Plus, Trash2, Upload } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { FilterToolbar } from "@/components/FilterToolbar";

const FILTER_CONTROL_WIDTH = 220;

export type ToolbarProps = {
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: (keyword: string) => void;
  onClearSearch: () => void;
  statusValue: string | undefined;
  onStatusChange: (status: string) => void;
  onCreateClick: () => void;
  onImportClick?: () => void;
  selectedCount?: number;
  onBatchDelete?: () => void;
};

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    keywordInput,
    onKeywordChange,
    onSearch,
    onClearSearch,
    statusValue,
    onStatusChange,
    onCreateClick,
    onImportClick,
    selectedCount = 0,
    onBatchDelete,
  },
  ref,
) {
  const { t } = useLingui();
  const { token } = theme.useToken();

  const slots = useMemo(
    () => [
      {
        key: "keyword",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Input.Search
            allowClear
            placeholder={t`搜索知识`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onSearch={(v) => onSearch(v)}
            onClear={onClearSearch}
          />
        ),
      },
      {
        key: "status",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Select
            allowClear
            placeholder={t`状态`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={statusValue}
            onChange={(v) => onStatusChange(v ?? "")}
            options={[
              { label: t`上架`, value: "1" },
              { label: t`下架`, value: "0" },
            ]}
          />
        ),
      },
    ],
    [
      keywordInput,
      onClearSearch,
      onKeywordChange,
      onStatusChange,
      onSearch,
      statusValue,
      t,
      token.fontSize,
    ],
  );

  return (
    <FilterToolbar
      ref={ref}
      slots={slots}
      actions={
        <>
          {selectedCount > 0 && onBatchDelete && (
            <Button danger icon={<Trash2 size={token.fontSize} />} onClick={onBatchDelete}>
              {t`批量删除`} ({selectedCount})
            </Button>
          )}
          {onImportClick && (
            <Button icon={<Upload size={token.fontSize} />} onClick={onImportClick}>
              {t`批量导入`}
            </Button>
          )}
          <Button type="primary" icon={<Plus size={token.fontSize} />} onClick={onCreateClick}>
            {t`新建知识`}
          </Button>
        </>
      }
      moreFiltersLabel={t`更多筛选`}
      moreFiltersTitle={t`更多筛选`}
    />
  );
});
