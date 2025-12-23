import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Configure Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const ollama = axios.create({
    baseURL: OLLAMA_BASE_URL,
    timeout: 300000, // 5 minutes
});

// Configure Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { model, prompt, provider, messages, system } = body;

        if (provider === 'google') {
            if (!process.env.GOOGLE_GENAI_API_KEY) {
                return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
            }

            const geminiModel = genAI.getGenerativeModel({ model: model || 'gemini-2.0-flash' });

            let finalPrompt = prompt;
            if (messages && messages.length > 0) {
                // Convert chat history to prompt for now, or use chatSession if needed.
                // For simplicity in this iteration, we'll append history.
                // A better approach for Gemini is using startChat.
                // But the generateContent method is simple for single turn or simple prompt.
                // Let's stick to simple prompt generation if just 'prompt' is passed, 
                // or handle chat if 'messages' is passed.
            }

            // If we have messages, let's construct a history? 
            // For now, let's assuming 'prompt' contains the full context or the user message.
            // If the client sends 'messages' (chat history), we should use it.

            if (messages) {
                const chat = geminiModel.startChat({
                    history: messages.slice(0, -1).map((m: any) => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }],
                    })),
                    systemInstruction: system,
                });

                const lastMessage = messages[messages.length - 1];
                const result = await chat.sendMessage(lastMessage.content);
                const response = await result.response;
                return NextResponse.json({ response: response.text() });
            } else {
                // Single prompt mode
                if (system) {
                    // Gemini doesn't implicitly take system prompt in generateContent easily without config,
                    // but we can prepend it.
                    finalPrompt = `${system}\n\n${prompt}`;
                }
                const result = await geminiModel.generateContent(finalPrompt);
                const response = await result.response;
                return NextResponse.json({ response: response.text() });
            }

        } else {
            // Default to Ollama
            const endpoint = messages ? '/api/chat' : '/api/generate';
            const payload = messages
                ? { model, messages, stream: false, options: { temperature: 0.7 } }
                : { model, prompt, system, stream: false, options: { temperature: 0.7 } };

            const response = await ollama.post(endpoint, payload);

            return NextResponse.json({
                response: messages ? response.data.message.content : response.data.response
            });
        }

    } catch (error: any) {
        console.error('AI API Error:', error);
        return NextResponse.json(
            { error: 'AI generation failed', details: error.message },
            { status: 500 }
        );
    }
}
