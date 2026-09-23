import { supabase, formatSuccess, formatError, ToolResult } from '../db.js';
import { Task } from '../types.js';

/**
 * Get tasks with filters (e.g. today's tasks, assigned to me, urgent priority)
 */
export async function getTasks(params: {
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_today?: boolean;
  limit?: number;
}): Promise<ToolResult> {
  try {
    let query = supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });

    if (params.status) {
      query = query.eq('status', params.status.toUpperCase());
    }

    if (params.priority) {
      query = query.eq('priority', params.priority);
    }

    if (params.assigned_to) {
      query = query.ilike('assigned_to', `%${params.assigned_to}%`);
    }

    if (params.due_today) {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('due_date', today);
    }

    query = query.limit(params.limit || 25);

    const { data, error } = await query;
    if (error) return formatError('Failed to fetch tasks', error);

    return formatSuccess(`Found ${data?.length || 0} tasks`, data);
  } catch (err) {
    return formatError('Unexpected error fetching tasks', err);
  }
}

/**
 * Create a new task
 */
export async function createTask(params: {
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  due_date?: string;
  project_name?: string;
  project_id?: string;
  client_name?: string;
}): Promise<ToolResult> {
  try {
    let projectId = params.project_id;
    let clientId: string | null = null;

    if (!projectId && params.project_name) {
      const { data: project } = await supabase
        .from('projects')
        .select('id, client_id')
        .ilike('name', `%${params.project_name}%`)
        .limit(1)
        .single();
      if (project) {
        projectId = project.id;
        clientId = project.client_id;
      }
    }

    if (!clientId && params.client_name) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .ilike('company', `%${params.client_name}%`)
        .limit(1)
        .single();
      if (client) clientId = client.id;
    }

    const newTask: Partial<Task> = {
      title: params.title,
      description: params.description || null,
      assigned_to: params.assigned_to || null,
      priority: params.priority || 'Medium',
      status: 'TO DO',
      due_date: params.due_date || null,
      project_id: projectId || null,
      client_id: clientId || null,
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
    if (error) return formatError('Failed to create task', error);

    return formatSuccess(`Task "${params.title}" created with ID ${data.id}`, data);
  } catch (err) {
    return formatError('Unexpected error creating task', err);
  }
}

/**
 * Mark a task complete or update status
 */
export async function updateTask(params: {
  id?: string;
  title?: string;
  status?: 'TO DO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED' | 'BLOCKED';
  assigned_to?: string;
  due_date?: string;
  actual_hours?: number;
}): Promise<ToolResult> {
  try {
    let taskId = params.id;

    if (!taskId && params.title) {
      const { data: found } = await supabase
        .from('tasks')
        .select('id')
        .ilike('title', `%${params.title}%`)
        .limit(1)
        .single();
      if (found) taskId = found.id;
    }

    if (!taskId) {
      return formatError('Task not found. Please provide task ID or title.');
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (params.status) updates.status = params.status;
    if (params.assigned_to) updates.assigned_to = params.assigned_to;
    if (params.due_date) updates.due_date = params.due_date;
    if (params.actual_hours !== undefined) updates.actual_hours = params.actual_hours;

    const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
    if (error) return formatError('Failed to update task', error);

    return formatSuccess(`Task "${data.title}" updated to status ${data.status}`, data);
  } catch (err) {
    return formatError('Unexpected error updating task', err);
  }
}
