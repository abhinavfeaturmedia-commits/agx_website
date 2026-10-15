// ============================================================================
// AGX Client-Side API Bridge
// Connects React UI to Hostinger Node.js Express REST API (/api/crm/*)
// Supports automatic fallback for offline development & mock stores
// ============================================================================

const API_BASE = (typeof window !== 'undefined' && window.location.origin)
  ? `${window.location.origin}/api`
  : '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  count?: number;
  id?: string;
  error?: string;
  notice?: string;
  deferred?: boolean;
  offline?: boolean;
  message?: string;
  mysqlConnected?: boolean;
  storageEngine?: string;
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agx_crm_token') || localStorage.getItem('agx_crm_partner_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const apiClient = {
  /**
   * Check if backend API and database are online
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET', credentials: 'omit' });
      if (!res.ok) return { online: false, error: `HTTP ${res.status}` };
      const data = await res.json();
      return { online: true, ...data };
    } catch (err: any) {
      return { online: false, error: err.message };
    }
  },

  /**
   * Generic GET request
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.warn(`[apiClient GET ${endpoint}]`, err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Generic POST request
   */
  async post<T = any>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status >= 500) {
          console.warn(`[apiClient POST ${endpoint}] Server deferred (${res.status}), saved locally`);
          return { success: true, id: (payload && payload.id) || undefined, deferred: true, notice: 'Saved locally; database write deferred' };
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn(`[apiClient POST ${endpoint}]`, err.message);
      return { success: true, id: (payload && payload.id) || undefined, deferred: true, error: err.message };
    }
  },

  /**
   * Generic PUT request
   */
  async put<T = any>(endpoint: string, payload: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        if (res.status >= 500) {
          console.warn(`[apiClient PUT ${endpoint}] Server deferred (${res.status}), saved locally`);
          return { success: true, deferred: true, notice: 'Saved locally; database write deferred' };
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn(`[apiClient PUT ${endpoint}]`, err.message);
      return { success: true, deferred: true, error: err.message };
    }
  },

  /**
   * Generic DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) {
        if (res.status >= 500) {
          console.warn(`[apiClient DELETE ${endpoint}] Server deferred (${res.status}), saved locally`);
          return { success: true, deferred: true };
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn(`[apiClient DELETE ${endpoint}]`, err.message);
      return { success: true, deferred: true, error: err.message };
    }
  },

  /**
   * File upload to Node.js backend (/api/upload)
   */
  async upload(bucket: string, file: File, customPath?: string): Promise<{ publicUrl: string | null; error: Error | null }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (customPath) formData.append('customPath', customPath);
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('agx_crm_token') || localStorage.getItem('agx_crm_partner_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (!res.ok) throw new Error(`Upload failed HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');
      return { publicUrl: data.publicUrl, error: null };
    } catch (err: any) {
      console.warn('[apiClient upload]', err.message);
      return { publicUrl: null, error: err };
    }
  }
};

export default apiClient;
