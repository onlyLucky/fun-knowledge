import { useMemo } from "react";
import type { MessageInstance } from "antd/es/message/interface";
import { useLingui } from "@lingui/react/macro";

type MutationLifecycle<TValues> = {
  onMutate?: (values: TValues) => void;
  onSuccess?: (values: TValues) => void;
  onError?: (values: TValues, error: Error) => void;
};

export type CrudToastLifecycles<TCreate, TUpdate> = {
  createLifecycle?: MutationLifecycle<TCreate>;
  updateLifecycle?: MutationLifecycle<TUpdate>;
  deleteLifecycle?: MutationLifecycle<string>;
};

export function useCrudToasts<TCreate, TUpdate>(options: {
  message: MessageInstance;
  resourceKey: string;
}): CrudToastLifecycles<TCreate, TUpdate> {
  const { message, resourceKey } = options;
  const { t } = useLingui();

  const keys = useMemo(
    () => ({
      create: `${resourceKey}-mutation-create`,
      update: `${resourceKey}-mutation-update`,
      delete: `${resourceKey}-mutation-delete`,
    }),
    [resourceKey],
  );

  return useMemo(
    () => ({
      createLifecycle: {
        onSuccess: () => {
          message.success({ content: t`创建成功`, key: keys.create });
        },
        onError: (_values, error) => {
          const msg = error?.message || t`创建失败`;
          message.error({ content: msg, key: keys.create });
        },
      },
      updateLifecycle: {
        onMutate: () => {
          message.loading({ content: t`更新中…`, key: keys.update, duration: 0 });
        },
        onSuccess: () => {
          message.success({ content: t`更新成功`, key: keys.update });
        },
        onError: (_values, error) => {
          const msg = error?.message || t`更新失败`;
          message.error({ content: msg, key: keys.update });
        },
      },
      deleteLifecycle: {
        onMutate: () => {
          message.loading({ content: t`删除中…`, key: keys.delete, duration: 0 });
        },
        onSuccess: () => {
          message.success({ content: t`删除成功`, key: keys.delete });
        },
        onError: (_values, error) => {
          const msg = error?.message || t`删除失败`;
          message.error({ content: msg, key: keys.delete });
        },
      },
    }),
    [keys.create, keys.delete, keys.update, message, t],
  );
}
