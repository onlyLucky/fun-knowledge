import { Avatar, Button, Dropdown, Flex, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import type { Admin } from "@/api/schemas";
import { MoreVertical } from "lucide-react";
import "./index.css";

const { Text } = Typography;

interface UserMenuProps {
  collapsed: boolean;
  admin: Admin | null;
  userMenuItems: MenuProps["items"];
  accountMenuTriggerAriaLabel: string;
}

export function UserMenu({
  collapsed,
  admin,
  userMenuItems,
  accountMenuTriggerAriaLabel,
}: UserMenuProps) {
  const { token } = theme.useToken();

  const avatarSize = collapsed ? 32 : token.controlHeight;

  const avatar = (
    <Avatar
      size={avatarSize}
      shape="circle"
      style={{
        flexShrink: 0,
        width: avatarSize,
      }}
    >
      {admin?.username?.[0]?.toUpperCase()}
    </Avatar>
  );

  const moreButton = (
    <Button
      type="text"
      size="small"
      icon={<MoreVertical size={token.fontSize} />}
      aria-label={accountMenuTriggerAriaLabel}
    />
  );

  return (
    <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
      <div
        style={{
          margin: token.marginXS,
        }}
      >
        <Flex
          className="user-menu-trigger"
          align="center"
          justify="flex-start"
          gap={token.marginSM}
          style={{
            width: "100%",
            cursor: "pointer",
            borderRadius: token.borderRadius,
            padding: token.paddingXS,
            ["--user-menu-hover-bg" as string]: token.colorFillTertiary,
          }}
        >
          {avatar}
          {!collapsed ? (
            <>
              <Flex
                vertical
                justify="center"
                gap={2}
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Text
                  ellipsis
                  style={{
                    lineHeight: 1,
                    display: "block",
                    maxWidth: "100%",
                  }}
                >
                  {admin?.username ?? "—"}
                </Text>
                <Text
                  ellipsis
                  style={{
                    lineHeight: 1,
                    display: "block",
                    maxWidth: "100%",
                    fontSize: token.fontSizeSM,
                    color: token.colorTextQuaternary,
                  }}
                >
                  {admin?.real_name ?? "—"}
                </Text>
              </Flex>
              {moreButton}
            </>
          ) : null}
        </Flex>
      </div>
    </Dropdown>
  );
}
