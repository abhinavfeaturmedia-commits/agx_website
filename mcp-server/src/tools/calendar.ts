import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';
import { CalendarEvent } from '../types.js';

/**
 * Get upcoming calendar events and meetings
 */
export async function getUpcomingEvents(params: {
  days_ahead?: number;
  event_type?: string;
  limit?: number;
}): Promise<ToolResult> {
  try {
    const days = params.days_ahead || 7;
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    let query = supabase
      .from('calendar_events')
      .select('*')
      .gte('start_time', now.toISOString())
      .lte('start_time', futureDate.toISOString())
      .order('start_time', { ascending: true });

    if (params.event_type) {
      query = query.eq('event_type', params.event_type);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;
    if (error) return formatError('Failed to fetch calendar events', error);

    return formatSuccess(`Found ${data?.length || 0} upcoming events in next ${days} days`, data);
  } catch (err) {
    return formatError('Unexpected error fetching calendar events', err);
  }
}

/**
 * Schedule a meeting or calendar event
 */
export async function scheduleEvent(params: {
  title: string;
  event_type?: 'Meeting' | 'Client Follow-up' | 'Project Deadline' | 'Task Due' | 'Payment Reminder' | 'Agreement Expiry';
  start_time: string;
  end_time?: string;
  meeting_url?: string;
  description?: string;
  assigned_to?: string;
  client_name?: string;
}): Promise<ToolResult> {
  try {
    let clientId: string | null = null;

    if (params.client_name) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .ilike('company', `%${params.client_name}%`)
        .limit(1)
        .single();
      if (client) clientId = client.id;
    }

    const newEvent: Partial<CalendarEvent> = {
      title: params.title,
      event_type: params.event_type || 'Meeting',
      start_time: params.start_time,
      end_time: params.end_time || null,
      meeting_url: params.meeting_url || null,
      description: params.description || null,
      assigned_to: params.assigned_to || null,
      client_id: clientId || null,
      status: 'Scheduled',
    };

    const { data, error } = await supabase.from('calendar_events').insert([newEvent]).select().single();
    if (error) return formatError('Failed to schedule event', error);

    return formatSuccess(`Event "${params.title}" scheduled for ${params.start_time}`, data);
  } catch (err) {
    return formatError('Unexpected error scheduling event', err);
  }
}
