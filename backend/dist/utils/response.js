"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, statusCode = 200, meta) => {
    const response = {
        success: true,
        data,
    };
    if (meta) {
        response.meta = meta;
    }
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, code, message, statusCode = 400, details) => {
    res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    });
};
exports.sendError = sendError;
const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '25', 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};
exports.parsePagination = parsePagination;
//# sourceMappingURL=response.js.map