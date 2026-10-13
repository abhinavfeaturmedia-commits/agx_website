-- AGX CRM Storage Buckets & Database Audit Triggers

-- 1. Create Storage Buckets if not exists (Agreements & Invoices are PRIVATE)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('crm-documents', 'crm-documents', false),
  ('crm-agreements', 'crm-agreements', false),
  ('crm-invoices', 'crm-invoices', false),
  ('crm-attachments', 'crm-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Storage Policies for Buckets (Zero-Trust Access Control)
DO $$ 
BEGIN
  -- 2.1 Authenticated Staff Full Access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Staff Access for CRM Storage'
  ) THEN
    CREATE POLICY "Staff Access for CRM Storage" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id IN ('crm-documents', 'crm-agreements', 'crm-invoices', 'crm-attachments'))
      WITH CHECK (bucket_id IN ('crm-documents', 'crm-agreements', 'crm-invoices', 'crm-attachments'));
  END IF;

  -- 2.2 Client Portal Attachments: Public upload only for screenshots/attachments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Upload for Portal Attachments'
  ) THEN
    CREATE POLICY "Public Upload for Portal Attachments" ON storage.objects
      FOR INSERT TO anon
      WITH CHECK (bucket_id = 'crm-attachments');
  END IF;

  -- 2.3 Public Read for Portal Attachments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read for Portal Attachments'
  ) THEN
    CREATE POLICY "Public Read for Portal Attachments" ON storage.objects
      FOR SELECT TO anon
      USING (bucket_id = 'crm-attachments');
  END IF;
END $$;

-- 3. Automatic PostgreSQL DB-Level Audit Logger Function
CREATE OR REPLACE FUNCTION public.log_crm_table_change()
RETURNS TRIGGER AS $$
DECLARE
  v_action TEXT;
  v_entity_type TEXT;
  v_entity_id TEXT;
  v_description TEXT;
  v_before JSONB := null;
  v_after JSONB := null;
BEGIN
  v_entity_type := TG_TABLE_NAME;
  
  IF (TG_OP = 'INSERT') THEN
    v_action := 'CREATE';
    v_entity_id := NEW.id::text;
    v_after := to_jsonb(NEW);
    v_description := 'Created ' || v_entity_type || ' record (ID: ' || v_entity_id || ')';
  ELSIF (TG_OP = 'UPDATE') THEN
    v_action := 'STATUS_CHANGE';
    v_entity_id := NEW.id::text;
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_description := 'Updated ' || v_entity_type || ' record (ID: ' || v_entity_id || ')';
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'DELETE';
    v_entity_id := OLD.id::text;
    v_before := to_jsonb(OLD);
    v_description := 'Deleted ' || v_entity_type || ' record (ID: ' || v_entity_id || ')';
  END IF;

  -- Insert directly into public.audit_logs
  INSERT INTO public.audit_logs (
    user_name,
    user_role,
    action_type,
    entity_type,
    entity_id,
    description,
    before_state,
    after_state
  ) VALUES (
    COALESCE(current_setting('app.current_user_name', true), 'System'),
    COALESCE(current_setting('app.current_user_role', true), 'Super Admin'),
    v_action,
    v_entity_type,
    v_entity_id,
    v_description,
    v_before,
    v_after
  );

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
