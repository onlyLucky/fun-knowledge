import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";
import { MainLayout } from "@/components/Layout/MainLayout";
import { canAccessPath, normalizeAppPath } from "@/utils/appMenu";
import { fetchSessionAndApplyToStore } from "@/utils/session";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, admin, tokens } = useAuthStore.getState();
    if (!isAuthenticated || !tokens) {
      throw redirect({ to: "/login" });
    }

    // admin 已从 localStorage 恢复，跳过 profile 请求
    if (!admin) {
      try {
        await fetchSessionAndApplyToStore();
      } catch {
        useAuthStore.getState().logout();
        throw redirect({ to: "/login" });
      }
    }

    const permissions = useAuthStore.getState().getPermissions();
    const path = normalizeAppPath(location.pathname);
    if (path === "/403") return;

    if (!canAccessPath(location.pathname, permissions)) {
      throw redirect({ to: "/403" });
    }
  },
  component: MainLayout,
});
