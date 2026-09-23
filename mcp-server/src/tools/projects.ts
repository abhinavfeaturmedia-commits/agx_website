import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';
import { Project } from '../types.js';

/**
 * List and filter projects
 */
export async function listProjects(params: {
  status?: string;
  client_name?: string;
  project_manager?: string;
  limit?: number;
}): Promise<ToolResult> {
  try {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status.toUpperCase());
    }

    if (params.client_name) {
      query = query.ilike('client_name', `%${params.client_name}%`);
    }

    if (params.project_manager) {
      query = query.ilike('project_manager', `%${params.project_manager}%`);
    }

    query = query.limit(params.limit || 20);

    const { data, error } = await query;
    if (error) return formatError('Failed to list projects', error);

    return formatSuccess(`Found ${data?.length || 0} projects`, data);
  } catch (err) {
    return formatError('Unexpected error listing projects', err);
  }
}

/**
 * Create a new project
 */
export async function createProject(params: {
  name: string;
  client_name: string;
  client_id?: string;
  service_type?: string;
  project_manager?: string;
  start_date?: string;
  due_date?: string;
  project_value?: number;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  description?: string;
}): Promise<ToolResult> {
  try {
    let clientId = params.client_id;

    // Resolve client ID if missing
    if (!clientId && params.client_name) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .ilike('company', `%${params.client_name}%`)
        .limit(1)
        .single();
      if (client) clientId = client.id;
    }

    const newProject: Partial<Project> = {
      name: params.name,
      client_id: clientId || null,
      client_name: params.client_name,
      service_type: params.service_type || 'Workflow Automation',
      project_manager: params.project_manager || 'Lead Architect',
      start_date: params.start_date || new Date().toISOString().split('T')[0],
      due_date: params.due_date || null,
      project_value: params.project_value ?? 0,
      received_amount: 0,
      pending_amount: params.project_value ?? 0,
      status: 'PLANNING',
      priority: params.priority || 'Medium',
      progress: 0,
      description: params.description || null,
    };

    const { data, error } = await supabase.from('projects').insert([newProject]).select().single();
    if (error) return formatError('Failed to create project', error);

    return formatSuccess(`Project "${params.name}" created successfully for ${params.client_name} with ID ${data.id}`, data);
  } catch (err) {
    return formatError('Unexpected error creating project', err);
  }
}

/**
 * Update project progress or status
 */
export async function updateProject(params: {
  id?: string;
  name?: string;
  status?: 'NOT STARTED' | 'PLANNING' | 'IN PROGRESS' | 'TESTING' | 'CLIENT REVIEW' | 'REVISION' | 'COMPLETED' | 'MAINTENANCE';
  progress?: number;
  received_amount?: number;
  due_date?: string;
  description?: string;
}): Promise<ToolResult> {
  try {
    let projectId = params.id;

    if (!projectId && params.name) {
      const { data: found } = await supabase
        .from('projects')
        .select('id')
        .ilike('name', `%${params.name}%`)
        .limit(1)
        .single();
      if (found) projectId = found.id;
    }

    if (!projectId) {
      return formatError('Project not found. Please provide project ID or name.');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (params.status) updates.status = params.status;
    if (params.progress !== undefined) updates.progress = Math.min(100, Math.max(0, params.progress));
    if (params.received_amount !== undefined) updates.received_amount = params.received_amount;
    if (params.due_date) updates.due_date = params.due_date;
    if (params.description) updates.description = params.description;

    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId).select().single();
    if (error) return formatError('Failed to update project', error);

    return formatSuccess(`Project "${data.name}" updated (Status: ${data.status}, Progress: ${data.progress}%)`, data);
  } catch (err) {
    return formatError('Unexpected error updating project', err);
  }
}
