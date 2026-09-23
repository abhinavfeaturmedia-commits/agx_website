export interface Lead {
  id?: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  location?: string | null;
  interested_service: string;
  estimated_deal_value?: number;
  probability?: number;
  source?: string;
  assigned_to?: string | null;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  next_follow_up?: string | null;
  last_contacted?: string | null;
  notes?: string | null;
  converted_client_id?: string | null;
  converted_project_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LeadActivity {
  id?: string;
  lead_id: string;
  user_name: string;
  activity_type: 'Call' | 'WhatsApp' | 'Email' | 'Meeting' | 'Note' | 'Status Change';
  notes?: string | null;
  created_at?: string;
}

export interface Client {
  id?: string;
  name: string;
  company: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  industry?: string | null;
  gst_tax_id?: string | null;
  account_manager?: string | null;
  total_value?: number;
  total_paid?: number;
  outstanding_amount?: number;
  source?: string;
  notes?: string | null;
  status?: 'Active' | 'Inactive' | 'On Hold';
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id?: string;
  name: string;
  client_id?: string | null;
  client_name?: string | null;
  service_type: string;
  project_manager?: string | null;
  assigned_team?: string[];
  start_date?: string | null;
  due_date?: string | null;
  delivery_date?: string | null;
  project_value?: number;
  received_amount?: number;
  pending_amount?: number;
  status?: 'NOT STARTED' | 'PLANNING' | 'IN PROGRESS' | 'TESTING' | 'CLIENT REVIEW' | 'REVISION' | 'COMPLETED' | 'MAINTENANCE';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  progress?: number;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id?: string;
  title: string;
  description?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'TO DO' | 'IN PROGRESS' | 'IN REVIEW' | 'COMPLETED' | 'BLOCKED';
  start_date?: string | null;
  due_date?: string | null;
  estimated_hours?: number;
  actual_hours?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id?: string;
  invoice_number: string;
  client_id?: string | null;
  client_name: string;
  project_id?: string | null;
  issue_date: string;
  due_date: string;
  items?: any[];
  subtotal?: number;
  is_gst?: boolean;
  gst_type?: string;
  tax_rate?: number;
  tax?: number;
  total?: number;
  paid_amount?: number;
  status?: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue';
  notes?: string | null;
  created_at?: string;
}

export interface CalendarEvent {
  id?: string;
  title: string;
  event_type: 'Meeting' | 'Client Follow-up' | 'Project Deadline' | 'Task Due' | 'Payment Reminder' | 'Agreement Expiry';
  start_time: string;
  end_time?: string | null;
  is_all_day?: boolean;
  client_id?: string | null;
  project_id?: string | null;
  lead_id?: string | null;
  assigned_to?: string | null;
  location?: string | null;
  meeting_url?: string | null;
  description?: string | null;
  status?: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  created_at?: string;
}
