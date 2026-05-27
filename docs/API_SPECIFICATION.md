# CallGenie AI — API Specification

Base URL: `/api/v1`

## Authentication

All endpoints require `Authorization: Bearer <jwt_token>` header unless marked as public.

---

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + organization |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout and invalidate session |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update current user profile |

### POST /auth/register
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "org_name": "Acme Corp",
  "industry": "real_estate"
}

Response: 201
{
  "user": { "id", "email", "full_name" },
  "organization": { "id", "name", "slug" },
  "token": "jwt_token"
}
```

---

## Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizations/:id` | Get organization details |
| PUT | `/organizations/:id` | Update organization |
| GET | `/organizations/:id/members` | List members |
| POST | `/organizations/:id/members` | Invite member |
| PUT | `/organizations/:id/members/:memberId` | Update member role |
| DELETE | `/organizations/:id/members/:memberId` | Remove member |

---

## Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns` | List campaigns |
| POST | `/campaigns` | Create campaign |
| GET | `/campaigns/:id` | Get campaign details |
| PUT | `/campaigns/:id` | Update campaign |
| DELETE | `/campaigns/:id` | Delete campaign |
| POST | `/campaigns/:id/start` | Start campaign |
| POST | `/campaigns/:id/pause` | Pause campaign |
| POST | `/campaigns/:id/resume` | Resume campaign |
| GET | `/campaigns/:id/stats` | Get campaign statistics |
| GET | `/campaigns/:id/leads` | Get campaign leads |
| POST | `/campaigns/:id/leads` | Add leads to campaign |
| DELETE | `/campaigns/:id/leads/:leadId` | Remove lead from campaign |

### POST /campaigns
```json
Request:
{
  "name": "Q1 Real Estate Outreach",
  "description": "Cold calling new property leads",
  "type": "cold_call",
  "language": "en",
  "ai_model": "gpt-4.1",
  "voice_id": "elevenlabs_voice_id",
  "caller_id": "+1234567890",
  "schedule": {
    "days": ["mon", "tue", "wed", "thu", "fri"],
    "start_time": "09:00",
    "end_time": "17:00",
    "timezone": "America/New_York",
    "max_concurrent_calls": 5
  },
  "settings": {
    "max_attempts": 3,
    "retry_interval_hours": 24,
    "voicemail_detection": true,
    "recording_enabled": true
  }
}

Response: 201
{ "id", "name", "status": "draft", ... }
```

---

## Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/leads` | List leads (paginated, filterable) |
| POST | `/leads` | Create single lead |
| POST | `/leads/import` | Bulk import leads (CSV) |
| GET | `/leads/:id` | Get lead details |
| PUT | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead |
| GET | `/leads/:id/activities` | Get lead activity history |
| POST | `/leads/:id/tags` | Add tag to lead |
| DELETE | `/leads/:id/tags/:tag` | Remove tag |

### GET /leads
```
Query params:
  ?page=1&limit=25
  &status=new,contacted
  &source=csv_import
  &score_min=50
  &search=john
  &sort=created_at&order=desc
```

### POST /leads/import
```
Content-Type: multipart/form-data
- file: CSV file
- mapping: JSON field mapping
```

---

## Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/calls` | List calls (paginated, filterable) |
| GET | `/calls/:id` | Get call details |
| GET | `/calls/:id/transcript` | Get call transcript |
| GET | `/calls/:id/recording` | Get recording URL |
| POST | `/calls/initiate` | Manually initiate a call |
| POST | `/calls/:id/transfer` | Transfer call to human agent |

### GET /calls
```
Query params:
  ?page=1&limit=25
  &campaign_id=uuid
  &status=completed
  &sentiment=positive
  &lead_qualified=true
  &date_from=2024-01-01
  &date_to=2024-12-31
```

---

## Campaign Scripts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaigns/:id/scripts` | List scripts for campaign |
| POST | `/campaigns/:id/scripts` | Create/update script |
| POST | `/campaigns/:id/scripts/generate` | AI-generate script |

### POST /campaigns/:id/scripts/generate
```json
Request:
{
  "industry": "real_estate",
  "product": "Luxury apartments in Downtown",
  "target_audience": "High-income professionals",
  "tone": "professional",
  "language": "en",
  "objectives": ["qualify_budget", "book_site_visit"]
}

Response: 200
{
  "opening": "...",
  "qualification_questions": [...],
  "objection_handlers": {...},
  "closing": "..."
}
```

---

## Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Dashboard overview stats |
| GET | `/analytics/calls` | Call analytics |
| GET | `/analytics/leads` | Lead analytics |
| GET | `/analytics/campaigns` | Campaign performance |
| GET | `/analytics/costs` | Cost breakdown |

### GET /analytics/dashboard
```json
Response: 200
{
  "overview": {
    "total_calls": 1250,
    "calls_today": 45,
    "avg_duration": 180,
    "answer_rate": 0.72,
    "qualification_rate": 0.35,
    "appointments_booked": 89,
    "total_cost": 450.00
  },
  "trends": {
    "calls_by_day": [...],
    "conversion_by_campaign": [...],
    "sentiment_distribution": {...}
  }
}
```

---

## Subscriptions / Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/subscription` | Get current subscription |
| POST | `/billing/subscribe` | Create/update subscription |
| POST | `/billing/cancel` | Cancel subscription |
| GET | `/billing/invoices` | List invoices |
| GET | `/billing/usage` | Get current usage |

---

## WhatsApp

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/whatsapp/templates` | List templates |
| POST | `/whatsapp/templates` | Create template |
| PUT | `/whatsapp/templates/:id` | Update template |
| POST | `/whatsapp/send` | Send WhatsApp message |
| POST | `/whatsapp/send-bulk` | Bulk send messages |

---

## Webhooks (Twilio)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/twilio/voice` | Twilio voice webhook |
| POST | `/webhooks/twilio/status` | Twilio status callback |
| POST | `/webhooks/twilio/recording` | Recording callback |

---

## AI Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/models` | List available AI models |
| PUT | `/ai/models/:model` | Configure AI model |
| POST | `/ai/test` | Test AI model with prompt |

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 150
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": [...]
  }
}
```

## Rate Limits

| Plan | Requests/min | Concurrent calls |
|------|-------------|-------------------|
| Free | 30 | 1 |
| Starter | 100 | 5 |
| Professional | 300 | 20 |
| Enterprise | 1000 | Unlimited |
