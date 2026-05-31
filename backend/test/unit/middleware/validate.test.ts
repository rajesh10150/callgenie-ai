import { z } from 'zod';
import { validate } from '../../../src/middleware/validate';
import { mockRes } from '../../helpers/http';
import { Request, NextFunction } from 'express';

const schema = z.object({ name: z.string().min(2) });

describe('middleware/validate', () => {
  it('calls next and replaces the source with parsed data on success', () => {
    const req = { body: { name: 'Jo', extra: 'stripped' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: 'Jo' });
  });

  it('responds 400 with field details on validation error', () => {
    const req = { body: { name: 'x' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.body as { error: { code: string; details: { field: string }[] } };
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details[0].field).toBe('name');
  });

  it('validates a non-body source (query)', () => {
    const req = { query: { name: 'ok' } } as unknown as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    validate(schema, 'query')(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query).toEqual({ name: 'ok' });
  });

  it('forwards non-Zod errors to next', () => {
    const throwingSchema = {
      parse: () => {
        throw new Error('non-zod');
      },
    } as unknown as z.ZodSchema;
    const req = { body: {} } as Request;
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    validate(throwingSchema)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });
});
