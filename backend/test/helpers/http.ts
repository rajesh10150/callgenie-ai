import { Response } from 'express';

export interface MockResponse extends Response {
  statusCode: number;
  body: unknown;
}

/** Minimal Express Response double capturing status code and JSON body. */
export function mockRes(): MockResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = {};
  res.statusCode = 200;
  res.body = undefined;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  res.send = jest.fn((payload: unknown) => {
    res.body = payload;
    return res;
  });
  res.setHeader = jest.fn(() => res);
  res.set = jest.fn(() => res);
  res.type = jest.fn(() => res);
  res.end = jest.fn(() => res);
  return res as MockResponse;
}
