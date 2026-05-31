// Prevent dotenv from loading the real backend/.env file during tests so the
// environment is fully deterministic and driven only by the values set below.
jest.mock('dotenv', () => ({ config: jest.fn(), default: { config: jest.fn() } }));

// Global test environment configuration.
// Set deterministic dummy env vars BEFORE any module that reads `process.env`
// (e.g. src/config) is imported by a test file.
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.TWILIO_ACCOUNT_SID = 'ACtest';
process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
process.env.TWILIO_PHONE_NUMBER = '+15550000000';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.API_BASE_URL = 'https://api.test.callgenie.app';

// Keep test output clean: silence expected console noise from error paths.
jest.spyOn(console, 'error').mockImplementation(() => undefined);
jest.spyOn(console, 'warn').mockImplementation(() => undefined);
jest.spyOn(console, 'log').mockImplementation(() => undefined);
