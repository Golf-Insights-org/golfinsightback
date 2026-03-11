export function getPagination(query) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize || "25", 10), 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

