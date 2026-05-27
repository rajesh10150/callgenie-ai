import { Response } from 'express';
interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number, meta?: PaginationMeta) => void;
export declare const sendError: (res: Response, code: string, message: string, statusCode?: number, details?: unknown[]) => void;
export declare const parsePagination: (query: {
    page?: string;
    limit?: string;
}) => {
    page: number;
    limit: number;
    offset: number;
};
export {};
//# sourceMappingURL=response.d.ts.map