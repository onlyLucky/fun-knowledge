import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Avatar,
  Card,
  Flex,
  Typography,
  Empty,
  Spin,
  Divider,
} from "antd";
import { useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { USER_ENDPOINTS } from "@/api/user";
import { UserSchema, type User } from "@/api/schemas";

const { Text } = Typography;

export type DetailDrawerProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onStatusChange?: (user: User) => void;
};

export function DetailDrawer({ open, user, onClose, onStatusChange }: DetailDrawerProps) {
  const { t } = useLingui();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["user", "detail", user?.id],
    queryFn: () => httpClient.get(USER_ENDPOINTS.detail(user!.id)),
    select: (raw) => UserSchema.parse(raw),
    enabled: open && !!user?.id,
    staleTime: 30_000,
  });

  const displayUser = detail ?? user;
  if (!displayUser) return null;

  const profile = detail?.profile;

  return (
    <Drawer title={t`用户详情`} open={open} onClose={onClose} width={640}>
      <Spin spinning={isLoading}>
        <Flex vertical justify="center" align="center">
          <Space>
            <Avatar size={48} src={displayUser.avatar} shape="circle">
              {displayUser.nickname?.[0]?.toUpperCase()}
            </Avatar>
            {/* {displayUser.avatar && <Image src={displayUser.avatar} width={48} style={{ borderRadius: 4 }} />} */}
          </Space>
          <p>{displayUser.nickname ?? "-"}</p>
        </Flex>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={t`邮箱`}>{displayUser.email ?? "-"}</Descriptions.Item>
          <Descriptions.Item label={t`手机号`}>{displayUser.phone ?? "-"}</Descriptions.Item>
          <Descriptions.Item label={t`OpenID`}>
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>
              {displayUser.openid ?? "-"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label={t`状态`}>
            <Flex vertical={false} justify="space-between" align="center">
              <Tag color={displayUser.status === 0 ? "success" : "error"}>
                {displayUser.status === 0 ? t`正常` : t`禁用`}
              </Tag>
              <Button
                danger={displayUser.status === 0}
                onClick={() => onStatusChange?.(displayUser)}
              >
                {displayUser.status === 0 ? t`禁用用户` : t`启用用户`}
              </Button>
            </Flex>
          </Descriptions.Item>

          <Descriptions.Item label={t`注册时间`}>{displayUser.created_at ?? "-"}</Descriptions.Item>
          <Descriptions.Item label={t`更新时间`}>{displayUser.updated_at ?? "-"}</Descriptions.Item>
        </Descriptions>

        <Divider plain style={{ margin: "16px 0" }}>{t`数据统计`}</Divider>

        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label={t`连续打卡天数`}>
            {displayUser.streak_days ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label={t`累计打卡天数`}>
            {displayUser.total_check_in_days ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label={t`收藏数`}>
            {displayUser.favorites_count ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label={t`AI 使用次数`}>
            {displayUser.ai_usage_count ?? 0}
          </Descriptions.Item>
        </Descriptions>

        {/* User Profile Section */}
        {profile && (
          <>
            <Divider plain style={{ margin: "16px 0" }}>{t`用户画像`}</Divider>
            <Card size="small">
              <Flex vertical gap={16}>
                {/* Category Interests */}
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>{t`兴趣类目`}</Text>
                  {profile.category_interests.length > 0 ? (
                    <Flex wrap="wrap" gap={8}>
                      {profile.category_interests.map((interest, index) => (
                        <Tag key={interest.category_id ?? index} color="blue">
                          {interest.category_name ?? interest.category_id?.slice(0, 8) ?? "-"}{" "}
                          {interest.score.toFixed(1)}
                        </Tag>
                      ))}
                    </Flex>
                  ) : (
                    <Empty description={t`暂无兴趣类目`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>

                {/* Tag Interests */}
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>{t`兴趣标签`}</Text>
                  {profile.tag_interests.length > 0 ? (
                    <Flex wrap="wrap" gap={8}>
                      {profile.tag_interests.map((interest, index) => (
                        <Tag key={interest.tag_name ?? index} color="green">
                          {interest.tag_name} {interest.score.toFixed(1)}
                        </Tag>
                      ))}
                    </Flex>
                  ) : (
                    <Empty description={t`暂无兴趣标签`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t`共 ${profile.total_interest_count} 条兴趣记录`}
                </Text>
              </Flex>
            </Card>
          </>
        )}
      </Spin>
    </Drawer>
  );
}
