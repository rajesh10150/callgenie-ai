import { mockRes } from '../../helpers/http';
import { chain } from '../../helpers/supabase';
import { Response, NextFunction } from 'express';

const getUser = jest.fn();
const from = jest.fn();

jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: {
    auth: { getUser: (...a: unknown[]) => getUser(...a) },
    from: (...a: unknown[]) => from(...a),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { authenticate, requireRole, AuthenticatedRequest } from '../../../src/middleware/auth';

describe('middleware/auth', () => {
  describe('authenticate', () => {
    it('rejects a missing authorization header with 401', async () => {
      const req = { headers: {} } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect((res.body as { error: { code: string } }).error.code).toBe('UNAUTHORIZED');
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects a non-Bearer header with 401', async () => {
      const req = { headers: { authorization: 'Basic abc' } } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects an invalid/expired token with 401', async () => {
      getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } });
      const req = { headers: { authorization: 'Bearer bad' } } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect((res.body as { error: { message: string } }).error.message).toBe('Invalid or expired token');
    });

    it('populates req.user with membership info and calls next', async () => {
      getUser.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null });
      from.mockReturnValue(chain({ data: { org_id: 'org1', role: 'admin' }, error: null }));
      const req = { headers: { authorization: 'Bearer good' } } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toEqual({ id: 'u1', email: 'a@b.com', orgId: 'org1', role: 'admin' });
    });

    it('defaults email/org/role when membership and email are absent', async () => {
      getUser.mockResolvedValue({ data: { user: { id: 'u2', email: null } }, error: null });
      from.mockReturnValue(chain({ data: null, error: null }));
      const req = { headers: { authorization: 'Bearer good' } } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(req.user).toEqual({ id: 'u2', email: '', orgId: '', role: 'viewer' });
    });

    it('returns 500 when token verification throws', async () => {
      getUser.mockRejectedValue(new Error('network'));
      const req = { headers: { authorization: 'Bearer good' } } as AuthenticatedRequest;
      const res = mockRes();
      const next = jest.fn() as NextFunction;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect((res.body as { error: { code: string } }).error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('requireRole', () => {
    const res = () => mockRes();

    it('allows a user whose role is in the allowed set', () => {
      const req = { user: { role: 'owner' } } as AuthenticatedRequest;
      const r = res();
      const next = jest.fn() as NextFunction;
      requireRole('owner', 'admin')(req, r, next);
      expect(next).toHaveBeenCalledWith();
      expect(r.status).not.toHaveBeenCalled();
    });

    it('rejects a user whose role is not allowed with 403', () => {
      const req = { user: { role: 'viewer' } } as AuthenticatedRequest;
      const r = res();
      const next = jest.fn() as NextFunction;
      requireRole('owner')(req, r, next);
      expect(r.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects when there is no authenticated user', () => {
      const req = {} as AuthenticatedRequest;
      const r = res();
      const next = jest.fn() as NextFunction;
      requireRole('owner')(req, r, next);
      expect(r.status).toHaveBeenCalledWith(403);
    });
  });
});

// Avoid unused-import lint error for Response type used implicitly via mockRes.
export type _Response = Response;
