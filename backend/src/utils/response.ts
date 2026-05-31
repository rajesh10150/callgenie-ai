import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta
): void => {
  const response: { success: boolean; data: T; meta?: PaginationMeta } = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown[]
): void => {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
};

export const parsePagination = (query: { page?: string; limit?: string }) => {
  const pageRaw = parseInt(query.page || '1', 10);
  const limitRaw = parseInt(query.limit || '25', 10);
  const page = Math.max(1, Number.isNaN(pageRaw) ? 1 : pageRaw);
  const limit = Math.min(100, Math.max(1, Number.isNaN(limitRaw) ? 25 : limitRaw));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};
