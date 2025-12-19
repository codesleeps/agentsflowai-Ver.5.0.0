import { NextRequest, NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import type { Conversation } from '@/shared/models/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');
    
    let query = 'SELECT * FROM conversations';
    const params: string[] = [];
    const conditions: string[] = [];
    
    if (leadId) {
      conditions.push(`lead_id = $${params.length + 1}`);
      params.push(leadId);
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY started_at DESC LIMIT 50';
    
    const conversations = await queryInternalDatabase(query, params) as unknown as Conversation[];
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, channel } = body;
    
    const result = await queryInternalDatabase(
      `INSERT INTO conversations (lead_id, channel)
       VALUES ($1, $2)
       RETURNING *`,
      [lead_id || null, channel || 'chat']
    ) as unknown as Conversation[];
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}