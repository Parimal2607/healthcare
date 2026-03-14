export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function parsePagination(searchParams: URLSearchParams, defaults?: Partial<PaginationParams>): PaginationParams {
  const defaultPage = defaults?.page ?? 1;
  const defaultPageSize = defaults?.pageSize ?? 10;

  const pageRaw = Number(searchParams.get("page"));
  const pageSizeRaw = Number(searchParams.get("pageSize"));

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : defaultPage;
  const pageSize = Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 ? Math.floor(pageSizeRaw) : defaultPageSize;

  return { page, pageSize: Math.min(pageSize, 100) };
}

export function buildPagination(page: number, pageSize: number, total: number): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { page, pageSize, total, totalPages };
}