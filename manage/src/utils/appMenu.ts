import type { MenuItem } from "@/api/schemas";

export const APP_MENU_TREE: MenuItem[] = [
  {
    id: "g-content",
    kind: "group",
    name: "Content",
    path: null,
    icon: "IconLucideSparkles",
    permissions: null,
    sort: 0,
    hidden: false,
    children: [
      {
        id: "1",
        kind: "item",
        name: "Dashboard",
        path: "/dashboard",
        icon: "IconLucideLayoutDashboard",
        children: null,
        permissions: null,
        sort: 0,
        hidden: false,
      },
      {
        id: "2",
        kind: "item",
        name: "Knowledge",
        path: "/knowledge",
        icon: "IconLucideBookOpen",
        children: null,
        permissions: ["knowledge:view"],
        sort: 1,
        hidden: false,
      },
      {
        id: "3",
        kind: "item",
        name: "Category",
        path: "/category",
        icon: "IconLucideFolderTree",
        children: null,
        permissions: ["category:view"],
        sort: 2,
        hidden: false,
      },
      {
        id: "4",
        kind: "item",
        name: "Correction",
        path: "/correction",
        icon: "IconLucideMessageSquareWarning",
        children: null,
        permissions: ["correction:view"],
        sort: 3,
        hidden: false,
      },
      {
        id: "9",
        kind: "item",
        name: "UserReview",
        path: "/user-review",
        icon: "IconLucideUserCheck",
        children: null,
        permissions: ["user-review:view"],
        sort: 4,
        hidden: false,
      },
    ],
  },
  {
    id: "g-system",
    kind: "group",
    name: "System",
    path: null,
    icon: "IconLucideSettings",
    permissions: null,
    sort: 1,
    hidden: false,
    children: [
      {
        id: "5",
        kind: "item",
        name: "Users",
        path: "/users",
        icon: "IconLucideUsers",
        children: null,
        permissions: ["user:view"],
        sort: 0,
        hidden: false,
      },
      {
        id: "6",
        kind: "item",
        name: "Admin",
        path: "/admin",
        icon: "IconLucideShieldCheck",
        children: null,
        permissions: ["admin:view"],
        sort: 1,
        hidden: false,
      },
      {
        id: "7",
        kind: "item",
        name: "Config",
        path: "/config",
        icon: "IconLucideSlidersHorizontal",
        children: null,
        permissions: ["config:view"],
        sort: 3,
        hidden: false,
      },
      {
        id: "8",
        kind: "item",
        name: "Logs",
        path: "/logs",
        icon: "IconLucideScrollText",
        children: null,
        permissions: ["log:view"],
        sort: 4,
        hidden: false,
      },
      {
        id: "10",
        kind: "item",
        name: "SystemManagement",
        path: "/system",
        icon: "IconLucideWrench",
        children: null,
        permissions: ["system:view"],
        sort: 2,
        hidden: false,
      },
    ],
  },
];

function hasRequiredPermissions(
  required: string[] | null | undefined,
  granted: Set<string>,
): boolean {
  if (!required || required.length === 0) return true;
  return required.every((p) => granted.has(p));
}

export function filterMenuTreeByPermissions(
  nodes: MenuItem[],
  permissionList: string[],
): MenuItem[] {
  const granted = new Set(permissionList);

  const walk = (list: MenuItem[]): MenuItem[] =>
    list
      .map((node) => {
        if (!hasRequiredPermissions(node.permissions ?? null, granted)) return null;

        if (node.kind === "group") {
          const children = walk(node.children);
          if (children.length === 0) return null;
          return { ...node, children };
        }

        if (node.children?.length) {
          const children = walk(node.children);
          if (children.length === 0) return null;
          return { ...node, children };
        }

        return node;
      })
      .filter((n): n is MenuItem => n != null);

  return walk(nodes);
}

export function normalizeAppPath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

export function requiredPermissionForPath(pathname: string): string | null {
  const p = normalizeAppPath(pathname);
  const map: Record<string, string | null> = {
    "/dashboard": null,
    "/knowledge": "knowledge:view",
    "/category": "category:view",
    "/correction": "correction:view",
    "/user-review": "user-review:view",
    "/users": "user:view",
    "/admin": "admin:view",
    "/config": "config:view",
    "/logs": "log:view",
    "/system": "system:view",
    "/403": null,
  };
  return map[p] ?? null;
}

export function canAccessPath(pathname: string, permissions: string[] | undefined): boolean {
  const required = requiredPermissionForPath(pathname);
  if (required == null) return true;
  if (!permissions?.length) return false;
  return permissions.includes(required);
}
