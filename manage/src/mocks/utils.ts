export function vercelAvatarUrl(username: string): string {
  return `https://vercel.com/api/www/avatar?u=${encodeURIComponent(username)}`;
}

export interface User {
  id: string;
  nickname?: string | null;
  email?: string | null;
  status?: number;
  [key: string]: any;
}

export interface FilterOptions {
  keyword?: string;
  role?: string;
  status?: string;
}

export function filterUsers(users: User[], options: FilterOptions): User[] {
  let filtered = [...users];

  if (options.keyword) {
    filtered = filtered.filter(
      (u) =>
        (u.nickname && u.nickname.includes(options.keyword!)) ||
        (u.email && u.email.includes(options.keyword!)),
    );
  }

  if (options.status) {
    const statusNum = Number(options.status);
    filtered = filtered.filter((u) => u.status === statusNum);
  }

  return filtered;
}

export function paginateList<T>(items: T[], limit: number, offset: number): T[] {
  return items.slice(offset, offset + limit);
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  const limit = Number(searchParams.get("limit") ?? searchParams.get("pageSize") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);
  const page = Number(searchParams.get("page") ?? 1);

  const actualOffset = searchParams.get("offset") !== null ? offset : (page - 1) * limit;

  return { limit, offset: actualOffset };
}
