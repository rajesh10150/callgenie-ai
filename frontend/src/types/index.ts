export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  industry: Industry;
  plan: Plan;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type Industry = 'real_estate' | 'insurance' | 'clinic' | 'salon' | 'education' | 'loans' | 'other';
export type Plan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Campaign {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  type: CampaignType;
  language: Language;
  ai_model: AIModel;
  voice_id?: string;
  caller_id?: string;
  schedule?: CampaignSchedule;
  settings?: CampaignSettings;
  total_leads: number;
  calls_made: number;
  calls_answered: number;
  leads_qualified: number;
  appointments_booked: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignType = 'cold_call' | 'follow_up' | 'appointment' | 'survey';
export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te';
export type AIModel = 'gpt-4.1' | 'claude' | 'gemini' | 'deepseek';

export interface CampaignSchedule {
  days: string[];
  start_time: string;
  end_time: string;
  timezone: string;
  max_concurrent_calls: number;
}

export interface CampaignSettings {
  max_attempts: number;
  retry_interval_hours: number;
  voicemail_detection: boolean;
  recording_enabled: boolean;
}

export interface Lead {
  id: string;
  org_id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone: string;
  company?: string;
  title?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  language?: string;
  timezone?: string;
  custom_fields?: Record<string, unknown>;
  notes?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
  lead_tags?: LeadTag[];
}

export type LeadSource = 'manual' | 'csv_import' | 'api' | 'webhook' | 'whatsapp';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';

export interface LeadTag {
  id: string;
  lead_id: string;
  tag: string;
  created_at: string;
}

export interface Call {
  id: string;
  org_id: string;
  campaign_id?: string;
  lead_id?: string;
  twilio_call_sid?: string;
  direction: 'outbound' | 'inbound';
  status: CallStatus;
  from_number?: string;
  to_number?: string;
  duration_seconds?: number;
  recording_url?: string;
  ai_model_used?: string;
  language?: string;
  sentiment?: Sentiment;
  lead_qualified?: boolean;
  appointment_booked?: boolean;
  appointment_datetime?: string;
  disposition?: CallDisposition;
  cost?: number;
  ai_cost?: number;
  voice_cost?: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  leads?: Pick<Lead, 'first_name' | 'last_name' | 'phone' | 'company'>;
  campaigns?: Pick<Campaign, 'name'>;
  call_transcripts?: CallTranscript[];
}

export type CallStatus = 'queued' | 'ringing' | 'in_progress' | 'completed' | 'failed' | 'no_answer' | 'busy';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type CallDisposition = 'interested' | 'not_interested' | 'callback' | 'wrong_number' | 'dnc';

export interface CallTranscript {
  id: string;
  call_id: string;
  entries: TranscriptEntry[];
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  created_at: string;
}

export interface TranscriptEntry {
  role: 'agent' | 'customer';
  content: string;
  timestamp: number;
  sentiment?: Sentiment;
}

export interface DashboardOverview {
  total_calls: number;
  total_leads: number;
  total_campaigns: number;
  qualified_leads: number;
  appointments_booked: number;
  answer_rate: number;
  qualification_rate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown[];
  };
}
