-- AGX CRM & Business Operating System Database Schema
-- Supabase / PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Developer', -- 'Super Admin', 'Admin', 'Sales Manager', 'Sales Executive', 'Project Manager', 'Developer', 'Accountant'
    avatar_url TEXT,
    phone TEXT,
    department TEXT,
    password_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    permissions JSONB DEFAULT '{}'::jsonb,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    whatsapp TEXT,
    location TEXT,
    interested_service TEXT NOT NULL DEFAULT 'AI Automation',
    estimated_deal_value NUMERIC DEFAULT 0,
    probability INTEGER DEFAULT 50,
    source TEXT DEFAULT 'Website',
    assigned_to TEXT,
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    status TEXT DEFAULT 'NEW', -- 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON', 'LOST'
    next_follow_up TIMESTAMP WITH TIME ZONE,
    last_contacted TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    converted_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    converted_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Lead Activities
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    activity_type TEXT NOT NULL, -- 'Call', 'WhatsApp', 'Email', 'Meeting', 'Note', 'Status Change'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    industry TEXT,
    gst_tax_id TEXT,
    account_manager TEXT,
    total_value NUMERIC DEFAULT 0,
    total_paid NUMERIC DEFAULT 0,
    outstanding_amount NUMERIC DEFAULT 0,
    source TEXT DEFAULT 'Inbound',
    notes TEXT,
    status TEXT DEFAULT 'Active', -- 'Active', 'Inactive', 'On Hold'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    service_type TEXT NOT NULL, -- 'Custom AI Agent', 'Workflow Automation', 'Full-stack Platform', 'Internal Tools'
    project_manager TEXT,
    assigned_team TEXT[],
    start_date DATE,
    due_date DATE,
    delivery_date DATE,
    project_value NUMERIC DEFAULT 0,
    received_amount NUMERIC DEFAULT 0,
    pending_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'PLANNING', -- 'NOT STARTED', 'PLANNING', 'IN PROGRESS', 'TESTING', 'CLIENT REVIEW', 'REVISION', 'COMPLETED', 'MAINTENANCE'
    priority TEXT DEFAULT 'Medium',
    progress INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Project Milestones
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'In Progress', 'Completed'
    progress INTEGER DEFAULT 0,
    amount NUMERIC DEFAULT 0,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    is_invoiced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    assigned_to TEXT,
    priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    status TEXT DEFAULT 'TO DO', -- 'TO DO', 'IN PROGRESS', 'IN REVIEW', 'COMPLETED', 'BLOCKED'
    start_date DATE,
    due_date DATE,
    estimated_hours NUMERIC DEFAULT 0,
    actual_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC DEFAULT 0,
    is_gst BOOLEAN DEFAULT TRUE,
    gst_type TEXT DEFAULT 'IGST',
    tax_rate NUMERIC DEFAULT 18,
    tax NUMERIC DEFAULT 0,
    cgst NUMERIC DEFAULT 0,
    sgst NUMERIC DEFAULT 0,
    igst NUMERIC DEFAULT 0,
    client_gstin TEXT,
    hsn_sac_code TEXT DEFAULT '998313',
    total NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT DEFAULT 'Bank Transfer', -- 'Bank Transfer', 'UPI', 'Stripe', 'PayPal', 'Wire'
    transaction_id TEXT,
    status TEXT DEFAULT 'Paid', -- 'Pending', 'Partially Paid', 'Paid', 'Overdue', 'Refunded'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- 'Developer Cost', 'SaaS Tools', 'Infrastructure/Cloud', 'Marketing/Ads', 'Office', 'Other'
    amount NUMERIC NOT NULL,
    expense_date DATE NOT NULL,
    vendor TEXT,
    description TEXT NOT NULL,
    payment_method TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    approved_by TEXT,
    status TEXT DEFAULT 'Approved', -- 'Pending', 'Approved', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Agreements & Contracts
CREATE TABLE IF NOT EXISTS public.agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    agreement_type TEXT NOT NULL, -- 'Master Service Agreement', 'NDA', 'Statement of Work', 'Retainer', 'Proposal'
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    lead_name TEXT,
    start_date DATE,
    expiry_date DATE,
    commercial_value NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Draft', -- 'Draft', 'Sent', 'Signed', 'Expired', 'Cancelled'
    signed_date DATE,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL, -- 'Contract', 'NDA', 'Proposal', 'Specification', 'Invoice', 'Design', 'Other'
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    lead_name TEXT,
    file_url TEXT NOT NULL,
    file_size TEXT,
    uploaded_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Secure Credentials Vault
CREATE TABLE IF NOT EXISTS public.credentials_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_name TEXT NOT NULL,
    service_url TEXT,
    username TEXT,
    password_encrypted TEXT,
    api_key_encrypted TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    notes TEXT,
    access_roles TEXT[] DEFAULT ARRAY['Super Admin', 'Admin', 'Project Manager'],
    environment TEXT DEFAULT 'Production',
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'Meeting', 'Client Follow-up', 'Project Deadline', 'Task Due', 'Payment Reminder', 'Agreement Expiry'
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    participants TEXT[],
    related_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    related_project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    related_lead_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'urgent'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'REVEAL_SECRET', 'CONVERT_LEAD', 'PAYMENT_RECORDED'
    entity_type TEXT NOT NULL, -- 'Lead', 'Client', 'Project', 'Task', 'Invoice', 'Payment', 'Expense', 'Credential', 'Agreement', 'Issue'
    entity_id TEXT,
    description TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Project Client Issues & QA Tickets
CREATE TABLE IF NOT EXISTS public.project_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    project_name TEXT,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT,
    ticket_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    issue_type TEXT NOT NULL DEFAULT 'Bug', -- 'Bug', 'UI/UX Polish', 'Content Change', 'Feature Revision', 'Performance', 'Access/Config', 'Other'
    priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    status TEXT NOT NULL DEFAULT 'REPORTED', -- 'REPORTED', 'IN REVIEW', 'IN PROGRESS', 'RESOLVED', 'CLOSED'
    reporter_name TEXT NOT NULL,
    reporter_email TEXT NOT NULL,
    reporter_phone TEXT,
    attachments TEXT[],
    admin_notes TEXT,
    resolution_notes TEXT,
    assigned_to TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing/evolutionary columns to existing databases safely (Idempotent Migrations)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_token TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS portal_enabled BOOLEAN DEFAULT TRUE;

ALTER TABLE public.project_milestones ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;
ALTER TABLE public.project_milestones ADD COLUMN IF NOT EXISTS is_invoiced BOOLEAN DEFAULT FALSE;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS lead_name TEXT;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS is_gst BOOLEAN DEFAULT TRUE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS gst_type TEXT DEFAULT 'IGST';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 18;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS cgst NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sgst NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS igst NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_gstin TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS hsn_sac_code TEXT DEFAULT '998313';

ALTER TABLE public.agreements ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.agreements ADD COLUMN IF NOT EXISTS lead_name TEXT;

ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS lead_name TEXT;

ALTER TABLE public.credentials_vault ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'Production';
ALTER TABLE public.credentials_vault ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS related_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS related_lead_name TEXT;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS loss_reason TEXT;

-- Enable RLS and setup permissive policies for CRM Client App
DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'profiles', 'leads', 'lead_activities', 'clients', 'projects',
        'project_milestones', 'tasks', 'invoices', 'payments', 'expenses',
        'agreements', 'documents', 'credentials_vault', 'calendar_events',
        'notifications', 'audit_logs', 'project_issues'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Public access policy" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

