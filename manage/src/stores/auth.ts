import type { AuthTokens, Admin, MenuItem } from "@/api/schemas";
import { getPermissionsByRole } from "@/api/schemas";
import { createPersistentStore } from "./createPersistentStore";

interface AuthState {
  tokens: AuthTokens | null;
  admin: Admin | null;
  menus: MenuItem[];
  isAuthenticated: boolean;
  setTokens: (tokens: AuthTokens) => void;
  setAdmin: (admin: Admin) => void;
  setMenus: (menus: MenuItem[]) => void;
  hasPermission: (point: string) => boolean;
  getPermissions: () => string[];
  logout: () => void;
}

export const useAuthStore = createPersistentStore<AuthState>(
  (set, get) => ({
    tokens: null,
    admin: null,
    menus: [],
    isAuthenticated: false,

    setTokens: (tokens) => set({ tokens, isAuthenticated: true }),
    setAdmin: (admin) => set({ admin }),
    setMenus: (menus) => set({ menus }),

    hasPermission: (point) => {
      const { admin } = get();
      if (!admin) return false;
      const permissions = getPermissionsByRole(admin.role);
      return permissions.includes(point);
    },

    getPermissions: () => {
      const { admin } = get();
      if (!admin) return [];
      return getPermissionsByRole(admin.role);
    },

    logout: () =>
      set({
        tokens: null,
        admin: null,
        menus: [],
        isAuthenticated: false,
      }),
  }),
  {
    name: "auth-storage",
    partialize: (state) => ({
      tokens: state.tokens,
      isAuthenticated: state.isAuthenticated,
    }),
    merge: (persistedState, currentState) => {
      const p = persistedState as Partial<Pick<AuthState, "tokens" | "isAuthenticated">> | null;
      return {
        ...currentState,
        tokens: p?.tokens ?? currentState.tokens,
        isAuthenticated: p?.isAuthenticated ?? currentState.isAuthenticated,
        admin: null,
        menus: [],
      };
    },
  },
);

export function getAuthTokens(): AuthTokens | null {
  return useAuthStore.getState().tokens;
}

export function getAccessToken(): string | null {
  return useAuthStore.getState().tokens?.accessToken ?? null;
}
