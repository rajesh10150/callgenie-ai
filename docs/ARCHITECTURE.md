# CallGenie AI — System Architecture

## 1. System Overview

CallGenie AI is a multi-tenant SaaS platform that orchestrates AI-powered voice agents for outbound calling campaigns. The system handles the full lifecycle: campaign creation → lead import → AI call execution → conversation management → lead qualification → follow-up automation → analytics.

## 2. Architecture Diagram

```
                                    ┌──────────────┐
                                    │   CDN/Edge   │
                                    │   (Vercel)   │
                                    └──────┬───────┘
                                           │
                    ┌──────────────────────▼──────────────────────┐
                    │              FRONTEND LAYER                  │
                    │         Next.js 14 (App Router)              │
                    │                                              │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
                    │  │Dashboard │ │Campaigns │ │Analytics │    │
                    │  └──────────┘ └──────────┘ └──────────┘    │
                    │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
                    │  │  Leads   │ │  Calls   │ │ Settings │    │
                    │  └──────────┘ └──────────┘ └──────────┘    │
                    └──────────────────────┬──────────────────────┘
                                           │ HTTPS/REST
                    ┌──────────────────────▼──────────────────────┐
                    │              API GATEWAY                      │
                    │  Rate Limiting │ Auth │ CORS │ Logging       │
                    └──────────────────────┬──────────────────────┘
                                           │
          ┌────────────────────────────────▼────────────────────────────────┐
          │                        BACKEND SERVICES                         │
          │                                                                 │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
          │  │ Auth Service│  │Campaign Svc │  │  Lead Svc   │            │
          │  └─────────────┘  └─────────────┘  └─────────────┘            │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
          │  │ Call Service│  │Analytics Svc│  │Billing Svc  │            │
          │  └─────────────┘  └─────────────┘  └─────────────┘            │
          │  ┌─────────────┐  ┌─────────────┐                              │
          │  │WhatsApp Svc │  │ Webhook Svc │                              │
          │  └─────────────┘  └─────────────┘                              │
          └────────────────────────┬───────────────────────────────────────┘
                                   │
          ┌────────────────────────▼───────────────────────────────────────┐
          │                   AI ORCHESTRATION LAYER                       │
          │                                                                │
          │  ┌──────────────────────────────────────────────┐              │
          │  │              MODEL ROUTER                     │              │
          │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │              │
          │  │  │ GPT-4.1 │ │ Claude  │ │ Gemini  │       │              │
          │  │  └─────────┘ └─────────┘ └─────────┘       │              │
          │  │  ┌─────────┐ ┌──────────────────────┐       │              │
          │  │  │DeepSeek │ │  Routing Strategy    │       │              │
          │  │  └─────────┘ └──────────────────────┘       │              │
          │  └──────────────────────────────────────────────┘              │
          │                                                                │
          │  ┌──────────────────────────────────────────────┐              │
          │  │           SALES AI ENGINE                     │              │
          │  │  Script Gen │ Objection │ Qualification      │              │
          │  │  Sentiment  │ Follow-up │ Closing            │              │
          │  └──────────────────────────────────────────────┘              │
          └────────────────────────┬───────────────────────────────────────┘
                                   │
          ┌────────────────────────▼───────────────────────────────────────┐
          │                    VOICE ENGINE                                 │
          │                                                                │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
          │  │   Twilio    │  │ ElevenLabs  │  │  Deepgram   │           │
          │  │ (Telephony) │  │   (TTS)     │  │   (STT)     │           │
          │  └─────────────┘  └─────────────┘  └─────────────┘           │
          └───────────────────────────────────────────────────────────────┘
                                   │
          ┌────────────────────────▼───────────────────────────────────────┐
          │                     DATA LAYER                                  │
          │                                                                │
          │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
          │  │  Supabase   │  │   Redis     │  │   S3/R2     │           │
          │  │ (PostgreSQL)│  │  (Cache +   │  │ (Recordings │           │
          │  │             │  │   Queues)   │  │  + Assets)  │           │
          │  └─────────────┘  └─────────────┘  └─────────────┘           │
          └───────────────────────────────────────────────────────────────┘
```

## 3. Component Details

### 3.1 Frontend (Next.js 14)
- **App Router** with server components for optimal performance
- **Dark premium UI** with glassmorphism design language
- **Real-time updates** via Supabase Realtime subscriptions
- **Responsive** mobile-first design with Tailwind CSS
- **Animations** via Framer Motion for premium feel

### 3.2 Backend (Express.js)
- **Modular service architecture** — each domain has its own route/service/model
- **JWT authentication** via Supabase Auth
- **Rate limiting** per tenant with sliding window
- **Request validation** with Zod schemas
- **Background jobs** via Bull queue (Redis-backed)

### 3.3 AI Orchestration
- **Model Router** selects optimal AI model based on:
  - Task complexity (simple → DeepSeek, complex → GPT-4.1/Claude)
  - Cost budget (low-cost → DeepSeek/Gemini, premium → GPT-4.1)
  - Language (multilingual → Gemini, English → GPT-4.1)
  - Speed requirements (fast → Gemini Flash, thorough → Claude)
- **Sales AI Engine** generates dynamic scripts, handles objections, qualifies leads

### 3.4 Voice Engine
- **Twilio** handles telephony (outbound calls, call control, recording)
- **ElevenLabs** provides human-like TTS in multiple languages
- **Deepgram** provides real-time STT with language detection

### 3.5 Data Layer
- **Supabase** (PostgreSQL) for all structured data + auth + realtime
- **Redis** for caching, session management, and job queues
- **Object storage** for call recordings and generated assets

## 4. Multi-Tenancy

- Row-Level Security (RLS) in Supabase ensures data isolation
- Each organization has its own workspace
- Team members can be invited with role-based access (Owner, Admin, Agent, Viewer)

## 5. Security Architecture

```
┌─────────────────────────────────────────┐
│           SECURITY LAYERS               │
├─────────────────────────────────────────┤
│ 1. Edge: Vercel WAF + DDoS protection   │
│ 2. Transport: TLS 1.3 everywhere        │
│ 3. Auth: JWT + Supabase RLS             │
│ 4. API: Rate limiting (100 req/min)      │
│ 5. Input: Zod validation on all inputs  │
│ 6. Data: AES-256 encryption at rest     │
│ 7. Audit: Full request logging          │
│ 8. Secrets: Env vars, never in code     │
└─────────────────────────────────────────┘
```

## 6. Scaling Strategy

### Phase 1 (0–1K users)
- Single Express server on Railway/Render
- Supabase free/pro tier
- Vercel for frontend

### Phase 2 (1K–10K users)
- Horizontal scaling with load balancer
- Redis cluster for caching
- Dedicated Supabase instance
- CDN for static assets

### Phase 3 (10K+ users)
- Kubernetes orchestration
- Multi-region deployment
- Read replicas for database
- Dedicated voice infrastructure

## 7. Monitoring & Observability

- **Application**: Sentry for error tracking
- **Performance**: Vercel Analytics + custom metrics
- **Infrastructure**: Uptime monitoring (BetterStack)
- **Business**: Custom analytics dashboard
- **Alerts**: Slack/email notifications for critical events

## 8. Cost Optimization

| Service | Strategy |
|---------|----------|
| AI Models | Smart routing to cheapest capable model |
| Voice | Batch calls during off-peak hours |
| Database | Connection pooling, query optimization |
| CDN | Aggressive caching of static assets |
| Compute | Auto-scaling based on call volume |
