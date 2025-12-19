// AI Agent Types for AgentsFlowAI

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AIAgentCategory;
  systemPrompt: string;
  capabilities: string[];
  model: string;
  isActive: boolean;
}

export type AIAgentCategory = 
  | 'web-development'
  | 'analytics'
  | 'content-creation'
  | 'marketing'
  | 'social-media'
  | 'seo';

export interface AIAgentMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationTime?: number;
  };
}

export interface AIAgentConversation {
  id: string;
  agentId: string;
  title: string;
  messages: AIAgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export interface OllamaGenerateResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ContentGenerationRequest {
  type: 'blog-post' | 'social-post' | 'ad-copy' | 'email' | 'seo-content' | 'code';
  topic: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  keywords?: string[];
  targetAudience?: string;
  additionalContext?: string;
}

export interface SEOAnalysisRequest {
  url?: string;
  content?: string;
  targetKeywords?: string[];
  competitors?: string[];
}

export interface SEOAnalysisResult {
  score: number;
  keywords: {
    keyword: string;
    density: number;
    suggestions: string[];
  }[];
  metaTags: {
    title: string;
    description: string;
    suggestions: string[];
  };
  contentSuggestions: string[];
  technicalIssues: string[];
}

export interface SocialMediaPost {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook';
  content: string;
  hashtags: string[];
  scheduledAt?: Date;
  imagePrompt?: string;
}

export interface MarketingCampaign {
  name: string;
  objective: string;
  targetAudience: string;
  channels: string[];
  budget?: number;
  duration: string;
  keyMessages: string[];
  callToAction: string;
}

export interface AnalyticsInsight {
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'recommendation';
  confidence: number;
  data?: Record<string, unknown>;
  actionItems: string[];
}

// Agent configurations
export const AI_AGENTS: AIAgent[] = [
  {
    id: 'web-dev-agent',
    name: 'Web Development Agent',
    description: 'Expert in web development, code generation, debugging, and optimization',
    icon: '💻',
    category: 'web-development',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Generate React/Next.js components',
      'Debug JavaScript/TypeScript code',
      'Optimize performance',
      'Create API endpoints',
      'Write unit tests',
      'Explain code concepts',
    ],
    systemPrompt: `You are an expert web developer specializing in modern technologies including React, Next.js, TypeScript, Node.js, and Tailwind CSS. You help users:
- Generate clean, maintainable code
- Debug issues and fix errors
- Optimize performance
- Follow best practices and design patterns
- Write comprehensive tests

Always provide code examples when relevant. Use TypeScript for type safety. Follow modern React patterns with hooks and functional components.`,
  },
  {
    id: 'analytics-agent',
    name: 'Analytics Agent',
    description: 'Data analysis, insights generation, and business intelligence',
    icon: '📊',
    category: 'analytics',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Analyze business metrics',
      'Identify trends and patterns',
      'Generate data insights',
      'Create forecasts',
      'Suggest optimizations',
      'Explain complex data',
    ],
    systemPrompt: `You are a data analytics expert specializing in business intelligence and data-driven decision making. You help users:
- Analyze business metrics and KPIs
- Identify trends, patterns, and anomalies
- Generate actionable insights
- Create forecasts and predictions
- Suggest data-driven optimizations
- Explain complex data in simple terms

Always provide specific, actionable recommendations. Use data to support your insights. Consider both short-term and long-term implications.`,
  },
  {
    id: 'content-agent',
    name: 'Content Creation Agent',
    description: 'Blog posts, articles, copy, and all types of written content',
    icon: '✍️',
    category: 'content-creation',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Write blog posts and articles',
      'Create marketing copy',
      'Generate email content',
      'Craft product descriptions',
      'Edit and improve content',
      'Adapt tone and style',
    ],
    systemPrompt: `You are an expert content creator and copywriter with years of experience in digital marketing. You help users:
- Write engaging blog posts and articles
- Create compelling marketing copy
- Generate email sequences
- Craft product descriptions
- Edit and improve existing content
- Adapt content for different audiences and tones

Always focus on clarity, engagement, and conversion. Use storytelling techniques. Optimize for readability while maintaining SEO best practices.`,
  },
  {
    id: 'marketing-agent',
    name: 'Marketing Agent',
    description: 'Campaign strategies, ad copy, funnels, and marketing automation',
    icon: '📣',
    category: 'marketing',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Create marketing strategies',
      'Design sales funnels',
      'Write ad copy',
      'Plan campaigns',
      'Analyze competitors',
      'Suggest optimizations',
    ],
    systemPrompt: `You are a marketing strategist with expertise in digital marketing, growth hacking, and conversion optimization. You help users:
- Create comprehensive marketing strategies
- Design effective sales funnels
- Write high-converting ad copy
- Plan and execute campaigns
- Analyze competitor strategies
- Optimize marketing ROI

Always focus on measurable results and ROI. Consider the customer journey. Use proven marketing frameworks and adapt them to specific needs.`,
  },
  {
    id: 'social-media-agent',
    name: 'Social Media Agent',
    description: 'Social media content, scheduling, engagement strategies',
    icon: '📱',
    category: 'social-media',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Create social media posts',
      'Generate hashtag strategies',
      'Plan content calendars',
      'Write captions',
      'Suggest engagement tactics',
      'Analyze trends',
    ],
    systemPrompt: `You are a social media expert with deep knowledge of all major platforms including Twitter/X, LinkedIn, Instagram, Facebook, and TikTok. You help users:
- Create engaging social media posts
- Develop hashtag strategies
- Plan content calendars
- Write platform-specific captions
- Suggest engagement tactics
- Analyze social media trends

Always consider platform-specific best practices. Focus on engagement and community building. Use current trends and formats.`,
  },
  {
    id: 'seo-agent',
    name: 'SEO Agent',
    description: 'Search engine optimization, keywords, meta tags, and rankings',
    icon: '🔍',
    category: 'seo',
    model: 'mistral',
    isActive: true,
    capabilities: [
      'Keyword research',
      'On-page SEO optimization',
      'Meta tag generation',
      'Content optimization',
      'Technical SEO advice',
      'Competitor analysis',
    ],
    systemPrompt: `You are an SEO expert with comprehensive knowledge of search engine algorithms, keyword research, and content optimization. You help users:
- Conduct keyword research
- Optimize on-page SEO elements
- Generate meta tags and descriptions
- Improve content for search rankings
- Provide technical SEO recommendations
- Analyze competitor SEO strategies

Always follow current SEO best practices. Focus on user intent and search quality. Provide specific, actionable recommendations with expected impact.`,
  },
];
