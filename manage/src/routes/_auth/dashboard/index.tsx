import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  Col,
  Row,
  Typography,
  theme,
  Flex,
  Skeleton,
  Table,
  Progress,
  Tabs,
  Statistic,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useLingui } from "@lingui/react/macro";
import { Sparkles, AlertTriangle, Users, TrendingUp, MousePointerClick } from "lucide-react";
import { httpClient } from "@/utils/http";
import { DASHBOARD_ENDPOINTS, RecommendStatsSchema } from "@/api/dashboard";
import type { RecommendStats } from "@/api/dashboard";

const { Text } = Typography;

export const Route = createFileRoute("/_auth/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useLingui();
  const { token } = theme.useToken();

  const { data, isLoading } = useQuery<RecommendStats>({
    queryKey: ["dashboard", "recommend-stats"],
    queryFn: () => httpClient.get(DASHBOARD_ENDPOINTS.recommendStats),
    select: (raw) => RecommendStatsSchema.parse(raw),
    staleTime: 60_000,
  });

  if (isLoading || !data) {
    return <DashboardSkeleton token={token} />;
  }

  const {
    realtime,
    quality_distribution,
    hot_ranking,
    quality_alerts,
    category_stats,
    category_recommend_stats,
    user_stats,
  } = data;

  const qualityTotal =
    quality_distribution.excellent +
    quality_distribution.normal +
    quality_distribution.low +
    quality_distribution.unevaluated;

  return (
    <Flex vertical gap={token.marginLG}>
      {/* Top Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: token.paddingLG } }}>
            <Statistic
              title={t`今日推荐次数`}
              value={realtime.today_recommend_count}
              prefix={<TrendingUp size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: token.paddingLG } }}>
            <Statistic
              title={t`今日点击率`}
              value={realtime.today_click_rate}
              suffix="%"
              prefix={<MousePointerClick size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: token.paddingLG } }}>
            <Statistic
              title={t`今日AI延伸解读率`}
              value={realtime.today_ai_extend_rate}
              suffix="%"
              prefix={<Sparkles size={16} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card styles={{ body: { padding: token.paddingLG } }}>
            <Statistic
              title={t`总用户数`}
              value={user_stats.total_users}
              prefix={<Users size={16} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quality Distribution + Category Analysis */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t`内容质量分布`} styles={{ body: { padding: token.paddingLG } }}>
            <Flex vertical gap={token.marginMD}>
              {qualityTotal > 0 ? (
                <>
                  <Flex justify="space-between">
                    <Text>{t`优质 (>=15分)`}</Text>
                    <Text strong>{quality_distribution.excellent}</Text>
                  </Flex>
                  <Progress
                    percent={Math.round((quality_distribution.excellent / qualityTotal) * 100)}
                    strokeColor={token.colorSuccess}
                    showInfo={false}
                  />
                  <Flex justify="space-between">
                    <Text>{t`普通 (5-15分)`}</Text>
                    <Text strong>{quality_distribution.normal}</Text>
                  </Flex>
                  <Progress
                    percent={Math.round((quality_distribution.normal / qualityTotal) * 100)}
                    strokeColor={token.colorPrimary}
                    showInfo={false}
                  />
                  <Flex justify="space-between">
                    <Text>{t`低质 (<5分)`}</Text>
                    <Text strong>{quality_distribution.low}</Text>
                  </Flex>
                  <Progress
                    percent={Math.round((quality_distribution.low / qualityTotal) * 100)}
                    strokeColor={token.colorWarning}
                    showInfo={false}
                  />
                  <Flex justify="space-between">
                    <Text>{t`待评估 (浏览<100)`}</Text>
                    <Text strong>{quality_distribution.unevaluated}</Text>
                  </Flex>
                  <Progress
                    percent={Math.round((quality_distribution.unevaluated / qualityTotal) * 100)}
                    strokeColor={token.colorTextQuaternary}
                    showInfo={false}
                  />
                </>
              ) : (
                <Text type="secondary">{t`暂无数据`}</Text>
              )}
            </Flex>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t`类目分析`} styles={{ body: { padding: token.paddingLG } }}>
            <Table
              dataSource={category_stats}
              rowKey="category_id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
              columns={[
                { title: t`类目`, dataIndex: "name", key: "name" },
                {
                  title: t`内容数`,
                  dataIndex: "knowledge_count",
                  key: "knowledge_count",
                  width: 80,
                },
                { title: t`总浏览`, dataIndex: "total_views", key: "total_views", width: 90 },
                {
                  title: t`总收藏`,
                  dataIndex: "total_favorites",
                  key: "total_favorites",
                  width: 90,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Hot Ranking + Quality Alerts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t`热度排行`} styles={{ body: { padding: token.paddingLG } }}>
            <Tabs
              items={[
                {
                  key: "view",
                  label: t`浏览量`,
                  children: (
                    <Table
                      dataSource={hot_ranking.top_view}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        { title: t`浏览量`, dataIndex: "view_count", key: "view_count", width: 80 },
                      ]}
                    />
                  ),
                },
                {
                  key: "favorite",
                  label: t`收藏量`,
                  children: (
                    <Table
                      dataSource={hot_ranking.top_favorite}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        {
                          title: t`收藏量`,
                          dataIndex: "favorite_count",
                          key: "favorite_count",
                          width: 80,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "ai_extend",
                  label: t`AI解读`,
                  children: (
                    <Table
                      dataSource={hot_ranking.top_ai_extend}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        {
                          title: t`AI解读`,
                          dataIndex: "ai_extend_count",
                          key: "ai_extend_count",
                          width: 80,
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <>
                {t`低质预警`}{" "}
                <AlertTriangle size={16} style={{ color: token.colorWarning, marginLeft: 8 }} />
              </>
            }
            styles={{ body: { padding: token.paddingLG } }}
          >
            <Tabs
              items={[
                {
                  key: "low_fav",
                  label: t`收藏率<3%`,
                  children: (
                    <Table
                      dataSource={quality_alerts.low_favorite_rate}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        {
                          title: t`收藏率`,
                          dataIndex: "favorite_rate",
                          key: "favorite_rate",
                          width: 80,
                          render: (v: number) => `${v}%`,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "low_ai",
                  label: t`AI解读率<5%`,
                  children: (
                    <Table
                      dataSource={quality_alerts.low_ai_rate}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        {
                          title: t`AI解读率`,
                          dataIndex: "ai_extend_rate",
                          key: "ai_extend_rate",
                          width: 80,
                          render: (v: number) => `${v}%`,
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "high_correction",
                  label: t`高纠错`,
                  children: (
                    <Table
                      dataSource={quality_alerts.high_correction}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 300 }}
                      columns={[
                        { title: t`标题`, dataIndex: "title", key: "title", ellipsis: true },
                        {
                          title: t`纠错次数`,
                          dataIndex: "correction_count",
                          key: "correction_count",
                          width: 80,
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Recommend Stats + User Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t`类目推荐分析`} styles={{ body: { padding: token.paddingLG } }}>
            <Table
              dataSource={category_recommend_stats}
              rowKey="category_id"
              size="small"
              pagination={false}
              scroll={{ y: 300 }}
              columns={[
                { title: t`类目`, dataIndex: "name", key: "name" },
                {
                  title: t`推荐次数`,
                  dataIndex: "recommend_count",
                  key: "recommend_count",
                  width: 90,
                },
                { title: t`点击次数`, dataIndex: "click_count", key: "click_count", width: 90 },
                {
                  title: t`点击率`,
                  dataIndex: "click_rate",
                  key: "click_rate",
                  width: 80,
                  render: (v: number) => `${v}%`,
                },
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={t`用户分析`} styles={{ body: { padding: token.paddingLG } }}>
            <Row gutter={[16, 16]} style={{ marginBottom: token.marginMD }}>
              <Col span={8}>
                <Statistic title={t`总用户`} value={user_stats.total_users} />
              </Col>
              <Col span={8}>
                <Statistic title={t`7日新增`} value={user_stats.new_users_7d} />
              </Col>
              <Col span={8}>
                <Statistic title={t`7日活跃`} value={user_stats.active_users_7d} />
              </Col>
            </Row>
            <Tabs
              items={[
                {
                  key: "categories",
                  label: t`兴趣类目Top`,
                  children: (
                    <Table
                      dataSource={user_stats.top_interest_categories}
                      rowKey="category_id"
                      size="small"
                      pagination={false}
                      scroll={{ y: 200 }}
                      columns={[
                        { title: t`类目`, dataIndex: "name", key: "name" },
                        { title: t`用户数`, dataIndex: "user_count", key: "user_count", width: 80 },
                      ]}
                    />
                  ),
                },
                {
                  key: "tags",
                  label: t`兴趣标签Top`,
                  children: (
                    <Table
                      dataSource={user_stats.top_interest_tags}
                      rowKey="tag_name"
                      size="small"
                      pagination={false}
                      scroll={{ y: 200 }}
                      columns={[
                        { title: t`标签`, dataIndex: "tag_name", key: "tag_name" },
                        { title: t`用户数`, dataIndex: "user_count", key: "user_count", width: 80 },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Flex>
  );
}

function DashboardSkeleton({ token }: { token: ReturnType<typeof theme.useToken>["token"] }) {
  return (
    <Flex vertical gap={token.marginLG}>
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card styles={{ body: { padding: token.paddingLG } }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: "60%", height: 16, marginBottom: 8 }}
              />
              <Skeleton.Input active style={{ width: "40%", height: 32 }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Skeleton.Input active style={{ width: 100, height: 20 }} />}
            styles={{ body: { padding: token.paddingLG } }}
          >
            {[0, 1, 2].map((i) => (
              <Skeleton.Input
                key={i}
                active
                style={{ width: "100%", height: 24, marginBottom: 12 }}
              />
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Skeleton.Input active style={{ width: 100, height: 20 }} />}
            styles={{ body: { padding: token.paddingLG } }}
          >
            {[0, 1, 2].map((i) => (
              <Skeleton.Input
                key={i}
                active
                style={{ width: "100%", height: 24, marginBottom: 12 }}
              />
            ))}
          </Card>
        </Col>
      </Row>
    </Flex>
  );
}
