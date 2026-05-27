# CallGenie AI — Database Schema

## Entity Relationship Diagram

```
organizations ──┬── org_members ──── users
                 ├── campaigns ──┬── campaign_leads ──── leads
                 │               └── campaign_scripts
                 ├── leads ──────┬── lead_tags
                 │               └── lead_activities
                 ├── calls ──────┬── call_transcripts
                 │               └── call_events
                 ├── ai_models
                 ├── subscriptions ──── invoices
                 ├── whatsapp_templates
                 └── webhooks
```

## Tables

### organizations
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| name | text | Organization name |
| slug | text UNIQUE | URL-friendly identifier |
| logo_url | text | |
| industry | text | real_estate, insurance, clinic, salon, education, loans, other |
| plan | text | free, starter, professional, enterprise |
| settings | jsonb | Org-level settings |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | References auth.users |
| email | text UNIQUE | |
| full_name | text | |
| avatar_url | text | |
| phone | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### org_members
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| user_id | uuid FK → users | |
| role | text | owner, admin, agent, viewer |
| created_at | timestamptz | |

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| name | text | Campaign name |
| description | text | |
| status | text | draft, active, paused, completed, archived |
| type | text | cold_call, follow_up, appointment, survey |
| language | text | en, hi, kn, ta, te |
| ai_model | text | gpt-4.1, claude, gemini, deepseek |
| voice_id | text | ElevenLabs voice ID |
| caller_id | text | Twilio phone number |
| schedule | jsonb | Calling schedule config |
| settings | jsonb | Campaign-specific settings |
| total_leads | int | Denormalized count |
| calls_made | int | Denormalized count |
| calls_answered | int | Denormalized count |
| leads_qualified | int | Denormalized count |
| appointments_booked | int | Denormalized count |
| start_date | timestamptz | |
| end_date | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### campaign_scripts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| campaign_id | uuid FK → campaigns | |
| version | int | Script version |
| opening | text | Opening script |
| qualification_questions | jsonb | Array of questions |
| objection_handlers | jsonb | Objection → response map |
| closing | text | Closing script |
| fallback_responses | jsonb | Generic fallbacks |
| is_active | boolean | |
| created_at | timestamptz | |

### leads
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| first_name | text | |
| last_name | text | |
| email | text | |
| phone | text | Required for calling |
| company | text | |
| title | text | Job title |
| source | text | csv_import, manual, api, webhook, whatsapp |
| status | text | new, contacted, qualified, unqualified, converted, lost |
| score | int | Lead score 0-100 |
| language | text | Preferred language |
| timezone | text | |
| custom_fields | jsonb | Extensible fields |
| notes | text | |
| last_contacted_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### campaign_leads
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| campaign_id | uuid FK → campaigns | |
| lead_id | uuid FK → leads | |
| status | text | pending, calling, completed, failed, skipped |
| attempts | int | Number of call attempts |
| last_attempt_at | timestamptz | |
| next_attempt_at | timestamptz | |
| result | text | answered, no_answer, busy, voicemail, failed |
| created_at | timestamptz | |

### calls
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| campaign_id | uuid FK → campaigns | |
| lead_id | uuid FK → leads | |
| twilio_call_sid | text | Twilio Call SID |
| direction | text | outbound, inbound |
| status | text | queued, ringing, in_progress, completed, failed, no_answer, busy |
| from_number | text | |
| to_number | text | |
| duration_seconds | int | |
| recording_url | text | |
| ai_model_used | text | |
| language | text | |
| sentiment | text | positive, neutral, negative |
| lead_qualified | boolean | |
| appointment_booked | boolean | |
| appointment_datetime | timestamptz | |
| disposition | text | interested, not_interested, callback, wrong_number, dnc |
| cost | decimal | Total cost of the call |
| ai_cost | decimal | AI model cost |
| voice_cost | decimal | Voice/telephony cost |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| created_at | timestamptz | |

### call_transcripts
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| call_id | uuid FK → calls | |
| entries | jsonb | Array of {role, content, timestamp, sentiment} |
| summary | text | AI-generated summary |
| key_points | jsonb | Extracted key points |
| action_items | jsonb | Follow-up actions |
| created_at | timestamptz | |

### call_events
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| call_id | uuid FK → calls | |
| event_type | text | start, ring, answer, dtmf, transfer, hangup, error |
| data | jsonb | Event-specific data |
| timestamp | timestamptz | |

### lead_activities
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| lead_id | uuid FK → leads | |
| org_id | uuid FK → organizations | |
| type | text | call, email, whatsapp, note, status_change, score_change |
| description | text | |
| metadata | jsonb | |
| created_at | timestamptz | |

### lead_tags
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| lead_id | uuid FK → leads | |
| tag | text | |
| created_at | timestamptz | |

### subscriptions
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| plan | text | free, starter, professional, enterprise |
| status | text | active, past_due, canceled, trialing |
| stripe_subscription_id | text | |
| stripe_customer_id | text | |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| call_minutes_limit | int | Monthly limit |
| call_minutes_used | int | Current usage |
| ai_credits_limit | int | Monthly limit |
| ai_credits_used | int | Current usage |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### invoices
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| subscription_id | uuid FK → subscriptions | |
| stripe_invoice_id | text | |
| amount | decimal | |
| currency | text | |
| status | text | draft, open, paid, void |
| period_start | timestamptz | |
| period_end | timestamptz | |
| pdf_url | text | |
| created_at | timestamptz | |

### whatsapp_templates
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| name | text | |
| language | text | |
| content | text | Template content with placeholders |
| type | text | follow_up, appointment_confirmation, reminder |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### webhooks
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| url | text | Webhook endpoint |
| events | text[] | Array of event types |
| secret | text | Signing secret |
| is_active | boolean | |
| created_at | timestamptz | |

### ai_model_configs
| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | |
| org_id | uuid FK → organizations | |
| model | text | gpt-4.1, claude, gemini, deepseek |
| api_key_encrypted | text | |
| is_enabled | boolean | |
| priority | int | Routing priority |
| max_tokens | int | |
| temperature | decimal | |
| settings | jsonb | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_campaigns_org_id ON campaigns(org_id);
CREATE INDEX idx_campaigns_status ON campaigns(org_id, status);
CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_status ON leads(org_id, status);
CREATE INDEX idx_leads_phone ON leads(org_id, phone);
CREATE INDEX idx_calls_org_id ON calls(org_id);
CREATE INDEX idx_calls_campaign_id ON calls(campaign_id);
CREATE INDEX idx_calls_lead_id ON calls(lead_id);
CREATE INDEX idx_calls_created_at ON calls(org_id, created_at DESC);
CREATE INDEX idx_campaign_leads_status ON campaign_leads(campaign_id, status);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
```

## Row-Level Security

All tables implement RLS policies ensuring users can only access data belonging to their organization. Policies check `org_id` against the authenticated user's organization membership.
