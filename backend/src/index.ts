import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import campaignRoutes from './routes/campaigns';
import leadRoutes from './routes/leads';
import callRoutes from './routes/calls';
import analyticsRoutes from './routes/analytics';
import billingRoutes from './routes/billing';
import whatsappRoutes from './routes/whatsapp';
import aiRoutes from './routes/ai';
import webhookRoutes from './routes/webhooks';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.cors.origins.includes(origin) || config.cors.origins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));
app.use(morgan('combined'));

app.use('/api/v1/webhooks', express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
  },
});
app.use('/api/', limiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/calls', callRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

app.get('/api/health', async (_req, res) => {
  const supabaseConfigured = !!(config.supabase.url && config.supabase.serviceRoleKey);
  let supabaseConnected = false;

  if (supabaseConfigured) {
    try {
      const { supabaseAdmin } = await import('./config/supabase');
      const { error } = await supabaseAdmin.from('users').select('id').limit(1);
      supabaseConnected = !error;
      if (error) console.error('Health check Supabase error:', error.message);
    } catch (err) {
      console.error('Health check Supabase exception:', err);
    }
  }

  res.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    supabase: { configured: supabaseConfigured, connected: supabaseConnected },
  });
});

app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`CallGenie AI Backend running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Supabase URL: ${config.supabase.url || '(not set)'}`);
  console.log(`Supabase keys configured: ${!!(config.supabase.anonKey && config.supabase.serviceRoleKey)}`);
  console.log(`Health check: http://localhost:${config.port}/api/health`);
});

export default app;
