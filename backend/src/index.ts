import app from './app';
import { config } from './config';

app.listen(config.port, '0.0.0.0', () => {
  console.log(`CallGenie AI Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Supabase URL: ${config.supabase.url || '(not set)'}`);
  console.log(`Supabase keys configured: ${!!(config.supabase.anonKey && config.supabase.serviceRoleKey)}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});

export default app;
