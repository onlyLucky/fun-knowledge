import { Drawer, Descriptions, Tag, Button, Form, Input, App, Space } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { CORRECTION_ENDPOINTS, CorrectionStatus, CorrectionType } from "@/api/correction";
import type { Correction, ReviewCorrectionRequest } from "@/api/correction";

const TYPE_MAP: Record<number, string> = {
  [CorrectionType.FACT_ERROR]: "事实错误",
  [CorrectionType.TYPO]: "错别字",
  [CorrectionType.OUTDATED]: "内容过时",
  [CorrectionType.OTHER]: "其他",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [CorrectionStatus.PENDING]: { label: "待审核", color: "warning" },
  [CorrectionStatus.APPROVED]: { label: "已通过", color: "success" },
  [CorrectionStatus.REJECTED]: { label: "已拒绝", color: "error" },
};

export type DetailDrawerProps = {
  open: boolean;
  correction: Correction | null;
  onClose: () => void;
};

export function DetailDrawer({ open, correction, onClose }: DetailDrawerProps) {
  const { t } = useLingui();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ReviewCorrectionRequest>();

  const reviewMutation = useMutation({
    mutationFn: async (values: ReviewCorrectionRequest) => {
      if (!correction) return;
      await httpClient.put(CORRECTION_ENDPOINTS.review(correction.id), values);
    },
    onSuccess: () => {
      message.success(t`审核已提交`);
      void queryClient.invalidateQueries({ queryKey: ["correction"] });
      onClose();
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`审核失败`);
    },
  });

  if (!correction) return null;

  const s = STATUS_MAP[correction.status] ?? { label: String(correction.status), color: "default" };

  return (
    <Drawer title={t`纠错详情`} open={open} onClose={onClose} width={480}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={t`知识ID`}>{correction.knowledge_id}</Descriptions.Item>
        <Descriptions.Item label={t`类型`}>
          {TYPE_MAP[correction.type] ?? correction.type}
        </Descriptions.Item>
        <Descriptions.Item label={t`状态`}>
          <Tag color={s.color}>{t`${s.label}`}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t`描述`}>{correction.description}</Descriptions.Item>
        <Descriptions.Item label={t`创建时间`}>{correction.created_at}</Descriptions.Item>
        {correction.review_remark && (
          <Descriptions.Item label={t`审核备注`}>{correction.review_remark}</Descriptions.Item>
        )}
      </Descriptions>

      {correction.status === CorrectionStatus.PENDING && (
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="review_remark" label={t`审核备注`}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              loading={reviewMutation.isPending}
              onClick={() =>
                reviewMutation.mutate({
                  status: CorrectionStatus.APPROVED,
                  review_remark: form.getFieldValue("review_remark"),
                })
              }
            >
              {t`通过`}
            </Button>
            <Button
              danger
              loading={reviewMutation.isPending}
              onClick={() =>
                reviewMutation.mutate({
                  status: CorrectionStatus.REJECTED,
                  review_remark: form.getFieldValue("review_remark"),
                })
              }
            >
              {t`拒绝`}
            </Button>
          </Space>
        </Form>
      )}
    </Drawer>
  );
}
