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
        // Priority 1: Supabase native Auth sign-in
        let isAuthenticated = false;
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPass
        }).catch(() => ({ data: null, error: true }));

        if (authData && authData.user) {
          isAuthenticated = true;
        } else if (profileRow.password_hash) {
          // Priority 2: Fallback to seeded password hash / password verification
          if (profileRow.password_hash === trimmedPass) {
            isAuthenticated = true;
          }
        }

        if (!isAuthenticated) {
          return {
            profile: null,
            error: new Error('Incorrect password. Please verify your credentials and try again.')
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
          passwordHash: undefined, // Never expose password hash in frontend state
          isActive: profileRow.is_active !== false,
          permissions: profileRow.permissions || {},
          lastActiveAt: new Date().toISOString()
        };

        this.setStaffSession(staffProfile);
        return { profile: staffProfile, error: null };
      }

      // 2. Try Supabase Auth login if not found in profiles directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass
      });

      if (!error && data.user) {
        const profile = await this.getCurrentUserProfile();
        if (profile) {
          this.setStaffSession(profile);
          return { profile, error: null };
        }
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

  // Staff Session State & Persistence
  getStaffSession(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const isAuth = localStorage.getItem('agx_crm_authenticated') === 'true';
      const raw = localStorage.getItem('agx_crm_current_user');
      if (isAuth && raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role && parsed.email) {
          return parsed as UserProfile;
        }
      }
    } catch (e) {
      console.warn('Error reading staff session:', e);
    }
    return null;
  },

  setStaffSession(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('agx_crm_authenticated', 'true');
      localStorage.setItem('agx_crm_current_user', JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving staff session:', e);
    }
  },

  clearStaffSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('agx_crm_authenticated');
      localStorage.removeItem('agx_crm_current_user');
    } catch (e) {
      console.warn('Error clearing staff session:', e);
    }
  },

  // Sign Out
  async signOut(): Promise<void> {
    this.clearStaffSession();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Signout error:', err);
    }
  },

  // Google OAuth Sign In / Sign Up
  async signInWithGoogle(redirectToPath: string = '/partner/portal') {
    try {
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin.replace(/\/$/, '')
        : 'https://agxperience.netlify.app';
      const path = redirectToPath.startsWith('/') ? redirectToPath : `/${redirectToPath}`;
      const redirectUrl = `${origin}${path}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      return { data: null, error: err };
    }
  },

  // Sync or auto-provision Partner from Supabase Auth User (e.g. from Google OAuth)
  async syncPartnerFromSupabaseUser(user: any): Promise<any | null> {
    if (!user || !user.email) return null;
    try {
      const email = user.email.toLowerCase().trim();

      // 1. Look up existing partner
      const { data: partnerRow } = await supabase
        .from('partners')
        .select('*')
        .or(`user_id.eq.${user.id},email.ilike.${email}`)
        .maybeSingle();

      if (partnerRow) {
        const nowIso = new Date().toISOString();
        try {
          await supabase.from('partners').update({
            last_login_at: nowIso,
            updated_at: nowIso
          }).eq('id', partnerRow.id);
        } catch (e) {
          console.warn('Failed to update partner last_login_at:', e);
        }

        const partner = {
          id: partnerRow.id,
          userId: partnerRow.user_id || user.id,
          name: partnerRow.name,
          email: partnerRow.email,
          company: partnerRow.company,
          phone: partnerRow.phone,
          referralCode: partnerRow.referral_code,
          commissionRate: Number(partnerRow.commission_rate) || 0.10,
          status: partnerRow.status || 'Active',
          payoutMethod: partnerRow.payout_method || 'UPI',
          payoutDetails: partnerRow.payout_details || {},
          totalEarnings: Number(partnerRow.total_earnings) || 0,
          paidEarnings: Number(partnerRow.paid_earnings) || 0,
          pendingEarnings: Number(partnerRow.pending_earnings) || 0,
          notes: partnerRow.notes,
          lastLoginAt: nowIso,
          createdAt: partnerRow.created_at,
          updatedAt: partnerRow.updated_at
        };
        this.setPartnerSession(partner);
        return partner;
      }

      // 2. Auto-provision new partner from Google metadata
      const cleanName = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Partner';
      const cleanSlug = cleanName.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) || 'AGX';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referralCode = `AGX-${cleanSlug}-${randomSuffix}`;

      const nowIso = new Date().toISOString();
      const newPartner = {
        id: user.id,
        userId: user.id,
        name: cleanName,
        email,
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || '',
        referralCode,
        commissionRate: 0.10,
        status: 'Active',
        payoutMethod: 'UPI',
        payoutDetails: {},
        totalEarnings: 0,
        paidEarnings: 0,
        pendingEarnings: 0,
        lastLoginAt: nowIso,
        createdAt: nowIso
      };

      try {
        await supabase.from('partners').upsert({
          id: newPartner.id,
          user_id: newPartner.userId,
          name: newPartner.name,
          email: newPartner.email,
          company: newPartner.company,
          phone: newPartner.phone,
          referral_code: newPartner.referralCode,
          commission_rate: 0.10,
          status: 'Active',
          payout_method: 'UPI',
          payout_details: {},
          last_login_at: nowIso
        });
      } catch (err) {
        console.warn('Auto-provision partner DB sync notice:', err);
      }

      this.setPartnerSession(newPartner);
      return newPartner;
    } catch (err) {
      console.warn('Error syncing partner from Supabase user:', err);
      return null;
    }
  },

  // Get Current Active Partner from LocalStorage or Supabase
  getCurrentPartner(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('agx_crm_current_partner');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Purge any lingering demo partner data
        if (parsed?.id === 'demo-partner-001' || parsed?.email === 'alex@apexdesign.studio') {
          localStorage.removeItem('agx_crm_current_partner');
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return null;
  },

  // Save Current Partner Session
  setPartnerSession(partner: any) {
    if (typeof window === 'undefined' || !partner) return;
    if (partner.id === 'demo-partner-001' || partner.email === 'alex@apexdesign.studio') {
      localStorage.removeItem('agx_crm_current_partner');
      return;
    }
    try {
      localStorage.setItem('agx_crm_current_partner', JSON.stringify(partner));
    } catch (e) {
      console.warn(e);
    }
  },

  // Partner Sign Out
  signOutPartner() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('agx_crm_current_partner');
    try {
      supabase.auth.signOut().catch(() => {});
    } catch (_) {}
  },

  // Clear Partner Session alias
  clearPartnerSession() {
    this.signOutPartner();
  },

  // Partner Sign In (Email & Password)
  async partnerSignIn(email: string, password: string): Promise<{ partner: any | null; error: Error | null }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPass = password.trim();

      if (!trimmedEmail || !trimmedPass) {
        return { partner: null, error: new Error('Please enter both email and password.') };
      }

      // 1. First look up partner record in 'partners' table
      const { data: partnerRow, error: pErr } = await supabase
        .from('partners')
        .select('*')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      if (partnerRow && partnerRow.status === 'Suspended') {
        return { partner: null, error: new Error('Your partner account is currently suspended. Please contact support@agxperience.com.') };
      }

      // 2. Strict Authentication: Verify password via Supabase Auth
      let isAuthenticated = false;
      let authenticatedUserId: string | null = null;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass
      }).catch(e => ({ data: null, error: e }));

      if (authData?.user) {
        isAuthenticated = true;
        authenticatedUserId = authData.user.id;
      } else if (partnerRow?.password_hash) {
        // Dedicated password_hash column verification
        if (partnerRow.password_hash === trimmedPass) {
          isAuthenticated = true;
        }
      } else {
        // Check if partner row has custom legacy password verification in payout_details
        const payoutDetails = partnerRow?.payout_details;
        if (payoutDetails && typeof payoutDetails === 'object' && payoutDetails.passwordHash) {
          if (payoutDetails.passwordHash === trimmedPass) {
            isAuthenticated = true;
            // Transparently backfill to dedicated password_hash column
            supabase.from('partners').update({ password_hash: trimmedPass }).eq('id', partnerRow.id).then(() => {}, () => {});
          }
        }
      }

      if (!isAuthenticated) {
        return {
          partner: null,
          error: new Error('Invalid email or password. If you were onboarded by an admin, please use Register with your partner email to set your password.')
        };
      }

      // 3. User is verified. Retrieve or auto-provision partner profile
      if (partnerRow) {
        const nowIso = new Date().toISOString();
        try {
          const updates: any = {
            last_login_at: nowIso,
            updated_at: nowIso
          };
          if (!partnerRow.user_id && authenticatedUserId) {
            updates.user_id = authenticatedUserId;
          }
          await supabase.from('partners').update(updates).eq('id', partnerRow.id);
        } catch (e) {
          console.warn('Failed to update partner last_login_at:', e);
        }

        const partner = {
          id: partnerRow.id,
          userId: partnerRow.user_id || authenticatedUserId || partnerRow.id,
          name: partnerRow.name,
          email: partnerRow.email,
          company: partnerRow.company,
          phone: partnerRow.phone,
          referralCode: partnerRow.referral_code,
          commissionRate: Number(partnerRow.commission_rate) || 0.10,
          status: partnerRow.status || 'Active',
          payoutMethod: partnerRow.payout_method || 'UPI',
          payoutDetails: partnerRow.payout_details || {},
          totalEarnings: Number(partnerRow.total_earnings) || 0,
          paidEarnings: Number(partnerRow.paid_earnings) || 0,
          pendingEarnings: Number(partnerRow.pending_earnings) || 0,
          notes: partnerRow.notes,
          lastLoginAt: nowIso,
          createdAt: partnerRow.created_at,
          updatedAt: partnerRow.updated_at
        };

        this.setPartnerSession(partner);
        return { partner, error: null };
      }

      // Check if user authenticated via Supabase Auth without an existing row -> provision
      if (authData?.user) {
        const generatedCode = `AGX-${(authData.user.email?.split('@')[0] || 'PARTNER').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newPartner = {
          id: authData.user.id,
          userId: authData.user.id,
          name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'Partner',
          email: trimmedEmail,
          company: authData.user.user_metadata?.company || 'Affiliate Partner',
          phone: authData.user.user_metadata?.phone || '',
          referralCode: generatedCode,
          commissionRate: 0.10,
          status: 'Active',
          payoutMethod: 'UPI',
          payoutDetails: {},
          totalEarnings: 0,
          paidEarnings: 0,
          pendingEarnings: 0,
          createdAt: new Date().toISOString()
        };

        try {
          await supabase.from('partners').upsert({
            id: newPartner.id,
            user_id: newPartner.userId,
            name: newPartner.name,
            email: newPartner.email,
            company: newPartner.company,
            phone: newPartner.phone,
            referral_code: newPartner.referralCode,
            commission_rate: 0.10,
            status: 'Active',
            payout_method: 'UPI',
            payout_details: {}
          });
        } catch (e) {
          console.warn(e);
        }

        this.setPartnerSession(newPartner);
        return { partner: newPartner, error: null };
      }

      return { partner: null, error: new Error('No partner account found with this email. Please register to become an AGX Partner.') };
    } catch (err: any) {
      return { partner: null, error: err };
    }
  },

  // Partner Sign Up / Registration
  async partnerSignUp(data: {
    name: string;
    email: string;
    password?: string;
    company?: string;
    phone?: string;
    payoutMethod?: string;
    payoutDetails?: any;
  }): Promise<{ partner: any | null; error: Error | null }> {
    try {
      const trimmedEmail = data.email.trim().toLowerCase();
      const trimmedName = data.name.trim();

      if (!trimmedEmail || !trimmedName) {
        return { partner: null, error: new Error('Name and email are required.') };
      }

      // 1. Check if partner row was pre-created by admin
      const { data: existingRow } = await supabase
        .from('partners')
        .select('*')
        .ilike('email', trimmedEmail)
        .maybeSingle();

      // 2. Try registering user with Supabase Auth if password provided
      let authUserId = crypto.randomUUID ? crypto.randomUUID() : `partner-${Date.now()}`;
      if (data.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: data.password,
          options: {
            data: {
              full_name: trimmedName,
              company: data.company || existingRow?.company || '',
              phone: data.phone || existingRow?.phone || '',
              role: 'Partner'
            }
          }
        }).catch(e => ({ data: null, error: e }));

        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      }

      // 3. Generate unique referral code if not already assigned
      const cleanSlug = (data.company || trimmedName).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 5) || 'AGX';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const referralCode = existingRow?.referral_code || `AGX-${cleanSlug}-${randomSuffix}`;

      const nowIso = new Date().toISOString();
      const partnerId = existingRow?.id || authUserId;
      const commissionRate = existingRow?.commission_rate ? Number(existingRow.commission_rate) : 0.10;

      const newPartner = {
        id: partnerId,
        userId: authUserId,
        name: trimmedName,
        email: trimmedEmail,
        company: data.company || existingRow?.company || '',
        phone: data.phone || existingRow?.phone || '',
        referralCode,
        commissionRate,
        status: existingRow?.status || 'Active',
        payoutMethod: (data.payoutMethod || existingRow?.payout_method || 'UPI') as any,
        payoutDetails: data.payoutDetails || existingRow?.payout_details || {},
        totalEarnings: existingRow?.total_earnings ? Number(existingRow.total_earnings) : 0,
        paidEarnings: existingRow?.paid_earnings ? Number(existingRow.paid_earnings) : 0,
        pendingEarnings: existingRow?.pending_earnings ? Number(existingRow.pending_earnings) : 0,
        lastLoginAt: nowIso,
        createdAt: existingRow?.created_at || nowIso
      };

      // 4. Sync to Supabase
      const { error: insertError } = await supabase.from('partners').upsert({
        id: newPartner.id,
        user_id: newPartner.userId,
        name: newPartner.name,
        email: newPartner.email,
        company: newPartner.company,
        phone: newPartner.phone,
        password_hash: data.password ? data.password.trim() : null,
        referral_code: newPartner.referralCode,
        commission_rate: newPartner.commissionRate,
        status: newPartner.status,
        payout_method: newPartner.payoutMethod,
        payout_details: newPartner.payoutDetails,
        total_earnings: newPartner.totalEarnings,
        paid_earnings: newPartner.paidEarnings,
        pending_earnings: newPartner.pendingEarnings,
        last_login_at: nowIso,
        updated_at: nowIso
      });

      if (insertError) {
        console.warn('Supabase partner insert notice:', insertError);
      }

      // Save to active partner session
      this.setPartnerSession(newPartner);

      // Also persist to local list of partners
      const existing = JSON.parse(localStorage.getItem('agx_crm_partners') || '[]');
      if (!existing.some((p: any) => p.id === newPartner.id)) {
        localStorage.setItem('agx_crm_partners', JSON.stringify([newPartner, ...existing]));
      }

      // Dispatch event to notify CRM in current tab
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agx_crm_partner_updated', { detail: newPartner }));
      }

      return { partner: newPartner, error: null };
    } catch (err: any) {
      return { partner: null, error: err };
    }
  },

  // Update Partner Password with verification
  async updatePartnerPassword(
    partnerId: string,
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedCurrent = currentPassword.trim();
      const trimmedNew = newPassword.trim();

      if (!trimmedCurrent || !trimmedNew) {
        return { success: false, error: new Error('Both current password and new password are required.') };
      }

      if (trimmedNew.length < 6) {
        return { success: false, error: new Error('New password must be at least 6 characters long.') };
      }

      if (trimmedCurrent === trimmedNew) {
        return { success: false, error: new Error('New password must be different from your current password.') };
      }

      // 1. Fetch partner record to verify current password
      const { data: partnerRow } = await supabase
        .from('partners')
        .select('*')
        .or(`id.eq.${partnerId},email.ilike.${trimmedEmail}`)
        .maybeSingle();

      let isCurrentValid = false;

      // Check via Supabase Auth first
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedCurrent
      }).catch(() => ({ data: null, error: true }));

      if (authData?.user) {
        isCurrentValid = true;
      } else if (partnerRow?.password_hash && partnerRow.password_hash === trimmedCurrent) {
        isCurrentValid = true;
      } else if (partnerRow?.payout_details && typeof partnerRow.payout_details === 'object' && partnerRow.payout_details.passwordHash === trimmedCurrent) {
        isCurrentValid = true;
      }

      if (!isCurrentValid) {
        return { success: false, error: new Error('Current password is incorrect. Please verify and try again.') };
      }

      // 2. Update Supabase Auth user password if session exists
      try {
        await supabase.auth.updateUser({ password: trimmedNew });
      } catch (authUpdateErr) {
        console.warn('Notice: supabase.auth.updateUser notice (may require active session):', authUpdateErr);
      }

      // 3. Update database row in 'partners'
      const targetId = partnerRow?.id || partnerId;
      const nowIso = new Date().toISOString();
      const { error: dbUpdateErr } = await supabase
        .from('partners')
        .update({
          password_hash: trimmedNew,
          updated_at: nowIso
        })
        .eq('id', targetId);

      if (dbUpdateErr) {
        console.warn('Supabase DB password_hash update error:', dbUpdateErr);
        // Fallback: also update in payout_details if needed
        try {
          const existingDetails = partnerRow?.payout_details || {};
          await supabase.from('partners').update({
            payout_details: { ...existingDetails, passwordHash: trimmedNew },
            updated_at: nowIso
          }).eq('id', targetId);
        } catch (_) {}
      }

      // Update cached session partner if present
      const currentSessionPartner = this.getCurrentPartner();
      if (currentSessionPartner && (currentSessionPartner.id === targetId || currentSessionPartner.email === trimmedEmail)) {
        this.setPartnerSession({
          ...currentSessionPartner,
          updatedAt: nowIso
        });
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
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

