import {
  Drawer,
  Descriptions,
  Tag,
  Avatar,
  Button,
  Input,
  Space,
  Flex,
  Divider,
  Typography,
  theme,
} from "antd";
import { useLingui } from "@lingui/react/macro";
import { useState } from "react";
import {
  USER_REVIEW_STATUS,
  USER_REVIEW_STATUS_LABELS,
  USER_REVIEW_STATUS_COLORS,
} from "@/api/user-review";
import type { UserReview } from "@/api/user-review";

type DetailDrawerProps = {
  open: boolean;
  review: UserReview | null;
  onClose: () => void;
  onReview: (values: { status: number; review_remark?: string }) => void;
  reviewLoading: boolean;
};

export function DetailDrawer({
  open,
  review,
  onClose,
  onReview,
  reviewLoading,
}: DetailDrawerProps) {
  const { t } = useLingui();
  const { token } = theme.useToken();
  const [remark, setRemark] = useState("");

  const handleReview = (status: number) => {
    onReview({ status, review_remark: remark || undefined });
    setRemark("");
  };

  if (!review) return null;

  const isPending = review.status === USER_REVIEW_STATUS.PENDING;

  return (
    <Drawer
      title={t`审核详情`}
      open={open}
      onClose={onClose}
      width={560}
      footer={
        isPending ? (
          <Flex justify="flex-end" gap={token.marginSM}>
            <Button onClick={onClose}>{t`取消`}</Button>
            <Button
              danger
              loading={reviewLoading}
              onClick={() => handleReview(USER_REVIEW_STATUS.REJECTED)}
            >
              {t`驳回`}
            </Button>
            <Button
              type="primary"
              loading={reviewLoading}
              onClick={() => handleReview(USER_REVIEW_STATUS.APPROVED)}
            >
              {t`通过`}
            </Button>
          </Flex>
        ) : undefined
      }
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={t`用户`}>
          <Space>
            <Avatar src={review.user?.avatar} size="small">
              {review.user?.nickname?.[0]}
            </Avatar>
            <span>{review.user?.nickname || "-"}</span>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={t`审核状态`}>
          <Tag
            color={
              USER_REVIEW_STATUS_COLORS[review.status as keyof typeof USER_REVIEW_STATUS_COLORS]
            }
          >
            {USER_REVIEW_STATUS_LABELS[review.status as keyof typeof USER_REVIEW_STATUS_LABELS]}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t`提交时间`}>
          {new Date(review.created_at).toLocaleString("zh-CN")}
        </Descriptions.Item>
      </Descriptions>

      <Divider plain>{t`申请变更内容`}</Divider>

      <Descriptions column={1} bordered size="small">
        {review.nickname && (
          <Descriptions.Item label={t`昵称`}>
            <Typography.Text delete type="secondary">
              {review.user?.nickname || "-"}
            </Typography.Text>
            {" → "}
            <Typography.Text type="success">{review.nickname}</Typography.Text>
          </Descriptions.Item>
        )}
        {review.avatar && (
          <Descriptions.Item label={t`头像`}>
            <Space>
              <Avatar src={review.user?.avatar} size="small" />
              <span>→</span>
              <Avatar src={review.avatar} size="small" />
            </Space>
          </Descriptions.Item>
        )}
        {review.signature && (
          <Descriptions.Item label={t`个性签名`}>
            <Typography.Text delete type="secondary">
              {review.user?.signature || "-"}
            </Typography.Text>
            {" → "}
            <Typography.Text type="success">{review.signature}</Typography.Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      {!isPending && (
        <>
          <Divider plain>{t`审核结果`}</Divider>
          <Descriptions column={1} bordered size="small">
            {review.review_remark && (
              <Descriptions.Item label={t`审核备注`}>{review.review_remark}</Descriptions.Item>
            )}
            {review.review_time && (
              <Descriptions.Item label={t`审核时间`}>
                {new Date(review.review_time).toLocaleString("zh-CN")}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {isPending && (
        <>
          <Divider plain>{t`审核操作`}</Divider>
          <Input.TextArea
            placeholder={t`请输入审核备注（可选）`}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={4}
            style={{ marginBottom: token.marginMD }}
          />
        </>
      )}
    </Drawer>
  );
}
