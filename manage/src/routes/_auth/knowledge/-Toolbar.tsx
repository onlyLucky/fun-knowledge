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
            placeholder={t`Search knowledge`}
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
            placeholder={t`Status`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={statusValue}
            onChange={(v) => onStatusChange(v ?? "")}
            options={[
              { label: t`Published`, value: "1" },
              { label: t`Draft`, value: "0" },
              { label: t`Offline`, value: "2" },
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
          {t`Create Knowledge`}
        </Button>
      }
      moreFiltersLabel={t`More filters`}
      moreFiltersTitle={t`More filters`}
    />
  );
});
