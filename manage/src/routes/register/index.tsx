import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Form, Input, Button, Card, App, theme, Typography, Flex } from "antd";
import type { CSSProperties } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLingui } from "@lingui/react/macro";
import { httpClient } from "@/utils/http";
import { useAuthStore } from "@/stores/auth";
import { AUTH_ENDPOINTS } from "@/api/auth";
import { AuthTokensSchema, RegisterRequestSchema } from "@/api/schemas";
import { fetchSessionAndApplyToStore } from "@/utils/session";
import type { RegisterRequest } from "@/api/auth";
import { APP_BRAND_NAME, APP_FAVICON_SRC } from "@/utils/constants";
import { Aurora } from "@/components/Aurora";
import { AppFooter } from "@/components/Layout/AppFooter";
import "../login/index.css";

export const Route = createFileRoute("/register/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useLingui();
  const setTokens = useAuthStore((s) => s.setTokens);
  const { token } = theme.useToken();

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterRequest) => {
      const parsed = RegisterRequestSchema.parse(values);
      const tokens = await httpClient.post(AUTH_ENDPOINTS.register, parsed);
      const validTokens = AuthTokensSchema.parse(tokens);
      setTokens(validTokens);
      await fetchSessionAndApplyToStore();
    },
    onSuccess: () => {
      message.success(t`账号创建成功`);
      void navigate({ to: "/dashboard" });
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`注册失败`);
    },
  });

  const shellStyle: CSSProperties = {
    position: "relative",
    isolation: "isolate",
    minHeight: "100vh",
    backgroundColor: token.colorBgLayout,
    color: token.colorText,
  };

  const contentStyle: CSSProperties = {
    position: "relative",
    zIndex: 1,
    flex: "1 1 0%",
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
  };

  const cardStyle: CSSProperties = {
    width: "100%",
    maxWidth: 384,
    background: `color-mix(in srgb, ${token.colorBgContainer} 44%, transparent)`,
    backdropFilter: "blur(18px) saturate(1.35)",
    WebkitBackdropFilter: "blur(18px) saturate(1.35)",
    borderColor: token.colorBorderSecondary,
    boxShadow: token.boxShadow,
    ["--login-card-fallback-bg" as string]: token.colorBgElevated,
  };

  return (
    <Flex vertical style={shellStyle}>
      <Aurora />
      <Flex vertical style={contentStyle}>
        <Flex
          flex={1}
          align="center"
          justify="center"
          style={{ padding: token.padding, minHeight: 0 }}
        >
          <Card
            className="login-page__card"
            style={cardStyle}
            styles={{
              body: { padding: token.paddingLG, background: "transparent" },
            }}
          >
            <Flex
              align="center"
              justify="center"
              gap={token.margin}
              wrap="wrap"
              style={{ marginBottom: token.marginLG }}
            >
              <img
                src={APP_FAVICON_SRC}
                alt=""
                width={32}
                height={32}
                draggable={false}
                style={{ display: "block", flexShrink: 0 }}
              />
              <Typography.Title
                level={3}
                style={{
                  margin: 0,
                  fontWeight: "bold",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {APP_BRAND_NAME}
              </Typography.Title>
            </Flex>

            <Form
              layout="vertical"
              onFinish={(values) => {
                const payload = RegisterRequestSchema.parse(values);
                registerMutation.mutate(payload);
              }}
              initialValues={{ username: "", password: "", confirmPassword: "", email: "" }}
              validateTrigger={"onBlur"}
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label={<span>{t`用户名`}</span>}
                rules={[{ required: true, message: t`请输入用户名` }]}
              >
                <Input placeholder="请输入用户名" size="large" />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span>{t`邮箱地址`}</span>}
                rules={[{ type: "email", message: t`请输入有效的邮箱地址` }]}
              >
                <Input placeholder="请输入邮箱地址" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span>{t`密码`}</span>}
                rules={[
                  { required: true, message: t`请输入密码` },
                  { min: 6, message: t`密码至少需要 6 个字符` },
                ]}
              >
                <Input.Password placeholder={t`至少输入 6 个字符`} size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span>{t`确认密码`}</span>}
                dependencies={["password"]}
                rules={[
                  { required: true, message: t`请确认密码` },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t`两次输入的密码不一致`));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder={t`再次输入密码`} size="large" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, marginTop: token.marginLG }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={registerMutation.isPending}
                  block
                  size="large"
                >
                  {t`创建账号`}
                </Button>
              </Form.Item>

              <Flex justify="center" style={{ marginTop: token.margin }}>
                <Typography.Text type="secondary">
                  {t`已有账号？`}{" "}
                  <Link to="/login" style={{ color: token.colorPrimary }}>
                    {t`登录`}
                  </Link>
                </Typography.Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
        <Flex
          vertical
          align="center"
          style={{
            padding: `${token.paddingSM}px ${token.padding}px`,
            textAlign: "center",
          }}
        >
          <AppFooter />
        </Flex>
      </Flex>
    </Flex>
  );
}
