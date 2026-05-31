import { AppError, errorHandler } from '../../../src/middleware/errorHandler';
import { mockRes } from '../../helpers/http';
import { Request, NextFunction } from 'express';

describe('middleware/errorHandler', () => {
  const req = {} as Request;
  const next = jest.fn() as NextFunction;

  describe('AppError', () => {
    it('captures status code, code and message', () => {
      const err = new AppError(404, 'NOT_FOUND', 'missing');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('missing');
      expect(err.name).toBe('AppError');
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('errorHandler', () => {
    it('serializes an AppError with its status code', () => {
      const res = mockRes();
      errorHandler(new AppError(403, 'FORBIDDEN', 'nope'), req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'FORBIDDEN', message: 'nope' },
      });
    });

    it('returns a generic 500 for unknown errors', () => {
      const res = mockRes();
      errorHandler(new Error('boom'), req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      });
    });
  });
});
