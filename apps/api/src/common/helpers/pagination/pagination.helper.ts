import { PaginationMeta } from './paginated-response.interface';

interface PaginateParams {
  page?: number;
  limit?: number;
  maxLimit: number;
}

interface PaginateResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * Computes skip/take from page/limit, enforcing min/max bounds.
 */
export function paginate(params: PaginateParams): PaginateResult {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(
    params.maxLimit,
    Math.max(1, params.limit ?? params.maxLimit),
  );
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

/**
 * Builds the pagination metadata object for responses.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
