import { NextRequest, NextResponse } from 'next/server';
import { AI_AGENTS } from '@/shared/models/ai-agents';

// Get all agents
export async function GET() {
  return NextResponse.json(AI_AGENTS);
}

// Generate response from a specific agent
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { agentId, message, conversationHistory = [] } = body;

    // Find the agent
    const agent = AI_AGENTS.find((a) => a.id === agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Build the messages array for Ollama
    const messages = [
      { role: 'system', content: agent.systemPrompt },
      ...conversationHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Determine Ollama URL
    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

    // Call Ollama chat API using a separate controller for timeout if using fetch
    // or just use a longer timeout. Given we have axios available in other routes,
    // let's ensure this fetch doesn't hang.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: agent.model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2048,
          num_ctx: 4096,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);


    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text().catch(() => 'Unknown error');
      console.error('Ollama API error:', ollamaResponse.status, errorText);

      // Return fallback with more info
      return NextResponse.json({
        response: generateFallbackResponse(agent.id, message),
        model: 'fallback',
        agentId: agent.id,
        agentName: agent.name,
        error: `Ollama error ${ollamaResponse.status}`,
        note: 'AI is currently loading or unavailable. Using local fallback.',
      });
    }

    const data = await ollamaResponse.json();

    return NextResponse.json({
      response: data.message?.content || data.response,
      model: agent.model,
      agentId: agent.id,
      agentName: agent.name,
      tokensUsed: data.eval_count,
      generationTime: data.total_duration,
    });
  } catch (error) {
    console.error('Agent API error:', error);

    // Use the already parsed body if available
    const agent = body
      ? AI_AGENTS.find((a) => a.id === body.agentId)
      : undefined;

    return NextResponse.json({
      response: generateFallbackResponse(body?.agentId || 'default', body?.message || ''),
      model: 'fallback',
      agentId: body?.agentId,
      agentName: agent?.name || 'AI Agent',
      note: 'Using fallback mode. Connect Ollama for full AI capabilities.',
    });
  }
}

