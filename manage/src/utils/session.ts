import { httpClient } from "@/utils/http";
import { AUTH_ENDPOINTS } from "@/api/auth";
import { AdminLoginResponseSchema, getPermissionsByRole } from "@/api/schemas";
import { APP_MENU_TREE, filterMenuTreeByPermissions } from "@/utils/appMenu";
import { useAuthStore } from "@/stores/auth";

/**
 * 管理员登录：POST /api/admin/v1/auth/login
 * 服务端一次返回 { admin, tokens }
 */
export async function adminLogin(username: string, password: string): Promise<void> {
  const res = await httpClient.post(AUTH_ENDPOINTS.login, { username, password });
  const { admin, tokens } = AdminLoginResponseSchema.parse(res);
  const { setTokens, setAdmin, setMenus } = useAuthStore.getState();
  setTokens(tokens);
  setAdmin(admin);
  const permissions = getPermissionsByRole(admin.role);
  const menus = filterMenuTreeByPermissions(APP_MENU_TREE, permissions);
  setMenus(menus);
}

/**
 * 获取管理员 profile 并更新 store（用于页面刷新后恢复会话）
 */
export async function fetchSessionAndApplyToStore(): Promise<void> {
  const res = await httpClient.get(AUTH_ENDPOINTS.profile);
  const admin = (await import("@/api/schemas")).AdminSchema.parse(res);
  const { setAdmin, setMenus } = useAuthStore.getState();
  setAdmin(admin);
  const permissions = getPermissionsByRole(admin.role);
  const menus = filterMenuTreeByPermissions(APP_MENU_TREE, permissions);
  setMenus(menus);
}
