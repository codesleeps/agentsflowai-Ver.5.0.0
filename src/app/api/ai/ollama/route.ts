import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Ollama API endpoint - defaults to localhost but can be configured via env
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// Create an axios instance with a long timeout for Ollama
const ollama = axios.create({
  baseURL: OLLAMA_BASE_URL,
  timeout: 300000, // 5 minutes timeout for model loading and generation
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate':
        return handleGenerate(params);
      case 'chat':
        return handleChat(params);
      case 'models':
        return handleListModels();
      case 'pull':
        return handlePullModel(params);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ollama API Root Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to communicate with Ollama',
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

async function handleGenerate(params: {
  model: string;
  prompt: string;
  system?: string;
  options?: Record<string, unknown>;
}) {
  const { model, prompt, system, options } = params;

  try {
    const response = await ollama.post('/api/generate', {
      model: model || 'mistral',
      prompt,
      system,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 4096,
        ...options,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Ollama generation error:', error.message, error.response?.data);
    return NextResponse.json(
      {
        error: 'Ollama generation failed',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

async function handleChat(params: {
  model: string;
  messages: { role: string; content: string }[];
  options?: Record<string, unknown>;
}) {
  const { model, messages, options } = params;

  try {
    const response = await ollama.post('/api/chat', {
      model: model || 'mistral',
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 4096,
        ...options,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Ollama chat error:', error.message, error.response?.data);
    return NextResponse.json(
      {
        error: 'Ollama chat failed',
        details: error.response?.data || error.message
      },
      { status: error.response?.status || 500 }
    );
  }
}

async function handleListModels() {
  try {
    const response = await ollama.get('/api/tags');
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to list models', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

async function handlePullModel(params: { name: string }) {
  const { name } = params;

  try {
    const response = await ollama.post('/api/pull', { name, stream: false });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to pull model', details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await ollama.get('/api/tags');
    return NextResponse.json({
      status: 'connected',
      ollamaUrl: OLLAMA_BASE_URL,
      models: response.data.models || [],
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'disconnected',
      ollamaUrl: OLLAMA_BASE_URL,
      error: error.message,
    });
  }
}

