import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Form,
  Input,
  App,
  Space,
  Divider,
  Typography,
  Image,
} from "antd";
import { useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { CORRECTION_ENDPOINTS, CorrectionStatus, CorrectionType } from "@/api/correction";
import type { Correction, ReviewCorrectionRequest } from "@/api/correction";
import { KNOWLEDGE_ENDPOINTS } from "@/api/knowledge";
import type { CreateKnowledgeRequest, Knowledge } from "@/api/knowledge";
import { useState } from "react";
import { FormModal } from "../knowledge/-FormModal";

const { Text } = Typography;

const TYPE_MAP: Record<number, string> = {
  [CorrectionType.CONTENT_ERROR]: "内容错误",
  [CorrectionType.CATEGORY_ERROR]: "分类错误",
  [CorrectionType.IMAGE_MISMATCH]: "图片不符",
  [CorrectionType.OTHER]: "其他",
};

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [CorrectionStatus.PENDING]: { label: "待审核", color: "warning" },
  [CorrectionStatus.ACCEPTED]: { label: "已采纳", color: "success" },
  [CorrectionStatus.REJECTED]: { label: "已驳回", color: "error" },
};

export type DetailDrawerProps = {
  open: boolean;
  correction: Correction | null;
  onClose: () => void;
  onReviewSuccess?: () => void;
};

export function DetailDrawer({ open, correction, onClose, onReviewSuccess }: DetailDrawerProps) {
  const { t } = useLingui();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [reviewForm] = Form.useForm<ReviewCorrectionRequest>();
  const [knowledgeForm] = Form.useForm<CreateKnowledgeRequest>();
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);

  const reviewMutation = useMutation({
    mutationFn: async (values: ReviewCorrectionRequest) => {
      if (!correction) return;
      await httpClient.put(CORRECTION_ENDPOINTS.review(correction.id), values);
    },
    onSuccess: () => {
      message.success(t`审核已提交`);
      onReviewSuccess?.();
      onClose();
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`审核失败`);
    },
  });

  const updateKnowledgeMutation = useMutation({
    mutationFn: async (values: CreateKnowledgeRequest) => {
      if (!correction?.knowledge) return;
      await httpClient.put(KNOWLEDGE_ENDPOINTS.update(correction.knowledge.id), values);
    },
    onSuccess: () => {
      message.success(t`知识卡片已更新`);
      setKnowledgeModalOpen(false);
      knowledgeForm.resetFields();
      void queryClient.invalidateQueries({ queryKey: ["correction"] });
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`更新失败`);
    },
  });

  if (!correction) return null;

  const s = STATUS_MAP[correction.status] ?? { label: String(correction.status), color: "default" };
  const knowledge = correction.knowledge;

  const openKnowledgeEdit = () => {
    if (!knowledge) return;
    knowledgeForm.setFieldsValue({
      title: knowledge.title,
      content: knowledge.content,
      category_id: knowledge.category_id,
      resource_url: knowledge.resource_url ?? undefined,
      resource_type: knowledge.resource_type ?? undefined,
      tags: knowledge.tags ?? undefined,
    });
    setKnowledgeModalOpen(true);
  };

  return (
    <Drawer title={t`纠错详情`} open={open} onClose={onClose} width={560}>
      {/* 纠错信息 */}
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label={t`纠错类型`}>
          {TYPE_MAP[correction.type] ?? correction.type}
        </Descriptions.Item>
        <Descriptions.Item label={t`状态`}>
          <Tag color={s.color}>{t`${s.label}`}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t`描述`}>{correction.description}</Descriptions.Item>
        {correction.images && correction.images.length > 0 && (
          <Descriptions.Item label={t`纠错截图`}>
            <Space>
              {correction.images.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  width={80}
                  height={80}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              ))}
            </Space>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t`提交用户`}>
          {correction.user?.nickname ?? correction.user_id}
        </Descriptions.Item>
        <Descriptions.Item label={t`创建时间`}>{correction.created_at}</Descriptions.Item>
        {correction.review_remark && (
          <Descriptions.Item label={t`审核备注`}>{correction.review_remark}</Descriptions.Item>
        )}
        {correction.review_time && (
          <Descriptions.Item label={t`审核时间`}>{correction.review_time}</Descriptions.Item>
        )}
      </Descriptions>

      {/* 知识卡片信息 */}
      {knowledge && (
        <>
          <Divider>{t`关联知识卡片`}</Divider>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={t`标题`}>{knowledge.title}</Descriptions.Item>
            <Descriptions.Item label={t`内容`}>
              <Text
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {knowledge.content}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t`状态`}>
              <Tag color={knowledge.status === 1 ? "success" : "default"}>
                {knowledge.status === 1 ? t`上架` : t`下架`}
              </Tag>
            </Descriptions.Item>
            {knowledge.tags && knowledge.tags.length > 0 && (
              <Descriptions.Item label={t`标签`}>
                <Space size={[0, 4]} wrap>
                  {knowledge.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
            {knowledge.resource_url && (
              <Descriptions.Item label={t`资源`}>
                {knowledge.resource_type === "image" || knowledge.resource_type === "svg" ? (
                  <Image src={knowledge.resource_url} width={120} style={{ borderRadius: 4 }} />
                ) : (
                  <a href={knowledge.resource_url} target="_blank" rel="noreferrer">
                    {knowledge.resource_url}
                  </a>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
          <Button type="primary" style={{ marginTop: 8 }} onClick={openKnowledgeEdit}>
            {t`修改知识卡片`}
          </Button>
        </>
      )}

      {/* 审核操作 */}
      {correction.status === CorrectionStatus.PENDING && (
        <>
          <Divider>{t`审核操作`}</Divider>
          <Form form={reviewForm} layout="vertical">
            <Form.Item name="review_remark" label={t`审核备注`}>
              <Input.TextArea rows={3} placeholder={t`填写审核意见（可选）`} />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                loading={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    status: CorrectionStatus.ACCEPTED,
                    review_remark: reviewForm.getFieldValue("review_remark"),
                  })
                }
              >
                {t`采纳`}
              </Button>
              <Button
                danger
                loading={reviewMutation.isPending}
                onClick={() =>
                  reviewMutation.mutate({
                    status: CorrectionStatus.REJECTED,
                    review_remark: reviewForm.getFieldValue("review_remark"),
                  })
                }
              >
                {t`驳回`}
              </Button>
            </Space>
          </Form>
        </>
      )}

      <FormModal
        open={knowledgeModalOpen}
        editing={knowledge ? (knowledge as unknown as Knowledge) : null}
        form={knowledgeForm}
        confirmLoading={updateKnowledgeMutation.isPending}
        onCancel={() => {
          setKnowledgeModalOpen(false);
          knowledgeForm.resetFields();
        }}
        onFinish={(values) => updateKnowledgeMutation.mutate(values)}
      />
    </Drawer>
  );
}
