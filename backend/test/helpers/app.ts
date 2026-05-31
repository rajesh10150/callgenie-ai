import express, { Router } from 'express';

/** Build a minimal Express app mounting a single router for supertest. */
export function makeApp(mountPath: string, router: Router, urlencoded = false): express.Express {
  const app = express();
  if (urlencoded) {
    app.use(express.urlencoded({ extended: true }));
  }
  app.use(express.json());
  app.use(mountPath, router);
  return app;
}
