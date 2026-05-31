import request from 'supertest';
import { chain } from '../../helpers/supabase';
import { makeApp } from '../../helpers/app';

const createUser = jest.fn();
const listUsers = jest.fn();
const deleteUser = jest.fn();
const from = jest.fn();
const signInWithPassword = jest.fn();

jest.mock('../../../src/config/supabase', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        createUser: (...a: unknown[]) => createUser(...a),
        listUsers: (...a: unknown[]) => listUsers(...a),
        deleteUser: (...a: unknown[]) => deleteUser(...a),
      },
    },
    from: (...a: unknown[]) => from(...a),
  },
  getSupabaseAnon: () => ({ auth: { signInWithPassword: (...a: unknown[]) => signInWithPassword(...a) } }),
}));
jest.mock('../../../src/middleware/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'u1', email: 'a@b.com', orgId: 'org1', role: 'owner' };
    next();
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
import authRouter from '../../../src/routes/auth';

const app = makeApp('/auth', authRouter);
const validReg = {
  email: 'a@b.com', password: 'password123', full_name: 'Jo Doe',
  org_name: 'Acme Co', industry: 'real_estate',
};

describe('routes/auth', () => {
  describe('POST /auth/register', () => {
    it('registers a new user, org and membership', async () => {
      createUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      from.mockReturnValue(chain({ error: null }));
      signInWithPassword.mockResolvedValue({ data: { session: { access_token: 'tok' } } });

      const res = await request(app).post('/auth/register').send(validReg);

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBe('tok');
      expect(from).toHaveBeenCalledWith('users');
      expect(from).toHaveBeenCalledWith('organizations');
      expect(from).toHaveBeenCalledWith('org_members');
    });

    it('rejects invalid input', async () => {
      const res = await request(app).post('/auth/register').send({ email: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns AUTH_ERROR for a generic auth failure', async () => {
      createUser.mockResolvedValue({ data: null, error: { message: 'boom' } });
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('AUTH_ERROR');
    });

    it('recovers an orphaned auth user and retries', async () => {
      createUser
        .mockResolvedValueOnce({ data: null, error: { message: 'already been registered' } })
        .mockResolvedValueOnce({ data: { user: { id: 'u1' } }, error: null });
      listUsers.mockResolvedValue({ data: { users: [{ id: 'ex1', email: 'a@b.com' }] } });
      from
        .mockReturnValueOnce(chain({ data: null })) // dbUser lookup -> orphan
        .mockReturnValueOnce(chain({ error: null })) // users insert
        .mockReturnValueOnce(chain({ error: null })) // organizations insert
        .mockReturnValueOnce(chain({ error: null })); // org_members insert
      signInWithPassword.mockResolvedValue({ data: { session: { access_token: 'tok' } } });

      const res = await request(app).post('/auth/register').send(validReg);

      expect(res.status).toBe(201);
      expect(deleteUser).toHaveBeenCalledWith('ex1');
      expect(createUser).toHaveBeenCalledTimes(2);
    });

    it('returns AUTH_ERROR when the email maps to a complete account', async () => {
      createUser.mockResolvedValue({ data: null, error: { message: 'already been registered' } });
      listUsers.mockResolvedValue({ data: { users: [{ id: 'ex1', email: 'a@b.com' }] } });
      from.mockReturnValueOnce(chain({ data: { id: 'ex1' } })); // dbUser exists
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('AUTH_ERROR');
    });

    it('returns AUTH_ERROR when no matching auth user is found', async () => {
      createUser.mockResolvedValue({ data: null, error: { message: 'already been registered' } });
      listUsers.mockResolvedValue({ data: { users: [] } });
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('AUTH_ERROR');
    });

    it('rolls back when the users insert fails', async () => {
      createUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      from.mockReturnValueOnce(chain({ error: { message: 'dup' } }));
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('DB_ERROR');
      expect(deleteUser).toHaveBeenCalledWith('u1');
    });

    it('rolls back when the organizations insert fails', async () => {
      createUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      from
        .mockReturnValueOnce(chain({ error: null }))
        .mockReturnValueOnce(chain({ error: { message: 'org bad' } }));
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(deleteUser).toHaveBeenCalledWith('u1');
    });

    it('rolls back when the membership insert fails', async () => {
      createUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      from
        .mockReturnValueOnce(chain({ error: null }))
        .mockReturnValueOnce(chain({ error: null }))
        .mockReturnValueOnce(chain({ error: { message: 'member bad' } }));
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(400);
      expect(deleteUser).toHaveBeenCalledWith('u1');
    });

    it('returns 500 when an unexpected error is thrown', async () => {
      createUser.mockRejectedValue(new Error('crash'));
      const res = await request(app).post('/auth/register').send(validReg);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    it('logs in and returns tokens', async () => {
      signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1' }, session: { access_token: 't', refresh_token: 'r' } },
        error: null,
      });
      from
        .mockReturnValueOnce(chain({ data: { id: 'u1' } }))
        .mockReturnValueOnce(chain({ data: { org_id: 'org1', role: 'owner', organizations: { id: 'org1' } } }));

      const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBe('t');
      expect(res.body.data.role).toBe('owner');
    });

    it('returns 401 for invalid credentials', async () => {
      signInWithPassword.mockResolvedValue({ data: null, error: { message: 'bad' } });
      const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_ERROR');
    });

    it('rejects invalid input', async () => {
      const res = await request(app).post('/auth/login').send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
    });

    it('returns 500 when login throws', async () => {
      signInWithPassword.mockRejectedValue(new Error('crash'));
      const res = await request(app).post('/auth/login').send({ email: 'a@b.com', password: 'x' });
      expect(res.status).toBe(500);
    });
  });

  describe('POST /auth/logout', () => {
    it('responds with a success message', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Logged out successfully');
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user and organization', async () => {
      from
        .mockReturnValueOnce(chain({ data: { id: 'u1' } }))
        .mockReturnValueOnce(chain({ data: { role: 'owner', organizations: { id: 'org1' } } }));
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('owner');
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(500);
    });
  });

  describe('PUT /auth/me', () => {
    it('updates the profile', async () => {
      from.mockReturnValue(chain({ data: { id: 'u1', full_name: 'New' }, error: null }));
      const res = await request(app).put('/auth/me').send({ full_name: 'New' });
      expect(res.status).toBe(200);
      expect(res.body.data.full_name).toBe('New');
    });

    it('returns 400 on DB error', async () => {
      from.mockReturnValue(chain({ data: null, error: { message: 'bad' } }));
      const res = await request(app).put('/auth/me').send({ full_name: 'New' });
      expect(res.status).toBe(400);
    });

    it('returns 500 when it throws', async () => {
      from.mockImplementation(() => { throw new Error('boom'); });
      const res = await request(app).put('/auth/me').send({ full_name: 'New' });
      expect(res.status).toBe(500);
    });
  });
});
