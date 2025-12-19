import { NextResponse } from 'next/server';
import { queryInternalDatabase } from '@/server-lib/internal-db-query';
import type { Lead, DashboardStats } from '@/shared/models/types';

export async function GET() {
  try {
    // Get total leads
    const totalLeadsResult = await queryInternalDatabase(
      'SELECT COUNT(*) as count FROM leads'
    ) as unknown as { count: string }[];
    const totalLeads = parseInt(totalLeadsResult[0]?.count ?? '0');
    
    // Get qualified leads
    const qualifiedLeadsResult = await queryInternalDatabase(
      "SELECT COUNT(*) as count FROM leads WHERE status IN ('qualified', 'proposal', 'won')"
    ) as unknown as { count: string }[];
    const qualifiedLeads = parseInt(qualifiedLeadsResult[0]?.count ?? '0');
    
    // Get active conversations
    const activeConversationsResult = await queryInternalDatabase(
      "SELECT COUNT(*) as count FROM conversations WHERE status = 'active'"
    ) as unknown as { count: string }[];
    const activeConversations = parseInt(activeConversationsResult[0]?.count ?? '0');
    
    // Get upcoming appointments
    const upcomingAppointmentsResult = await queryInternalDatabase(
      "SELECT COUNT(*) as count FROM appointments WHERE status = 'scheduled' AND scheduled_at > NOW()"
    ) as unknown as { count: string }[];
    const upcomingAppointments = parseInt(upcomingAppointmentsResult[0]?.count ?? '0');
    
    // Calculate estimated revenue from won leads (based on Enterprise package price)
    const wonLeadsResult = await queryInternalDatabase(
      "SELECT COUNT(*) as count FROM leads WHERE status = 'won'"
    ) as unknown as { count: string }[];
    const wonLeads = parseInt(wonLeadsResult[0]?.count ?? '0');
    const revenue = wonLeads * 4999; // Estimated based on enterprise package
    
    // Get leads by status
    const leadsByStatus = await queryInternalDatabase(
      'SELECT status, COUNT(*) as count FROM leads GROUP BY status ORDER BY count DESC'
    ) as unknown as { status: string; count: string }[];
    
    // Get leads by source
    const leadsBySource = await queryInternalDatabase(
      'SELECT source, COUNT(*) as count FROM leads GROUP BY source ORDER BY count DESC'
    ) as unknown as { source: string; count: string }[];
    
    // Get recent leads
    const recentLeads = await queryInternalDatabase(
      'SELECT * FROM leads ORDER BY created_at DESC LIMIT 5'
    ) as unknown as Lead[];
    
    const stats: DashboardStats = {
      totalLeads,
      qualifiedLeads,
      conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0,
      activeConversations,
      upcomingAppointments,
      revenue,
      leadsByStatus: leadsByStatus.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      })),
      leadsBySource: leadsBySource.map(row => ({
        source: row.source,
        count: parseInt(row.count)
      })),
      recentLeads
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}