import { Drawer, Descriptions, Tag, Button, Form, Input, App, Space } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { CORRECTION_ENDPOINTS, CorrectionStatus, CorrectionType } from "@/api/correction";
import type { Correction, ReviewCorrectionRequest } from "@/api/correction";

const TYPE_MAP: Record<number, string> = {
  [CorrectionType.FACT_ERROR]: "Fact Error",
  [CorrectionType.TYPO]: "Typo",
  [CorrectionType.OUTDATED]: "Outdated",
  [CorrectionType.OTHER]: "Other",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [CorrectionStatus.PENDING]: { label: "Pending", color: "warning" },
  [CorrectionStatus.APPROVED]: { label: "Approved", color: "success" },
  [CorrectionStatus.REJECTED]: { label: "Rejected", color: "error" },
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
      message.success(t`Review submitted`);
      void queryClient.invalidateQueries({ queryKey: ["correction"] });
      onClose();
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`Review failed`);
    },
  });

  if (!correction) return null;

  const s = STATUS_MAP[correction.status] ?? { label: String(correction.status), color: "default" };

  return (
    <Drawer title={t`Correction Detail`} open={open} onClose={onClose} width={480}>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={t`Knowledge ID`}>{correction.knowledge_id}</Descriptions.Item>
        <Descriptions.Item label={t`Type`}>
          {TYPE_MAP[correction.type] ?? correction.type}
        </Descriptions.Item>
        <Descriptions.Item label={t`Status`}>
          <Tag color={s.color}>{t`${s.label}`}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t`Description`}>{correction.description}</Descriptions.Item>
        <Descriptions.Item label={t`Created`}>{correction.created_at}</Descriptions.Item>
        {correction.review_remark && (
          <Descriptions.Item label={t`Review Remark`}>{correction.review_remark}</Descriptions.Item>
        )}
      </Descriptions>

      {correction.status === CorrectionStatus.PENDING && (
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="review_remark" label={t`Review Remark`}>
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
              {t`Approve`}
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
              {t`Reject`}
            </Button>
          </Space>
        </Form>
      )}
    </Drawer>
  );
}
