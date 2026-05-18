import { z } from "zod/v4";

/* ---------- Admin 角色与权限 ---------- */

export const AdminRole = {
  SUPER_ADMIN: 1,
  CONTENT_ADMIN: 2,
  OPERATIONS: 3,
  REVIEWER: 4,
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

/** 角色 → 前端权限点映射（参考 PRD 权限矩阵） */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  [AdminRole.SUPER_ADMIN]: [
    "knowledge:view",
    "knowledge:create",
    "knowledge:edit",
    "knowledge:delete",
    "knowledge:import",
    "category:view",
    "category:create",
    "category:edit",
    "category:delete",
    "correction:view",
    "correction:review",
    "user:view",
    "user:create",
    "user:edit",
    "user:delete",
    "user-review:view",
    "user-review:review",
    "admin:view",
    "admin:create",
    "admin:edit",
    "admin:delete",
    "config:view",
    "config:edit",
    "log:view",
    "system:view",
  ],
  [AdminRole.CONTENT_ADMIN]: [
    "knowledge:view",
    "knowledge:create",
    "knowledge:edit",
    "knowledge:delete",
    "knowledge:import",
    "category:view",
    "category:create",
    "category:edit",
    "category:delete",
  ],
  [AdminRole.OPERATIONS]: [
    "user:view",
    "user:create",
    "user:edit",
    "user:delete",
    "config:view",
    "config:edit",
    "log:view",
  ],
  [AdminRole.REVIEWER]: [
    "correction:view",
    "correction:review",
    "user-review:view",
    "user-review:review",
  ],
};

/** 根据角色 ID 获取权限列表 */
export function getPermissionsByRole(role: number): string[] {
  return ROLE_PERMISSIONS[role as AdminRole] ?? [];
}

/* ---------- Auth Tokens ---------- */

export const AuthTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type AuthTokens = z.infer<typeof AuthTokensSchema>;

/* ---------- Admin Schema ---------- */

export const AdminSchema = z.object({
  id: z.string(),
  username: z.string(),
  real_name: z.string().nullable().optional(),
  role: z.number(),
});

export type Admin = z.infer<typeof AdminSchema>;

export const AdminLoginResponseSchema = z.object({
  admin: AdminSchema,
  tokens: AuthTokensSchema,
});

export type AdminLoginResponse = z.infer<typeof AdminLoginResponseSchema>;

/* ---------- User（保留兼容） ---------- */

export const UserInterestSchema = z.object({
  category_id: z.string().nullable().optional(),
  category_name: z.string().nullable().optional(),
  tag_name: z.string().nullable().optional(),
  score: z.number(),
  updated_at: z.string().optional(),
});

export const UserProfileSchema = z.object({
  category_interests: z.array(UserInterestSchema),
  tag_interests: z.array(UserInterestSchema),
  total_interest_count: z.number(),
});

export const UserSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  openid: z.string().nullable().optional(),
  status: z.number().optional(),
  streak_days: z.number().optional(),
  total_check_in_days: z.number().optional(),
  favorites_count: z.number().optional(),
  ai_usage_count: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  profile: UserProfileSchema.optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const AuthUserResponseSchema = UserSchema;
export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;

export const RefreshTokenRequestSchema = z.object({
  refresh_token: z.string().min(1),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/* ---------- Login / Register ---------- */

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/** Ant Design Form may submit `""` for an empty optional email */
const registerOptionalEmailSchema = z
  .union([z.string(), z.undefined()])
  .transform((v) => {
    if (v === undefined) return undefined;
    const t = String(v).trim();
    return t === "" ? undefined : t;
  })
  .pipe(z.union([z.string().email(), z.undefined()]));

export const RegisterRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  email: registerOptionalEmailSchema,
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const PermissionsListSchema = z.array(z.string());

export type PermissionsList = z.infer<typeof PermissionsListSchema>;

const BaseMenuNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  permissions: z.array(z.string()).nullable(),
  sort: z.int(),
  hidden: z.boolean(),
});

export type MenuItem =
  | (z.infer<typeof BaseMenuNodeSchema> & {
      kind: "item";
      path: string;
      children: MenuItem[] | null;
    })
  | (z.infer<typeof BaseMenuNodeSchema> & {
      kind: "group";
      path: null;
      children: MenuItem[];
    });

export const MenuItemSchema: z.ZodType<MenuItem> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    BaseMenuNodeSchema.extend({
      kind: z.literal("item"),
      path: z.string(),
      children: z.array(MenuItemSchema).nullable(),
    }),
    BaseMenuNodeSchema.extend({
      kind: z.literal("group"),
      path: z.null(),
      children: z.array(MenuItemSchema),
    }),
  ]),
);

export function ApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    code: z.int(),
    data: dataSchema,
    message: z.string(),
  });
}

export type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};

export function PaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    code: z.int(),
    data: z.object({
      list: z.array(itemSchema),
      total: z.int(),
    }),
    message: z.string(),
  });
}

export type PaginatedData<T> = {
  list: T[];
  total: number;
};

export const SearchParamsSchema = z.object({
  page: z.number().int().positive().catch(1),
  pageSize: z.number().int().positive().catch(10),
  sortField: z.string().nullable().catch(null),
  sortOrder: z.enum(["ascend", "descend"]).nullable().catch(null),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

/** Ant Design Input submits `""` when empty; treat as null for optional email */
const createUserEmailSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
  })
  .pipe(z.union([z.string().email(), z.null()]));

export const CreateUserRequestSchema = z.object({
  username: z.string().min(1),
  email: createUserEmailSchema,
  roles: z.array(z.string()).min(1),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UpdateUserRequestSchema = CreateUserRequestSchema.partial();

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
