import { AI_AGENTS } from '@/shared/models/ai-agents';

describe('AI Agents Configuration', () => {
    it('should have a Fast Chat agent', () => {
        const fastChat = AI_AGENTS.find(a => a.id === 'fast-chat');
        expect(fastChat).toBeDefined();
        expect(fastChat?.provider).toBe('ollama');
        expect(fastChat?.model).toBe('ministral-3:3b');
    });

    it('should have cloud agents configured for Gemini', () => {
        const cloudAgents = AI_AGENTS.filter(a => a.provider === 'google');
        expect(cloudAgents.length).toBeGreaterThan(0);

        const webDev = AI_AGENTS.find(a => a.id === 'web-dev-agent');
        expect(webDev?.model).toBe('gemini-2.0-flash');
    });

    it('should have unique IDs for all agents', () => {
        const ids = AI_AGENTS.map(a => a.id);
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);
    });
});
