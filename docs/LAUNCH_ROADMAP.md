# CallGenie AI — Launch Roadmap & MVP Milestones

## MVP Definition (Week 1-6)

### Core MVP Features
1. **Auth & Onboarding** — Register, login, create organization
2. **Lead Management** — Import CSV, manual entry, list/filter/search
3. **Campaign Builder** — Create campaign, assign leads, configure AI model & voice
4. **AI Script Generator** — Auto-generate call scripts based on industry/product
5. **Outbound Calling** — AI agent makes calls via Twilio + ElevenLabs
6. **Call Transcription** — Real-time transcription + summary
7. **Lead Qualification** — AI scores leads during calls
8. **Dashboard Analytics** — Key metrics: calls, conversions, costs
9. **Subscription Billing** — Stripe integration with usage tracking

### MVP Non-Goals (Post-MVP)
- WhatsApp automation
- Multi-language (start English-only)
- Custom AI model keys
- Team collaboration features
- White-labeling

---

## Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] System architecture design
- [x] Database schema design
- [x] API specification
- [x] Project scaffolding
- [ ] Supabase setup + migrations
- [ ] Auth flow (register/login/logout)
- [ ] Basic dashboard layout
- [ ] Organization settings

### Phase 2: Core Features (Weeks 3-4)
- [ ] Lead management (CRUD + CSV import)
- [ ] Campaign builder UI + API
- [ ] AI script generator integration
- [ ] Twilio voice integration
- [ ] ElevenLabs TTS integration
- [ ] Real-time call transcription
- [ ] Call history + recordings

### Phase 3: Intelligence (Weeks 5-6)
- [ ] Lead qualification AI
- [ ] Sentiment analysis
- [ ] Multi-model routing
- [ ] Objection handling engine
- [ ] Follow-up automation
- [ ] Campaign analytics dashboard

### Phase 4: Growth (Weeks 7-8)
- [ ] Stripe billing integration
- [ ] Usage tracking + limits
- [ ] Pricing page
- [ ] Onboarding flow optimization
- [ ] Email notifications
- [ ] API documentation portal

### Phase 5: Scale (Weeks 9-12)
- [ ] Multi-language support (Hindi, Kannada, Tamil, Telugu)
- [ ] WhatsApp integration
- [ ] Team management
- [ ] Webhook system
- [ ] n8n workflow templates
- [ ] Performance optimization

### Phase 6: Enterprise (Weeks 13-16)
- [ ] White-labeling
- [ ] Custom AI model support
- [ ] Advanced analytics + reporting
- [ ] SLA guarantees
- [ ] Dedicated infrastructure option
- [ ] API rate limit customization

---

## Monetization Strategy

### Pricing Tiers

| Feature | Free | Starter ($49/mo) | Pro ($149/mo) | Enterprise ($499+/mo) |
|---------|------|-------------------|---------------|----------------------|
| AI call minutes | 30/mo | 500/mo | 2,000/mo | Unlimited |
| Campaigns | 1 | 5 | 25 | Unlimited |
| Leads | 100 | 2,500 | 25,000 | Unlimited |
| AI models | GPT-4.1 only | GPT-4.1 + Gemini | All models | All + custom |
| Languages | English | English + Hindi | All 5 | All + custom |
| Team members | 1 | 3 | 10 | Unlimited |
| WhatsApp | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ | ✅ |
| Analytics | Basic | Standard | Advanced | Custom |
| Support | Community | Email | Priority | Dedicated |

### Revenue Streams
1. **SaaS subscriptions** (primary)
2. **Usage-based overage** (call minutes, AI credits)
3. **Enterprise contracts** (annual, custom pricing)
4. **Marketplace** (script templates, voice packs)

### Unit Economics Target
- CAC: <$100
- LTV: >$2,000
- LTV/CAC: >20x
- Monthly churn: <5%
- Gross margin: >80%

---

## Investor Pitch Positioning

### Problem
- Cold calling is expensive ($25-50/hour for human agents)
- Conversion rates are low (2-5%)
- Scaling requires proportional headcount
- Language barriers limit market reach

### Solution
- AI agents at 1/10th the cost of human agents
- 24/7 availability across time zones
- Multilingual support without hiring
- Consistent quality and objection handling
- Real-time analytics and optimization

### TAM/SAM/SOM
- **TAM**: $50B (global contact center market)
- **SAM**: $5B (SMB outbound calling, India + US)
- **SOM**: $50M (target industries, first 2 years)

### Competitive Advantage
1. **Multi-model AI** — Not locked to one provider
2. **Indian language support** — Massive underserved market
3. **Industry templates** — Pre-built for real estate, insurance, etc.
4. **Cost optimization** — Smart model routing reduces costs 60%
5. **Full pipeline** — Call → Qualify → Book → Follow-up, all automated

---

## Growth Strategy

### Acquisition Channels
1. **Content marketing** — AI cold calling guides, ROI calculators
2. **LinkedIn outbound** — Target SMB owners in focus industries
3. **Partnerships** — CRM integrations (HubSpot, Zoho)
4. **Referral program** — 20% revenue share for referrals
5. **Free tier** — Product-led growth with generous free plan

### Viral Loops
1. "Powered by CallGenie AI" mention in AI calls (free tier)
2. Shareable campaign analytics reports
3. Team invitations
4. Industry community (templates marketplace)

### Onboarding Optimization
1. 5-minute setup wizard
2. Pre-built industry templates
3. Sample leads for testing
4. Interactive tutorial
5. Free trial call (no credit card required)
