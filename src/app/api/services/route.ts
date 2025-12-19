import { NextRequest, NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import type { Service } from '@/shared/models/types';

export async function GET() {
  try {
    const services = await queryInternalDatabase(
      'SELECT * FROM services WHERE is_active = true ORDER BY price ASC'
    ) as unknown as Service[];
    
    // Parse features from JSON string to array
    const parsedServices = services.map(service => ({
      ...service,
      features: typeof service.features === 'string' 
        ? JSON.parse(service.features) 
        : service.features
    }));
    
    return NextResponse.json(parsedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, tier, price, features } = body;
    
    if (!name || !tier || price === undefined) {
      return NextResponse.json({ error: 'Name, tier, and price are required' }, { status: 400 });
    }
    
    const result = await queryInternalDatabase(
      `INSERT INTO services (name, description, tier, price, features)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, tier, price, JSON.stringify(features || [])]
    ) as unknown as Service[];
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}