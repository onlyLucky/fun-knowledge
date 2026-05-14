import { Input, Select, theme } from "antd";
import { useLingui } from "@lingui/react/macro";
import { UserRound } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { FilterToolbar } from "@/components/FilterToolbar";

const FILTER_CONTROL_WIDTH = 220;

export type ToolbarProps = {
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: (keyword: string) => void;
  onClearSearch: () => void;
  roleValue: string | undefined;
  onRoleChange: (role: string) => void;
  statusValue: string | undefined;
  onStatusChange: (status: string) => void;
};

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    keywordInput,
    onKeywordChange,
    onSearch,
    onClearSearch,
    roleValue,
    onRoleChange,
    statusValue,
    onStatusChange,
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
            placeholder={t`搜索用户`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onSearch={(v) => onSearch(v)}
            onClear={onClearSearch}
          />
        ),
      },
      {
        key: "role",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Select
            allowClear
            placeholder={t`角色`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            prefix={<UserRound size={token.fontSize} />}
            value={roleValue}
            onChange={(v) => onRoleChange(v ?? "")}
            options={[
              { label: t`管理员`, value: "admin" },
              { label: t`编辑`, value: "editor" },
            ]}
          />
        ),
      },
      {
        key: "status",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Select
            allowClear
            placeholder={t`用户状态`}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={statusValue}
            onChange={(v) => onStatusChange(v ?? "")}
            options={[
              { label: t`正常`, value: "0" },
              { label: t`禁用`, value: "1" },
            ]}
          />
        ),
      },
    ],
    [
      keywordInput,
      onClearSearch,
      onKeywordChange,
      onRoleChange,
      onSearch,
      onStatusChange,
      roleValue,
      statusValue,
      t,
      token.fontSize,
    ],
  );

  return (
    <FilterToolbar
      ref={ref}
      slots={slots}
      actions={null}
      moreFiltersLabel={t`更多筛选`}
      moreFiltersTitle={t`更多筛选`}
    />
  );
});
