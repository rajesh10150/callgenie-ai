import { sendSuccess, sendError, parsePagination } from '../../../src/utils/response';
import { mockRes } from '../../helpers/http';

describe('utils/response', () => {
  describe('sendSuccess', () => {
    it('sends a 200 success payload by default', () => {
      const res = mockRes();
      sendSuccess(res, { id: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual({ success: true, data: { id: 1 } });
    });

    it('honors a custom status code', () => {
      const res = mockRes();
      sendSuccess(res, { id: 1 }, 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('includes pagination meta when provided', () => {
      const res = mockRes();
      const meta = { page: 2, limit: 25, total: 100, totalPages: 4 };
      sendSuccess(res, [], 200, meta);
      expect(res.body).toEqual({ success: true, data: [], meta });
    });
  });

  describe('sendError', () => {
    it('sends a 400 error payload by default', () => {
      const res = mockRes();
      sendError(res, 'BAD', 'bad request');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'BAD', message: 'bad request' },
      });
    });

    it('honors a custom status code and details', () => {
      const res = mockRes();
      sendError(res, 'X', 'msg', 422, [{ field: 'a' }]);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.body).toEqual({
        success: false,
        error: { code: 'X', message: 'msg', details: [{ field: 'a' }] },
      });
    });
  });

  describe('parsePagination', () => {
    it('defaults to page 1, limit 25', () => {
      expect(parsePagination({})).toEqual({ page: 1, limit: 25, offset: 0 });
    });

    it('computes offset from page and limit', () => {
      expect(parsePagination({ page: '3', limit: '10' })).toEqual({
        page: 3,
        limit: 10,
        offset: 20,
      });
    });

    it('clamps limit to a maximum of 100', () => {
      expect(parsePagination({ limit: '500' }).limit).toBe(100);
    });

    it('clamps page and limit to a minimum of 1', () => {
      expect(parsePagination({ page: '0', limit: '0' })).toEqual({
        page: 1,
        limit: 1,
        offset: 0,
      });
    });

    it('falls back to defaults for non-numeric input', () => {
      expect(parsePagination({ page: 'abc', limit: 'xyz' })).toEqual({
        page: 1,
        limit: 25,
        offset: 0,
      });
    });
  });
});
