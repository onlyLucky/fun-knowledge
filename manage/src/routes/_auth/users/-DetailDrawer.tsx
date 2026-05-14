import { Drawer, Descriptions, Tag, Button, Space, Avatar, Image } from "antd";
import { useLingui } from "@lingui/react/macro";
import type { User } from "@/api/schemas";

export type DetailDrawerProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onStatusChange?: (user: User) => void;
};

export function DetailDrawer({ open, user, onClose, onStatusChange }: DetailDrawerProps) {
  const { t } = useLingui();

  if (!user) return null;

  return (
    <Drawer title={t`用户详情`} open={open} onClose={onClose} width={560}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={t`用户头像`}>
          <Space>
            <Avatar size={48} src={user.avatar} shape="circle">
              {user.nickname?.[0]?.toUpperCase()}
            </Avatar>
            {user.avatar && <Image src={user.avatar} width={48} style={{ borderRadius: 4 }} />}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={t`用户昵称`}>{user.nickname ?? "-"}</Descriptions.Item>
        <Descriptions.Item label={t`邮箱`}>{user.email ?? "-"}</Descriptions.Item>
        <Descriptions.Item label={t`手机号`}>{user.phone ?? "-"}</Descriptions.Item>
        <Descriptions.Item label={t`OpenID`}>
          <span style={{ fontFamily: "monospace", fontSize: 12 }}>{user.openid ?? "-"}</span>
        </Descriptions.Item>
        <Descriptions.Item label={t`状态`}>
          <Tag color={user.status === 0 ? "success" : "error"}>
            {user.status === 0 ? t`正常` : t`禁用`}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t`连续打卡天数`}>{user.streak_days ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`累计打卡天数`}>
          {user.total_check_in_days ?? 0}
        </Descriptions.Item>
        <Descriptions.Item label={t`收藏数`}>{user.favorites_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`AI 使用次数`}>{user.ai_usage_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`注册时间`}>{user.created_at ?? "-"}</Descriptions.Item>
        <Descriptions.Item label={t`更新时间`}>{user.updated_at ?? "-"}</Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <Button danger={user.status === 0} onClick={() => onStatusChange?.(user)}>
          {user.status === 0 ? t`禁用用户` : t`启用用户`}
        </Button>
      </div>
    </Drawer>
  );
}
