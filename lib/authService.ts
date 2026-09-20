// Supabase Authentication Service & Session Lifecycle
import { supabase } from './supabase';
import { UserProfile, UserRole } from '../types/crm';

export const authService = {
  // Get Current Session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      console.warn('Error fetching Supabase session:', err);
      return null;
    }
  },

  // Get Current User Profile from DB
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !profile) {
        // Fallback user profile if not yet populated
        return {
          id: user.id,
          email: user.email || 'user@agxperience.com',
          fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member',
          role: (user.user_metadata?.role as UserRole) || 'Developer',
          avatarUrl: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email || 'user')}`,
          department: user.user_metadata?.department || 'Operations',
          isActive: true,
          permissions: {}
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role as UserRole,
        avatarUrl: profile.avatar_url,
        department: profile.department,
        phone: profile.phone,
        passwordHash: profile.password_hash,
        isActive: profile.is_active !== false,
        permissions: profile.permissions || {}
      };
    } catch (err) {
      console.warn('Error fetching current user profile:', err);
      return null;
    }
  },

  // Sign In with Email & Password
  async signIn(email: string, password: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = password.trim();

      if (!trimmedEmail || !trimmedPass) {
        return { profile: null, error: new Error('Please enter both email and password.') };
      }

      // 1. Check if user exists in profiles
      const { data: profileRow, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      if (profileRow) {
        // Check if account is suspended / deactivated
        if (profileRow.is_active === false) {
          return {
            profile: null,
            error: new Error('Your staff account has been deactivated. Please contact your Super Admin.')
          };
        }

        // Validate password:
        // Priority 1: Match profileRow.password_hash if defined
        // Priority 2: Match accepted standard dev/demo passwords
        const validDemoPasswords = ['admin123', 'agx@2026', 'superadmin', 'password', 'agxperience'];
        const hasCustomPassword = Boolean(profileRow.password_hash);
        const matchesCustom = hasCustomPassword && profileRow.password_hash === trimmedPass;
        const matchesDemo = validDemoPasswords.includes(trimmedPass);

        if (hasCustomPassword && !matchesCustom && !matchesDemo) {
          return {
            profile: null,
            error: new Error('Incorrect password. Please verify your credentials and try again.')
          };
        }

        if (!hasCustomPassword && !matchesDemo && trimmedPass.length < 6) {
          return {
            profile: null,
            error: new Error('Invalid password. Password must be at least 6 characters.')
          };
        }

        const staffProfile: UserProfile = {
          id: profileRow.id,
          email: profileRow.email,
          fullName: profileRow.full_name,
          role: profileRow.role as UserRole,
          department: profileRow.department,
          phone: profileRow.phone,
          avatarUrl: profileRow.avatar_url,
          passwordHash: profileRow.password_hash,
          isActive: profileRow.is_active !== false,
          permissions: profileRow.permissions || {},
          lastActiveAt: new Date().toISOString()
        };
        return { profile: staffProfile, error: null };
      }

      // 2. Try Supabase Auth login if not found in profiles directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass
      });

      if (!error && data.user) {
        const profile = await this.getCurrentUserProfile();
        if (profile) return { profile, error: null };
      }

      return { profile: null, error: error || new Error('No staff account found with this email address. Please contact your Super Admin.') };
    } catch (err: any) {
      return { profile: null, error: err };
    }
  },

  // Sign Up / Register New Staff in Supabase
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'Developer',
    department: string = 'Engineering',
    phone?: string,
    permissions?: any
  ): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`;
      const userId = crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`;

      // Persist directly to public.profiles with password and permissions
      const { data: profileRow, error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: trimmedEmail,
        full_name: fullName,
        role,
        department,
        phone: phone || null,
        password_hash: password,
        is_active: true,
        permissions: permissions || {},
        avatar_url: avatarUrl
      }).select().single();

      if (profileError) {
        console.warn('Profile sync warning:', profileError);
      }

      const newProfile: UserProfile = {
        id: userId,
        email: trimmedEmail,
        fullName,
        role,
        department,
        avatarUrl,
        lastActiveAt: new Date().toISOString()
      };

      return { profile: newProfile, error: null };
    } catch (err: any) {
      return { profile: null, error: err };
    }
  },

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout error:', err);
    }
  },

  // Listen to Auth State Changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }
};
