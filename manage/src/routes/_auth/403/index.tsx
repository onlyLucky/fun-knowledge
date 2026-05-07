import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useLingui } from "@lingui/react/macro";
import { Home, ShieldAlert } from "lucide-react";
import { Button, Flex, Result, theme } from "antd";

export const Route = createFileRoute("/_auth/403/")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { token } = theme.useToken();

  const goDashboard = () => {
    void navigate({ to: "/dashboard" });
  };

  return (
    <Flex
      flex={1}
      align="center"
      justify="center"
      style={{ minHeight: 0, width: "100%", padding: token.paddingXL }}
    >
      <Result
        // Avoid status="403": antd ignores `icon` for built-in illustrations; keep Lucide as the main icon.
        icon={
          <ShieldAlert size={64} strokeWidth={1.25} color={token.colorTextQuaternary} aria-hidden />
        }
        title="403"
        subTitle={t`抱歉，您没有权限访问此页面。`}
        extra={
          <Button type="primary" icon={<Home size={16} aria-hidden />} onClick={goDashboard}>
            {t`返回首页`}
          </Button>
        }
      />
    </Flex>
  );
}
