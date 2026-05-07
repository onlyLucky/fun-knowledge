import { Button, Input, Select, theme } from "antd";
import { useLingui } from "@lingui/react/macro";
import { Plus } from "lucide-react";
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
              { label: t`已发布`, value: "1" },
              { label: t`草稿`, value: "0" },
              { label: t`已下线`, value: "2" },
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
        <Button type="primary" icon={<Plus size={token.fontSize} />} onClick={onCreateClick}>
          {t`新建知识`}
        </Button>
      }
      moreFiltersLabel={t`更多筛选`}
      moreFiltersTitle={t`更多筛选`}
    />
  );
});
