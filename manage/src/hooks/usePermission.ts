import { useAuthStore } from "@/stores/auth";

export function hasPermission(point: string): boolean {
  return useAuthStore.getState().hasPermission(point);
}

export function usePermission(point: string): boolean {
  const admin = useAuthStore((s) => s.admin);
  if (!admin) return false;
  return useAuthStore.getState().hasPermission(point);
}
