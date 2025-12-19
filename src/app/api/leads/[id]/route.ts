import { NextRequest, NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import type { Lead } from '@/shared/models/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leads = await queryInternalDatabase(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    ) as unknown as Lead[];
    
    if (leads.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json(leads[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, company, phone, status, score, budget, timeline, notes, interests } = body;
    
    const updates: string[] = [];
    const values: (string | number | null | string[])[] = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (company !== undefined) {
      updates.push(`company = $${paramIndex++}`);
      values.push(company);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'qualified') {
        updates.push(`qualified_at = CURRENT_TIMESTAMP`);
      }
    }
    if (score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(score);
    }
    if (budget !== undefined) {
      updates.push(`budget = $${paramIndex++}`);
      values.push(budget);
    }
    if (timeline !== undefined) {
      updates.push(`timeline = $${paramIndex++}`);
      values.push(timeline);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(notes);
    }
    if (interests !== undefined) {
      updates.push(`interests = $${paramIndex++}`);
      values.push(JSON.stringify(interests));
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const result = await queryInternalDatabase(
      `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    ) as unknown as Lead[];
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await queryInternalDatabase(
      'DELETE FROM leads WHERE id = $1 RETURNING *',
      [id]
    ) as unknown as Lead[];
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}