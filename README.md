# AgentsFlowAI - AI-Powered Business Automation Platform

## High-level Strategy and Goal

AgentsFlowAI is an AI-powered business automation platform designed to transform business operations with intelligent automation. The platform combines multiple AI agents to handle:

- **Customer Interactions** - 24/7 AI-powered chat support
- **Lead Qualification** - Automatic scoring and prioritization
- **Service Recommendations** - Intelligent package suggestions
- **Business Analytics** - Real-time performance metrics
- **Appointment Scheduling** - Automated calendar management

### Target Users
- Digital marketing agencies
- Consulting firms
- SaaS companies
- E-commerce businesses
- Professional services firms
- Startups wanting to scale without hiring

### Key Value Propositions
- 80% reduction in manual lead qualification time
- 3x faster response time (instant vs 4-8 hours)
- 40% increase in qualified leads
- 24/7 availability

---

## Changes Implemented

### Initial Build (December 2024)

1. **Database Schema**
   - Created `services` table for service packages
   - Created `leads` table for lead management with AI scoring
   - Created `conversations` table for chat tracking
   - Created `messages` table for conversation history
   - Created `appointments` table for scheduling
   - Created `analytics_events` table for tracking
   - Seeded sample services (Starter $999, Growth $2499, Enterprise $4999)
   - Seeded sample leads for demonstration

2. **API Endpoints**
   - `GET/POST /api/leads` - Lead CRUD operations
   - `GET/PATCH/DELETE /api/leads/[id]` - Individual lead management
   - `GET/POST /api/services` - Service management
   - `GET /api/dashboard/stats` - Dashboard statistics
   - `GET/POST /api/conversations` - Conversation management
   - `GET/POST /api/conversations/[id]/messages` - Message management
   - `GET/POST /api/appointments` - Appointment scheduling

3. **Dashboard Pages** (Route Group: `(dashboard)`)
   - **Dashboard** (`/`) - Main dashboard with KPIs, AI agent status, lead pipeline, recent leads
   - **AI Chat** (`/chat`) - AI-powered chat agent with service recommendations
   - **Leads** (`/leads`) - Lead management with filtering, status updates, and AI qualification
   - **New Lead** (`/leads/new`) - Create leads with AI-powered qualification
   - **Services** (`/services`) - Service package management with comparison table
   - **Analytics** (`/analytics`) - Business analytics with charts and AI performance metrics
   - **Appointments** (`/appointments`) - Appointment scheduling and management

4. **Marketing Website** (`/welcome`)
   - Beautiful landing page with hero section
   - Features showcase section
   - How it works explanation
   - Use cases for different industries
   - Pricing section with 3 tiers
   - Customer testimonials
   - Contact form
   - Full navigation with smooth scrolling
   - Responsive mobile menu
   - Footer with links

5. **AI Integration**
   - AI Chat Agent using built-in OpenAI integration
   - AI Lead Qualification generating scores, budget estimates, and recommendations
   - Context-aware responses with service knowledge

6. **UI/UX**
   - Clean, modern design with consistent styling
   - Responsive layout for all screen sizes
   - Real-time data updates using SWR
   - Toast notifications for user feedback
   - Sidebar navigation with active state highlighting
   - Separate layouts for dashboard (with sidebar) and marketing website (full width)

7. **AI Agents Enhancements (December 2025)**
   - Dedicated SEO Agent page (`/ai-agents/seo`) for keyword research, meta tags, and content audits
   - Dedicated Content Creation Agent page (`/ai-agents/content`) for blog, email, social, and ad copy
   - Dedicated Social Media Agent page (`/ai-agents/social`) with Single Post, Campaign, and Ad Copy tools, each with a large editable output area and copy-to-clipboard
   - Quick links to specialized agents from the AI Agents Hub

---

## Architecture and Technical Decisions

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **State Management**: SWR for data fetching and caching
- **Database**: PostgreSQL (Neon)
- **AI**: Built-in OpenAI integration via `generateText` and `generateObject`
- **Charts**: Recharts with Shadcn chart components

### Route Structure
```
/welcome          - Public marketing landing page (no sidebar)
/                 - Dashboard (with sidebar)
/chat             - AI Chat Agent (with sidebar)
/leads            - Lead Management (with sidebar)
/leads/new        - Add New Lead (with sidebar)
/services         - Service Packages (with sidebar)
/analytics        - Business Analytics (with sidebar)
/appointments     - Appointments (with sidebar)
```

### Database Design Rationale
- **UUID primary keys**: Better for distributed systems and security
- **JSONB fields**: Flexible storage for features array and metadata
- **Soft references**: Using lead_id foreign keys for relationships
- **Timestamps**: Automatic created_at/updated_at for auditing

### API Design
- RESTful endpoints following Next.js App Router conventions
- Query parameters for filtering (status, source, leadId)
- Type assertions with `as unknown as Type[]` pattern for queryInternalDatabase results
- Proper error handling with descriptive messages

### AI Integration Strategy
- System prompt contains full service catalog for accurate recommendations
- Conversation history passed to AI for context-aware responses
- Lead qualification uses structured output via `generateObject`
- Graceful fallback for AI errors

### State Management
- SWR for server state with automatic revalidation
- `mutate` calls after mutations to refresh related data
- Dashboard stats refresh every 30 seconds

### Layout Strategy
- Root layout provides ThemeProvider and Toaster
- Dashboard route group `(dashboard)` adds sidebar wrapper
- Welcome page has its own layout without sidebar

### Future Considerations
- WebSocket integration for real-time chat
- Email integration for automated follow-ups
- Calendar integration (Google Calendar, Outlook)
- CRM integration (HubSpot, Salesforce)
- Multi-tenant support for agencies