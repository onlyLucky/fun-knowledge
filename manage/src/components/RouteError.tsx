import { Button, Result, theme } from "antd";
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useLingui } from "@lingui/react/macro";

export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const { token } = theme.useToken();
  const { t } = useLingui();

  const detail = error instanceof Error ? error.message : String(error);

  return (
    <div style={{ padding: token.paddingLG, maxWidth: 560, margin: "48px auto" }}>
      <Result
        status="error"
        title={t`出错了`}
        subTitle={detail || t`请重试或返回仪表盘。`}
        extra={
          <Button type="primary" onClick={() => void router.invalidate()}>
            {t`重试`}
          </Button>
        }
      />
    </div>
  );
}
