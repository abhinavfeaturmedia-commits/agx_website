import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';
import { Client } from '../types.js';

/**
 * Search and list clients
 */
export async function searchClients(params: {
  query?: string;
  status?: string;
  limit?: number;
}): Promise<ToolResult> {
  try {
    let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

    if (params.query) {
      const q = params.query.trim();
      query = query.or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;
    if (error) return formatError('Failed to search clients', error);

    return formatSuccess(`Found ${data?.length || 0} clients`, data);
  } catch (err) {
    return formatError('Unexpected error searching clients', err);
  }
}

/**
 * Create a new client or convert a lead into a client
 */
export async function createClient(params: {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  lead_id?: string;
  total_value?: number;
  notes?: string;
  account_manager?: string;
}): Promise<ToolResult> {
  try {
    const newClient: Partial<Client> = {
      name: params.name,
      company: params.company,
      email: params.email || null,
      phone: params.phone || null,
      website: params.website || null,
      industry: params.industry || null,
      total_value: params.total_value ?? 0,
      notes: params.notes || null,
      account_manager: params.account_manager || null,
      status: 'Active',
    };

    const { data, error } = await supabase.from('clients').insert([newClient]).select().single();
    if (error) return formatError('Failed to create client', error);

    // If converted from a lead, link and update lead status to WON
    if (params.lead_id) {
      await supabase
        .from('leads')
        .update({
          converted_client_id: data.id,
          status: 'WON',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.lead_id);
    }

    return formatSuccess(`Client "${params.company}" (${params.name}) created successfully with ID ${data.id}`, data);
  } catch (err) {
    return formatError('Unexpected error creating client', err);
  }
}

/**
 * Update client details
 */
export async function updateClient(params: {
  id?: string;
  company?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'Active' | 'Inactive' | 'On Hold';
  notes?: string;
}): Promise<ToolResult> {
  try {
    let clientId = params.id;

    if (!clientId && params.company) {
      const { data: found } = await supabase
        .from('clients')
        .select('id')
        .ilike('company', `%${params.company}%`)
        .limit(1)
        .single();
      if (found) clientId = found.id;
    }

    if (!clientId) {
      return formatError('Client not found. Please provide client ID or company name.');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (params.name) updates.name = params.name;
    if (params.email) updates.email = params.email;
    if (params.phone) updates.phone = params.phone;
    if (params.status) updates.status = params.status;
    if (params.notes) updates.notes = params.notes;

    const { data, error } = await supabase.from('clients').update(updates).eq('id', clientId).select().single();
    if (error) return formatError('Failed to update client', error);

    return formatSuccess(`Client "${data.company}" updated successfully`, data);
  } catch (err) {
    return formatError('Unexpected error updating client', err);
  }
}
