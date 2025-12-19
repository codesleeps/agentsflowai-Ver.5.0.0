import { NextRequest, NextResponse } from 'next/server';

// Ollama API endpoint - defaults to localhost but can be configured via env
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

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
    console.error('Ollama API error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Ollama', details: String(error) },
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

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'mistral',
      prompt,
      system,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        ...options,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: 'Ollama generation failed', details: errorText },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function handleChat(params: {
  model: string;
  messages: { role: string; content: string }[];
  options?: Record<string, unknown>;
}) {
  const { model, messages, options } = params;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'mistral',
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        ...options,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: 'Ollama chat failed', details: errorText },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function handleListModels() {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
    method: 'GET',
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to list models' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

async function handlePullModel(params: { name: string }) {
  const { name } = params;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, stream: false }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to pull model' },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'connected',
        ollamaUrl: OLLAMA_BASE_URL,
        models: data.models || [],
      });
    } else {
      return NextResponse.json({
        status: 'disconnected',
        ollamaUrl: OLLAMA_BASE_URL,
        error: 'Cannot reach Ollama server',
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'disconnected',
      ollamaUrl: OLLAMA_BASE_URL,
      error: String(error),
    });
  }
}
