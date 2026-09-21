import os
import re

CRM_STORE_PATH = os.path.join(os.path.dirname(__file__), '..', 'lib', 'crmStore.ts')

with open(CRM_STORE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace INITIAL_* mock arrays (from 'export const INITIAL_USERS: UserProfile[] = [' up to 'const STORAGE_PREFIX = \'agx_crm_\';')
clean_initials = '''export const DEFAULT_ADMIN_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@agxperience.com',
  fullName: 'Abhinav (Super Admin)',
  role: 'Super Admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  department: 'Leadership',
  isActive: true,
  permissions: ROLE_DEFAULT_PERMISSIONS['Super Admin']
};

export const INITIAL_USERS: UserProfile[] = [DEFAULT_ADMIN_USER];
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_PAYMENTS: Payment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_AGREEMENTS: Agreement[] = [];
export const INITIAL_DOCUMENTS: DocumentItem[] = [];
export const INITIAL_CREDENTIALS: CredentialVaultItem[] = [];
export const INITIAL_EVENTS: CalendarEvent[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_ISSUES: ProjectIssue[] = [];

const STORAGE_PREFIX = 'agx_crm_';

// Purge legacy mock data cache once on initial load
const CLEAN_VERSION_KEY = 'agx_crm_prod_clean_v1';
if (typeof window !== 'undefined' && !localStorage.getItem(CLEAN_VERSION_KEY)) {
  const keysToClean = [
    'leads', 'clients', 'projects', 'tasks', 'invoices', 'payments',
    'expenses', 'agreements', 'documents', 'credentials', 'events',
    'notifications', 'audit_logs', 'issues', 'team_members'
  ];
  keysToClean.forEach(k => localStorage.removeItem(STORAGE_PREFIX + k));
  localStorage.setItem(CLEAN_VERSION_KEY, 'true');
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null || item === undefined) return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback)) {
      if (!Array.isArray(parsed)) return fallback;
      const cleaned = parsed.filter((entry: any) => {
        if (!entry || typeof entry !== 'object') return false;
        const id = String(entry.id || '');
        if (/^[1-9a-d]0000000-0000-0000-0000-/.test(id)) return false;
        return true;
      });
      if (key === 'projects') {
        return cleaned.map((p: any) => ({
          ...p,
          portalToken: p.portalToken || `prj_sec_${(p.name || 'proj').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${p.id.slice(0, 6)}`,
          portalEnabled: p.portalEnabled !== undefined ? p.portalEnabled : true
        })) as unknown as T;
      }
      return cleaned as unknown as T;
    }
    if (fallback && typeof fallback === 'object') {
      return ((parsed && typeof parsed === 'object') ? { ...fallback, ...parsed } : fallback) as T;
    }
    return (parsed ?? fallback) as T;
  } catch (e) {
    return fallback;
  }
}'''

# Pattern matching from 'export const INITIAL_USERS: UserProfile[] = [' to the end of loadFromStorage
pattern_initials = re.compile(
    r"export const INITIAL_USERS: UserProfile\[\] = \[.*?function loadFromStorage<T>\(key: string, fallback: T\): T \{.*?return fallback;\s*\}\s*\}",
    re.DOTALL
)

if not pattern_initials.search(content):
    print("ERROR: pattern_initials did not match!")
    exit(1)

content = pattern_initials.sub(clean_initials, content, count=1)

# 2. Replace refreshFromCloud data handling
old_refresh_block = '''      // Guard: Only replace operational state if cloud actually returned records.
      // If cloud database is empty / unseeded, retain local/mock data to prevent empty screen.
      const hasCloudData = 
        (data.projects?.length || 0) > 0 || 
        (data.leads?.length || 0) > 0 || 
        (data.clients?.length || 0) > 0;

      if (hasCloudData) {
        if (data.profiles !== undefined) setTeamMembers(data.profiles.length > 0 ? data.profiles : INITIAL_USERS);
        if (data.leads !== undefined) setLeads(data.leads);
        if (data.clients !== undefined) setClients(data.clients);
        if (data.projects !== undefined) setProjects(data.projects);
        if (data.tasks !== undefined) setTasks(data.tasks);
        if (data.invoices !== undefined) setInvoices(data.invoices);
        if (data.payments !== undefined) setPayments(data.payments);
        if (data.expenses !== undefined) setExpenses(data.expenses);
        if (data.agreements !== undefined) setAgreements(data.agreements);
        if (data.documents !== undefined) setDocuments(data.documents);
        if (data.credentials !== undefined) setCredentials(data.credentials);
        if (data.events !== undefined) setEvents(data.events);
        if (data.notifications !== undefined) setNotifications(data.notifications);
        if (data.auditLogs !== undefined) setAuditLogs(data.auditLogs);
      } else {
        console.log('[crmStore] Cloud database is unseeded or empty. Retaining current operational dataset.');
      }

      const cloudIssues = await crmService.fetchAllIssues();
      if (cloudIssues && cloudIssues.length > 0) {
        setIssues(cloudIssues);
      }'''

new_refresh_block = '''      if (data.profiles !== undefined) setTeamMembers(data.profiles.length > 0 ? data.profiles : INITIAL_USERS);
      if (data.leads !== undefined) setLeads(data.leads);
      if (data.clients !== undefined) setClients(data.clients);
      if (data.projects !== undefined) setProjects(data.projects);
      if (data.tasks !== undefined) setTasks(data.tasks);
      if (data.invoices !== undefined) setInvoices(data.invoices);
      if (data.payments !== undefined) setPayments(data.payments);
      if (data.expenses !== undefined) setExpenses(data.expenses);
      if (data.agreements !== undefined) setAgreements(data.agreements);
      if (data.documents !== undefined) setDocuments(data.documents);
      if (data.credentials !== undefined) setCredentials(data.credentials);
      if (data.events !== undefined) setEvents(data.events);
      if (data.notifications !== undefined) setNotifications(data.notifications);
      if (data.auditLogs !== undefined) setAuditLogs(data.auditLogs);

      const cloudIssues = await crmService.fetchAllIssues();
      if (cloudIssues !== undefined) {
        setIssues(cloudIssues);
      }'''

if old_refresh_block not in content:
    # Try normalizing newlines
    old_refresh_block_crlf = old_refresh_block.replace('\n', '\r\n')
    if old_refresh_block_crlf in content:
        content = content.replace(old_refresh_block_crlf, new_refresh_block)
    else:
        print("ERROR: old_refresh_block did not match!")
        exit(1)
else:
    content = content.replace(old_refresh_block, new_refresh_block)

# 3. Replace resetToSampleData body with refreshFromCloud
old_reset_block = '''  const resetToSampleData = () => {
    setLeads(INITIAL_LEADS);
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    setAgreements(INITIAL_AGREEMENTS);
    setPayments(INITIAL_PAYMENTS);
    setIssues(INITIAL_ISSUES);
    setTasks(INITIAL_TASKS);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setDocuments(INITIAL_DOCUMENTS);
    setCredentials(INITIAL_CREDENTIALS);
    setEvents(INITIAL_EVENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setTeamMembers(INITIAL_USERS);
    toast.success('Mock Data Restored 🔄', 'Reset all records to fresh sample projects, agreements, and client issues.');
  };'''

new_reset_block = '''  const resetToSampleData = () => {
    refreshFromCloud(false);
  };'''

if old_reset_block not in content:
    old_reset_block_crlf = old_reset_block.replace('\n', '\r\n')
    if old_reset_block_crlf in content:
        content = content.replace(old_reset_block_crlf, new_reset_block)
    else:
        print("ERROR: old_reset_block did not match!")
        exit(1)
else:
    content = content.replace(old_reset_block, new_reset_block)

with open(CRM_STORE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS: lib/crmStore.ts updated successfully.")
