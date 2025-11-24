export function getPaginationMeta(total: number, page: number, limit: number) {
  const total_pages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}
