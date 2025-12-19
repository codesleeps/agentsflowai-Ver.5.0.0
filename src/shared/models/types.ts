// AgentsFlowAI Types

export interface Service {
  id: string;
  name: string;
  description: string;
  tier: 'basic' | 'growth' | 'enterprise';
  price: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  score: number;
  source: 'website' | 'chat' | 'referral' | 'ads';
  budget: 'low' | 'medium' | 'high' | 'enterprise' | null;
  timeline: 'immediate' | '1-3months' | '3-6months' | 'exploring' | null;
  interests: string[];
  notes: string | null;
  qualified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string | null;
  status: 'active' | 'closed' | 'transferred';
  channel: 'chat' | 'email' | 'phone';
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  lead_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  activeConversations: number;
  upcomingAppointments: number;
  revenue: number;
  leadsByStatus: { status: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  recentLeads: Lead[];
}

export interface LeadQualificationResult {
  score: number;
  budget: 'low' | 'medium' | 'high' | 'enterprise';
  timeline: 'immediate' | '1-3months' | '3-6months' | 'exploring';
  recommendedServices: string[];
  nextSteps: string[];
  summary: string;
}

export interface ServiceRecommendation {
  service: Service;
  matchScore: number;
  reasons: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
