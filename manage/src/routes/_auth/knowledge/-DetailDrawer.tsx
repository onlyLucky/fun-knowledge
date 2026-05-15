import { Drawer, Descriptions, Tag, Image, Typography, Divider } from "antd";
import { useLingui } from "@lingui/react/macro";
import { KnowledgeStatus } from "@/api/knowledge";
import type { Knowledge } from "@/api/knowledge";
import { API_BASE_URL } from "@/utils/constants";

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  [KnowledgeStatus.OFFLINE]: { label: "下架", color: "default" },
  [KnowledgeStatus.ONLINE]: { label: "上架", color: "success" },
};

const RESOURCE_TYPE_MAP: Record<string, string> = {
  image: "图片",
  video: "视频",
  audio: "音频",
  model_3d: "3D模型",
  webpage: "网页",
};

function resolveUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API_BASE_URL || window.location.origin;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export type DetailDrawerProps = {
  open: boolean;
  knowledge: Knowledge | null;
  onClose: () => void;
};

export function DetailDrawer({ open, knowledge, onClose }: DetailDrawerProps) {
  const { t } = useLingui();

  if (!knowledge) return null;

  const s = STATUS_MAP[knowledge.status] ?? { label: String(knowledge.status), color: "default" };

  return (
    <Drawer title={t`知识详情`} open={open} onClose={onClose} width={520}>
      <Descriptions column={1} size="small" bordered styles={{ label: { whiteSpace: "nowrap" } }}>
        <Descriptions.Item label={t`标题`}>{knowledge.title}</Descriptions.Item>
        <Descriptions.Item label={t`分类`}>
          {knowledge.category?.name ?? knowledge.category_id}
        </Descriptions.Item>
        <Descriptions.Item label={t`状态`}>
          <Tag color={s.color}>{s.label}</Tag>
        </Descriptions.Item>
        {knowledge.tags && knowledge.tags.length > 0 && (
          <Descriptions.Item label={t`标签`}>
            {knowledge.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t`内容`}>
          <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}>
            {knowledge.content}
          </Typography.Paragraph>
        </Descriptions.Item>
        {knowledge.resource_url && (
          <Descriptions.Item label={t`资源`}>
            {knowledge.resource_type === "image" ? (
              <Image
                src={resolveUrl(knowledge.resource_url)}
                width={200}
                style={{ borderRadius: 4 }}
              />
            ) : knowledge.resource_type === "video" ? (
              <video
                src={resolveUrl(knowledge.resource_url)}
                controls
                style={{ maxWidth: "100%", borderRadius: 4 }}
              />
            ) : (
              <Typography.Link href={resolveUrl(knowledge.resource_url)} target="_blank">
                {knowledge.resource_url}
              </Typography.Link>
            )}
          </Descriptions.Item>
        )}
        {knowledge.resource_type && (
          <Descriptions.Item label={t`资源类型`}>
            {RESOURCE_TYPE_MAP[knowledge.resource_type] ?? knowledge.resource_type}
          </Descriptions.Item>
        )}
        {knowledge.source && (
          <Descriptions.Item label={t`来源`}>{knowledge.source}</Descriptions.Item>
        )}

        <Descriptions.Item label={t`排序权重`}>{knowledge.sort_weight ?? 0}</Descriptions.Item>
      </Descriptions>

      <Divider plain style={{ margin: "16px 0" }}>{t`数据统计`}</Divider>

      <Descriptions column={3} size="small" bordered>
        <Descriptions.Item label={t`浏览量`}>{knowledge.view_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`收藏数`}>{knowledge.favorite_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`纠错数`}>{knowledge.correction_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`AI解读`}>{knowledge.ai_extend_count ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`质量分`}>{knowledge.quality_score ?? 0}</Descriptions.Item>
        <Descriptions.Item label={t`运营权重`}>{knowledge.weight ?? 0}</Descriptions.Item>
      </Descriptions>

      <Divider plain style={{ margin: "16px 0" }}>{t`数据时间`}</Divider>

      <Descriptions
        column={1}
        size="small"
        bordered
        styles={{ label: { whiteSpace: "nowrap" }, content: { whiteSpace: "nowrap" } }}
      >
        <Descriptions.Item label={t`创建时间`}>
          {knowledge.created_at ? new Date(knowledge.created_at).toLocaleString("zh-CN") : "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t`更新时间`}>
          {knowledge.updated_at ? new Date(knowledge.updated_at).toLocaleString("zh-CN") : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
}
