import { NextRequest, NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import type { Appointment } from '@/shared/models/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming');
    
    let query = 'SELECT * FROM appointments';
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
    
    if (upcoming === 'true') {
      conditions.push('scheduled_at > NOW()');
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY scheduled_at ASC LIMIT 50';
    
    const appointments = await queryInternalDatabase(query, params) as unknown as Appointment[];
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, title, description, scheduled_at, duration_minutes, meeting_link, notes } = body;
    
    if (!lead_id || !title || !scheduled_at) {
      return NextResponse.json({ error: 'Lead ID, title, and scheduled time are required' }, { status: 400 });
    }
    
    const result = await queryInternalDatabase(
      `INSERT INTO appointments (lead_id, title, description, scheduled_at, duration_minutes, meeting_link, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [lead_id, title, description || null, scheduled_at, duration_minutes || 30, meeting_link || null, notes || null]
    ) as unknown as Appointment[];
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}