function generateFallbackResponse(agentId: string, message: string): string {
  const lowercaseMessage = message.toLowerCase();

  switch (agentId) {
    case 'web-dev-agent':
      if (lowercaseMessage.includes('react') || lowercaseMessage.includes('component')) {
        return `# Web Development Suggestion

Here's a basic React component structure to get you started:

\`\`\`tsx
import { useState } from 'react';

interface Props {
  title: string;
}

export function MyComponent({ title }: Props) {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-xl font-bold">{title}</h2>
      <button 
        onClick={() => setIsActive(!isActive)}
        className="mt-2 px-4 py-2 bg-primary text-white rounded"
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
}
\`\`\`

**Best Practices:**
- Use TypeScript for type safety
- Keep components small and focused
- Use meaningful prop names
- Add proper accessibility attributes

*Note: Connect Ollama for more detailed, context-aware responses.*`;
      }
      return `I can help you with web development! Here are some things I can assist with:

• **React/Next.js Components** - Generate modern, reusable components
• **TypeScript** - Type-safe code with proper interfaces
• **API Development** - RESTful endpoints and data handling
• **Performance** - Optimization techniques and best practices
• **Testing** - Unit tests and integration tests

What specific web development task can I help you with?

*Note: Connect Ollama on your VPS for full AI-powered code generation.*`;

    case 'analytics-agent':
      return `# Analytics Insights

Based on your query, here are some analytical perspectives:

**Key Metrics to Consider:**
1. **Conversion Rate** - Track how visitors become customers
2. **Customer Lifetime Value** - Long-term revenue per customer
3. **Churn Rate** - Customer retention analysis
4. **ROI** - Return on marketing investments

**Recommended Actions:**
- Set up proper tracking and attribution
- Create weekly performance dashboards
- A/B test key landing pages
- Monitor competitor benchmarks

**Quick Analysis Framework:**
1. Define your key performance indicators
2. Collect baseline data
3. Identify trends and patterns
4. Generate actionable insights
5. Implement and measure changes

*Connect Ollama for detailed data analysis and custom insights.*`;

    case 'content-agent':
      return `# Content Creation Framework

Here's a structure for creating compelling content:

**Blog Post Template:**

## [Attention-Grabbing Headline]

**Introduction** (Hook your readers)
- Start with a compelling statistic or question
- Address the reader's pain point
- Preview what they'll learn

**Main Content**
- Break into scannable sections
- Use bullet points and lists
- Include relevant examples
- Add visuals where possible

**Conclusion**
- Summarize key takeaways
- Include a clear call-to-action
- Encourage engagement

**SEO Checklist:**
✅ Keyword in title and first paragraph
✅ Meta description (150-160 characters)
✅ Internal and external links
✅ Image alt text
✅ Readable URL structure

*Connect Ollama for AI-generated content tailored to your specific needs.*`;

    case 'marketing-agent':
      return `# Marketing Strategy Framework

**Campaign Planning Checklist:**

1. **Define Objectives**
   - Brand awareness
   - Lead generation
   - Sales conversion
   - Customer retention

2. **Identify Target Audience**
   - Demographics
   - Psychographics
   - Pain points
   - Buying behavior

3. **Select Channels**
   - Paid ads (Google, Facebook, LinkedIn)
   - Content marketing
   - Email campaigns
   - Social media
   - Influencer partnerships

4. **Create Messaging**
   - Value proposition
   - Key benefits
   - Call-to-action
   - Brand voice

5. **Set Budget & Timeline**
   - Channel allocation
   - Testing budget
   - Scaling plan

**Quick Wins:**
• Optimize your landing pages for conversion
• Set up retargeting campaigns
• Create lead magnets
• Build email sequences

*Connect Ollama for personalized marketing strategies and ad copy generation.*`;

    case 'social-media-agent':
      return `# Social Media Content Ideas

**Platform-Specific Tips:**

📘 **Facebook**
- Best posting times: 1-4 PM
- Use eye-catching visuals
- Ask questions to boost engagement
- Go live regularly

📸 **Instagram**
- Use 5-10 relevant hashtags
- Post Reels for maximum reach
- Engage with Stories daily
- Collaborate with creators

💼 **LinkedIn**
- Share industry insights
- Post thought leadership content
- Engage in comments
- Use LinkedIn articles

🐦 **Twitter/X**
- Tweet 3-5 times daily
- Use trending hashtags
- Create threads for complex topics
- Engage with your community

**Content Calendar Template:**
| Day | Platform | Content Type | Topic |
|-----|----------|--------------|-------|
| Mon | LinkedIn | Article | Industry news |
| Tue | Instagram | Reel | Behind the scenes |
| Wed | Twitter | Thread | Tips & tricks |
| Thu | Facebook | Live | Q&A session |
| Fri | All | Promo | Weekly offer |

*Connect Ollama for AI-generated posts and personalized strategies.*`;

    case 'seo-agent':
      return `# SEO Optimization Guide

**On-Page SEO Checklist:**

✅ **Title Tag** (50-60 characters)
- Include primary keyword
- Make it compelling
- Add brand name

✅ **Meta Description** (150-160 characters)
- Summarize page content
- Include call-to-action
- Use target keyword

✅ **Headers (H1-H6)**
- One H1 per page
- Use keywords naturally
- Create logical hierarchy

✅ **Content Optimization**
- 1,500+ words for pillar content
- Include related keywords
- Add internal links
- Use multimedia

**Technical SEO:**
- Page speed < 3 seconds
- Mobile-friendly design
- SSL certificate
- XML sitemap
- Clean URL structure

**Keyword Research Tips:**
1. Start with seed keywords
2. Analyze search intent
3. Check competition
4. Find long-tail variations
5. Group by topic clusters

**Quick Wins:**
• Fix broken links
• Optimize images
• Add schema markup
• Improve Core Web Vitals

*Connect Ollama for detailed SEO analysis and keyword recommendations.*`;

    default:
      return `I'm your AI assistant! I can help you with:

• **Web Development** - Code, components, debugging
• **Analytics** - Data insights, trends, forecasting
• **Content Creation** - Blog posts, copy, articles
• **Marketing** - Campaigns, strategies, ad copy
• **Social Media** - Posts, calendars, engagement
• **SEO** - Keywords, optimization, rankings

Please select a specific agent or ask me anything!

*For full AI capabilities, ensure Ollama is running on your VPS.*`;
  }
}
