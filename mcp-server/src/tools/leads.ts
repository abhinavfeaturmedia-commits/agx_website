import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';
import { Lead, LeadActivity } from '../types.js';

/**
 * Search and list leads with flexible filters
 */
export async function searchLeads(params: {
  query?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  limit?: number;
}): Promise<ToolResult> {
  try {
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (params.query) {
      const q = params.query.trim();
      query = query.or(`name.ilike.%${q}%,company.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
    }

    if (params.status) {
      query = query.eq('status', params.status.toUpperCase());
    }

    if (params.priority) {
      query = query.eq('priority', params.priority);
    }

    if (params.assigned_to) {
      query = query.ilike('assigned_to', `%${params.assigned_to}%`);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;
    if (error) return formatError('Failed to search leads', error);

    return formatSuccess(`Found ${data?.length || 0} leads`, data);
  } catch (err) {
    return formatError('Unexpected error searching leads', err);
  }
}

/**
 * Create a new lead in the CRM
 */
export async function createLead(params: {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  location?: string;
  interested_service?: string;
  estimated_deal_value?: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  source?: string;
  assigned_to?: string;
  next_follow_up?: string;
  notes?: string;
}): Promise<ToolResult> {
  try {
    const newLead: Partial<Lead> = {
      name: params.name,
      company: params.company || null,
      phone: params.phone || null,
      email: params.email || null,
      whatsapp: params.whatsapp || params.phone || null,
      location: params.location || null,
      interested_service: params.interested_service || 'AI Automation',
      estimated_deal_value: params.estimated_deal_value ?? 0,
      priority: params.priority || 'Medium',
      source: params.source || 'Direct Outreach / AI Assistant',
      assigned_to: params.assigned_to || null,
      status: 'NEW',
      next_follow_up: params.next_follow_up || null,
      notes: params.notes || null,
    };

    const { data, error } = await supabase.from('leads').insert([newLead]).select().single();
    if (error) return formatError('Failed to create lead', error);

    // If initial note or follow up was given, log initial activity
    if (params.notes || params.next_follow_up) {
      await supabase.from('lead_activities').insert([
        {
          lead_id: data.id,
          user_name: params.assigned_to || 'AI Assistant',
          activity_type: 'Note',
          notes: `Lead created via AI Assistant. Initial notes: ${params.notes || 'No initial notes'}`,
        },
      ]);
    }

    return formatSuccess(`Lead "${params.name}" created successfully with ID ${data.id}`, data);
  } catch (err) {
    return formatError('Unexpected error creating lead', err);
  }
}

/**
 * Update an existing lead's status, deal value, or follow-up date
 */
export async function updateLead(params: {
  id?: string;
  name?: string;
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  estimated_deal_value?: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  next_follow_up?: string;
  notes?: string;
  assigned_to?: string;
}): Promise<ToolResult> {
  try {
    let leadId = params.id;

    // If ID not provided, try to find lead by name
    if (!leadId && params.name) {
      const { data: found } = await supabase
        .from('leads')
        .select('id, name')
        .ilike('name', `%${params.name}%`)
        .limit(1)
        .single();
      if (found) leadId = found.id;
    }

    if (!leadId) {
      return formatError('Lead not found. Please provide a valid lead ID or exact name.');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (params.status) updates.status = params.status;
    if (params.estimated_deal_value !== undefined) updates.estimated_deal_value = params.estimated_deal_value;
    if (params.priority) updates.priority = params.priority;
    if (params.next_follow_up) updates.next_follow_up = params.next_follow_up;
    if (params.notes) updates.notes = params.notes;
    if (params.assigned_to) updates.assigned_to = params.assigned_to;

    const { data, error } = await supabase.from('leads').update(updates).eq('id', leadId).select().single();
    if (error) return formatError('Failed to update lead', error);

    // If status changed, log activity
    if (params.status) {
      await supabase.from('lead_activities').insert([
        {
          lead_id: leadId,
          user_name: 'AI Assistant',
          activity_type: 'Status Change',
          notes: `Status changed to ${params.status}${params.notes ? `. Note: ${params.notes}` : ''}`,
        },
      ]);
    }

    return formatSuccess(`Lead "${data.name}" updated successfully (Status: ${data.status})`, data);
  } catch (err) {
    return formatError('Unexpected error updating lead', err);
  }
}

/**
 * Log a call, meeting, WhatsApp message, or note for a lead
 */
export async function logLeadActivity(params: {
  lead_id?: string;
  lead_name?: string;
  user_name?: string;
  activity_type: 'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Note';
  notes: string;
  set_next_follow_up?: string;
}): Promise<ToolResult> {
  try {
    let leadId = params.lead_id;

    if (!leadId && params.lead_name) {
      const { data: found } = await supabase
        .from('leads')
        .select('id, name')
        .ilike('name', `%${params.lead_name}%`)
        .limit(1)
        .single();
      if (found) leadId = found.id;
    }

    if (!leadId) {
      return formatError('Lead not found. Please provide a valid lead ID or lead name.');
    }

    const activity: Partial<LeadActivity> = {
      lead_id: leadId,
      user_name: params.user_name || 'AI Assistant',
      activity_type: params.activity_type,
      notes: params.notes,
    };

    const { data, error } = await supabase.from('lead_activities').insert([activity]).select().single();
    if (error) return formatError('Failed to log lead activity', error);

    // Update last_contacted and optionally next_follow_up on the lead
    const leadUpdates: Record<string, any> = {
      last_contacted: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (params.set_next_follow_up) {
      leadUpdates.next_follow_up = params.set_next_follow_up;
    }
    await supabase.from('leads').update(leadUpdates).eq('id', leadId);

    return formatSuccess(`Activity logged for lead: [${params.activity_type}] ${params.notes}`, data);
  } catch (err) {
    return formatError('Unexpected error logging lead activity', err);
  }
}
