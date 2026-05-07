import { createFileRoute } from "@tanstack/react-router";
import { Card, Form, Input, Button, App, theme, Flex, Typography } from "antd";
import { useLingui } from "@lingui/react/macro";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/utils/http";
import { CONFIG_ENDPOINTS, SystemConfigSchema } from "@/api/config";
import type { SystemConfig } from "@/api/config";
import { z } from "zod/v4";
import { Save } from "lucide-react";

const SearchParamsSchema = z.object({});

export const Route = createFileRoute("/_auth/config/")({
  validateSearch: (search) => SearchParamsSchema.parse(search),
  component: ConfigPage,
});

function ConfigPage() {
  const { t } = useLingui();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["config"],
    queryFn: () => httpClient.get(CONFIG_ENDPOINTS.list),
    select: (raw) => SystemConfigSchema.array().parse(raw),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await httpClient.put(CONFIG_ENDPOINTS.update, { config_key: key, config_value: value });
    },
    onSuccess: () => {
      message.success(t`配置已更新`);
      void queryClient.invalidateQueries({ queryKey: ["config"] });
    },
    onError: (err) => {
      message.error(err instanceof Error ? err.message : t`更新失败`);
    },
  });

  const grouped = (data ?? []).reduce<Record<string, SystemConfig[]>>((acc, item) => {
    const group = item.group ?? "General";
    (acc[group] ??= []).push(item);
    return acc;
  }, {});

  const handleSave = (key: string) => {
    const value = form.getFieldValue(key);
    if (value !== undefined) {
      updateMutation.mutate({ key, value });
    }
  };

  return (
    <Flex
      vertical
      gap={token.marginLG}
      style={{ flex: "1 1 0%", overflow: "auto", padding: token.paddingSM }}
    >
      {isLoading ? (
        <Card loading />
      ) : (
        Object.entries(grouped).map(([group, items]) => (
          <Card key={group} title={<Typography.Text strong>{group}</Typography.Text>}>
            <Form
              form={form}
              layout="vertical"
              initialValues={Object.fromEntries(items.map((i) => [i.config_key, i.config_value]))}
            >
              {items.map((item) => (
                <Form.Item
                  key={item.id}
                  name={item.config_key}
                  label={item.config_key}
                  extra={item.description}
                >
                  <Flex gap={token.marginSM}>
                    <Input style={{ flex: 1 }} />
                    <Button
                      icon={<Save size={token.fontSize} />}
                      loading={updateMutation.isPending}
                      onClick={() => handleSave(item.config_key)}
                    >
                      {t`保存`}
                    </Button>
                  </Flex>
                </Form.Item>
              ))}
            </Form>
          </Card>
        ))
      )}
    </Flex>
  );
}
