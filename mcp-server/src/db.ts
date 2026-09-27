import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from mcp-server/.env or root .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[AGX MCP] Warning: SUPABASE_URL or SUPABASE_KEY missing in environment variables.');
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://lgvqkumqjmeyycqvgycv.supabase.co',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Standard response wrapper for MCP tools
 */
export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export function formatSuccess(message: string, data?: any): ToolResult {
  return { success: true, message, data };
}

export function formatError(message: string, error?: any): ToolResult {
  const errMsg = error instanceof Error ? error.message : (error?.message || String(error || 'Unknown error'));
  return { success: false, message, error: errMsg };
}

/**
 * Safely parse numbers from currency strings like "₹2,00,000", "$50,000", "200k", "1.5L"
 */
export function parseNumeric(val: any, defaultVal = 0): number {
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  if (!val) return defaultVal;
  if (typeof val === 'string') {
    const raw = val.trim();
    let cleaned = raw.replace(/[^0-9.-]/g, '');
    let num = parseFloat(cleaned);
    if (isNaN(num)) return defaultVal;

    if (/\b(k|thousand)\b/i.test(raw) || /^\d+(\.\d+)?k$/i.test(raw)) {
      num *= 1000;
    } else if (/\b(l|lac|lakh|lakhs)\b/i.test(raw) || /^\d+(\.\d+)?l$/i.test(raw)) {
      num *= 100000;
    } else if (/\b(m|million|cr|crore)\b/i.test(raw) || /^\d+(\.\d+)?m$/i.test(raw)) {
      num *= 1000000;
    }
    return num;
  }
  return defaultVal;
}
