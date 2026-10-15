import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, IndianRupee, Wallet, Sparkles, CreditCard,
  ArrowUpRight, Copy, Check, Plus, LogOut, ArrowLeft, TrendingUp, Clock,
  CheckCircle2, AlertCircle, ExternalLink, Building, Phone, Mail, FileText,
  ChevronRight, Shield, Download, RefreshCw, QrCode, Share2, Calculator,
  MessageSquare, ChevronDown, CheckCheck, Send, Zap, Award, Sliders,
  ArrowDownRight, Eye, EyeOff, KeyRound, Percent, DollarSign, CheckCircle,
  User, Lock, Bell, Globe, Search, Layers, Briefcase, UserCheck, CheckSquare,
  HelpCircle, ArrowRight, Scale, Folder, UploadCloud, File, Paperclip, Loader2, Trash2
} from 'lucide-react';
import { Partner, PartnerReferral, PartnerPayout, PartnerPayoutDetails, ClientDocument, calculatePartnerTier, getEffectivePartnerRate } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import { apiClient } from '../../lib/apiClient';
import { mapPartnerFromDb } from '../../lib/crmService';
import { exportService } from '../../lib/exportService';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { BotAvatar } from 'bot-avatars';
import { PartnerTermsModal } from './PartnerTermsModal';

interface PartnerPortalProps {
  initialPartner?: Partner | null;
  onPartnerUpdated?: (partner: Partner) => void;
  onBackToWebsite: () => void;
  onLogout: () => void;
}

type PartnerTab = 'dashboard' | 'referrals' | 'payouts' | 'toolkit' | 'settings';

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  initialPartner,
  onPartnerUpdated,
  onBackToWebsite,
  onLogout
}) => {
  const store = useCrmStore();
  const activeSessionPartner = initialPartner || authService.getCurrentPartner();

  // If no authenticated partner session exists, immediately trigger logout/login screen
  useEffect(() => {
    if (!activeSessionPartner) {
      onLogout();
    }
  }, [activeSessionPartner, onLogout]);

  const [partner, setPartner] = useState<Partner | null>(activeSessionPartner || null);

  if (!partner) {
    return null;
  }

  // Active navigation tab (matching Admin CRM views)
  const [activeTab, setActiveTab] = useState<PartnerTab>('dashboard');

  // Modals & Drawers state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Clipboard copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'WON' | 'COMPLETED'>('ALL');

  // Submit Client Referral Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newProjectType, setNewProjectType] = useState('AI Automation Blueprint');
  const [newDealValue, setNewDealValue] = useState('75000');
  const [newNotes, setNewNotes] = useState('');
  const [newReferralFiles, setNewReferralFiles] = useState<File[]>([]);

  // Referral Document & Google Drive Vault State
  const [expandedDocReferralId, setExpandedDocReferralId] = useState<string | null>(null);
  const [uploadingReferralId, setUploadingReferralId] = useState<string | null>(null);
  const [dragActiveReferralId, setDragActiveReferralId] = useState<string | null>(null);

  // Payout Request Form State
  const [payoutRequestAmount, setPayoutRequestAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

  // Interactive Commission Simulator State
  const [simDealValue, setSimDealValue] = useState<number>(150000);
  const [showStandardTiersWhenCustom, setShowStandardTiersWhenCustom] = useState(false);

  // Editable Partner Profile State
  const [editName, setEditName] = useState(partner.name || '');
  const [editCompany, setEditCompany] = useState(partner.company || '');
  const [editPhone, setEditPhone] = useState(partner.phone || '');
  const [editBio, setEditBio] = useState(partner.notes || '');
  const [editPanTaxId, setEditPanTaxId] = useState(partner.payoutDetails?.panTaxId || '');

  // Editable Payout Settings State
  const [editPayoutMethod, setEditPayoutMethod] = useState<'UPI' | 'Bank Transfer' | 'PayPal' | 'Wire'>(
    partner.payoutMethod || 'UPI'
  );
  const [editUpiId, setEditUpiId] = useState(partner.payoutDetails?.upiId || '');
  const [editBankName, setEditBankName] = useState(partner.payoutDetails?.bankName || '');
  const [editAccountNumber, setEditAccountNumber] = useState(partner.payoutDetails?.accountNumber || '');
  const [editAccountName, setEditAccountName] = useState(partner.payoutDetails?.accountName || partner.name || '');
  const [editIfsc, setEditIfsc] = useState(partner.payoutDetails?.ifsc || '');
  const [editPaypalEmail, setEditPaypalEmail] = useState(partner.payoutDetails?.paypalEmail || partner.email || '');
  const [editSwiftCode, setEditSwiftCode] = useState(partner.payoutDetails?.swiftCode || '');
  const [editWireDetails, setEditWireDetails] = useState(partner.payoutDetails?.wireDetails || '');
  const [editAutoPayoutThreshold, setEditAutoPayoutThreshold] = useState<number>(
    partner.payoutDetails?.autoPayoutThreshold || 1000
  );
  const [editNotifyOnWhatsApp, setEditNotifyOnWhatsApp] = useState<boolean>(
    partner.payoutDetails?.notifyOnWhatsApp ?? true
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<string | null>(null);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [formValidationErrors, setFormValidationErrors] = useState<{ [key: string]: string }>({});

  // Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [hasExistingPassword, setHasExistingPassword] = useState<boolean>(() => {
    return Boolean(partner.hasPassword || partner.passwordHash || (partner.payoutDetails as any)?.passwordHash);
  });

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Real-time dynamic password strength meter
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [newPassword]);

  // Cloud re-hydration on mount
  useEffect(() => {
    const partnerId = partner?.id || activeSessionPartner?.id;
    if (partnerId) {
      (async () => {
        try {
          const res = await apiClient.get<any>('/crm/partners');
          const data = (res.data || []).find((p: any) => p.id === partnerId);

          if (data) {
            const freshPartner = mapPartnerFromDb(data);
            setPartner(freshPartner);
            authService.setPartnerSession(freshPartner);
            if (onPartnerUpdated) onPartnerUpdated(freshPartner);

            const hasDbPassword = Boolean(
              data.password_hash || (data.payout_details as any)?.passwordHash
            );
            setHasExistingPassword(hasDbPassword);

            setEditName(freshPartner.name || '');
            setEditCompany(freshPartner.company || '');
            setEditPhone(freshPartner.phone || '');
            setEditBio(freshPartner.notes || '');
            setEditPanTaxId(freshPartner.payoutDetails?.panTaxId || '');
            setEditPayoutMethod(freshPartner.payoutMethod || 'UPI');
            setEditUpiId(freshPartner.payoutDetails?.upiId || '');
            setEditBankName(freshPartner.payoutDetails?.bankName || '');
            setEditAccountNumber(freshPartner.payoutDetails?.accountNumber || '');
            setEditAccountName(freshPartner.payoutDetails?.accountName || freshPartner.name || '');
            setEditIfsc(freshPartner.payoutDetails?.ifsc || '');
            setEditPaypalEmail(freshPartner.payoutDetails?.paypalEmail || freshPartner.email || '');
            setEditSwiftCode(freshPartner.payoutDetails?.swiftCode || '');
            setEditWireDetails(freshPartner.payoutDetails?.wireDetails || '');
            setEditAutoPayoutThreshold(freshPartner.payoutDetails?.autoPayoutThreshold || 1000);
            setEditNotifyOnWhatsApp(freshPartner.payoutDetails?.notifyOnWhatsApp ?? true);
          }
        } catch (err) {
          console.warn('MySQL partner rehydrate error:', err);
        }
      })();
    }
  }, []);

  // Referral link
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${encodeURIComponent(partner.referralCode)}`
    : `https://agxperience.com/?ref=${partner.referralCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    referralUrl
  )}&color=0c0f17&bgcolor=ffffff&format=svg`;

  // Calculate active monthly billing volume across all partner direct referrals & CRM leads
  const initialBillingVolume = useMemo(() => {
    const directReferrals = store.partnerReferrals.filter(r => r.partnerId === partner.id);
    const directVal = directReferrals.reduce((acc, r) => acc + (r.dealValue || 0), 0);
    const directPaid = directReferrals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
    return Math.max(directVal, directPaid);
  }, [store.partnerReferrals, partner.id]);

  // Effective commission rate resolution (handles custom fixed percentage or dynamic volume tiers)
  const initialEffectiveRate = useMemo(() => {
    return getEffectivePartnerRate(partner, initialBillingVolume);
  }, [partner, initialBillingVolume]);

  const partnerRate = initialEffectiveRate.rate;
  const partnerRatePercent = initialEffectiveRate.percentage;

  // Filter referrals specifically for this partner & reconcile with store.leads
  const myReferrals = useMemo(() => {
    const directReferrals = store.partnerReferrals.filter(r => r.partnerId === partner.id);
    const existingLeadIds = new Set(directReferrals.map(r => r.leadId).filter(Boolean));
    const existingEmails = new Set(directReferrals.map(r => r.clientEmail?.toLowerCase()).filter(Boolean));

    const orphanPartnerLeads = store.leads.filter(l => {
      if (
        l.partnerId === partner.id ||
        (l.partnerCode && l.partnerCode === partner.referralCode) ||
        (partner.referralCode && l.source && l.source.includes(partner.referralCode))
      ) {
        if (existingLeadIds.has(l.id)) return false;
        if (l.email && existingEmails.has(l.email.toLowerCase())) return false;
        return true;
      }
      return false;
    });

    const synthesizedReferrals: PartnerReferral[] = orphanPartnerLeads.map(l => ({
      id: `lead-ref-${l.id}`,
      partnerId: partner.id,
      leadId: l.id,
      partnerName: partner.name,
      clientName: l.name,
      company: l.company || l.name,
      clientEmail: l.email || undefined,
      clientPhone: l.phone || undefined,
      projectType: l.interestedService || 'AI Automation Blueprint',
      dealValue: l.estimatedDealValue || 0,
      totalPaid: 0,
      pendingPayment: l.estimatedDealValue || 0,
      dealStatus: (l.status as any) || 'NEW',
      paymentStatus: 'Pending',
      commissionRate: partnerRate,
      commissionEarned: 0,
      commissionPaid: 0,
      notes: l.notes,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt
    }));

    return [...directReferrals, ...synthesizedReferrals];
  }, [store.partnerReferrals, store.leads, partner.id, partner.referralCode, partnerRate, partner.name]);

  // Filter payouts for this partner
  const myPayouts = useMemo(() => {
    return store.partnerPayouts.filter(p => p.partnerId === partner.id);
  }, [store.partnerPayouts, partner.id]);

  // Key Calculations
  const totalReferredClients = myReferrals.length;
  const wonDealsCount = myReferrals.filter(
    r => r.dealStatus === 'WON' || r.dealStatus === 'IN PROGRESS' || r.dealStatus === 'COMPLETED'
  ).length;

  const totalPipelineValue = myReferrals.reduce((acc, r) => acc + (r.dealValue || 0), 0);
  const totalClientPaymentsReceived = myReferrals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const activeBillingVolume = Math.max(totalClientPaymentsReceived, totalPipelineValue);

  // Fully reconciled Effective Partner Rate & Tier with complete deal billing volume
  const effectivePartnerRateInfo = useMemo(() => {
    return getEffectivePartnerRate(partner, activeBillingVolume);
  }, [partner, activeBillingVolume]);

  const partnerTier = useMemo(() => {
    return calculatePartnerTier(activeBillingVolume, wonDealsCount);
  }, [activeBillingVolume, wonDealsCount]);

  const winRate = totalReferredClients > 0 ? Math.round((wonDealsCount / totalReferredClients) * 100) : 0;

  const totalCommissionEarned = myReferrals.reduce((acc, r) => acc + (r.commissionEarned || 0), 0);
  const totalCommissionPaidOut = myPayouts
    .filter(p => p.status === 'Completed')
    .reduce((acc, p) => acc + p.amount, 0);
  const availablePendingPayout = Math.max(0, totalCommissionEarned - totalCommissionPaidOut);

  // Copy helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(partner.referralCode);
    setCopiedCode(true);
    toast.success('Referral Code Copied!', partner.referralCode);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    toast.success('Referral Link Copied!', 'Share this URL with prospective clients.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPitch = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchId(id);
    toast.success('Pitch Script Copied!', 'Ready to paste into WhatsApp, LinkedIn, or Email.');
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  // Accept Legal Agreement under Indian Law
  const handleAcceptTerms = async ({ acceptedAt, version }: { acceptedAt: string; version: string }) => {
    const updated: Partner = {
      ...partner,
      termsAccepted: true,
      termsAcceptedAt: acceptedAt,
      termsVersion: version
    };
    setPartner(updated);
    store.updatePartner(partner.id, {
      termsAccepted: true,
      termsAcceptedAt: acceptedAt,
      termsVersion: version
    });
    authService.setPartnerSession(updated);
    if (onPartnerUpdated) onPartnerUpdated(updated);
    setIsTermsModalOpen(false);
    toast.success('Agreement Signed & Certified', 'Welcome to the AGX Partner Network.');
  };

  // Handle direct file upload for an existing referral
  const handleUploadFileForReferral = async (referral: PartnerReferral, file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File Limit Exceeded', `"${file.name}" exceeds the 25MB maximum limit.`);
      return;
    }

    setUploadingReferralId(referral.id);
    try {
      await store.uploadReferralDocument(
        referral.id,
        file,
        referral.clientName,
        referral.company,
        partner.name
      );
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error('Upload Notice', err.message || 'Could not stream document to Google Drive.');
    } finally {
      setUploadingReferralId(null);
    }
  };

  // Submit Client Referral
  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error('Required', 'Please enter client contact name.');
      return;
    }

    const val = Number(newDealValue) || 50000;
    setIsSubmitting(true);

    try {
      const created = await store.addPartnerLeadReferral(partner, {
        clientName: newClientName.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        clientEmail: newClientEmail.trim() || undefined,
        clientPhone: newClientPhone.trim() || undefined,
        projectType: newProjectType,
        dealValue: val,
        notes: newNotes.trim() || undefined
      });

      // Stream any attached files to Google Drive for this newly created referral
      if (newReferralFiles.length > 0 && created?.referral?.id) {
        for (const file of newReferralFiles) {
          try {
            await store.uploadReferralDocument(
              created.referral.id,
              file,
              newClientName.trim(),
              newClientCompany.trim() || newClientName.trim(),
              partner.name
            );
          } catch (fileErr) {
            console.warn('Initial file upload error:', fileErr);
          }
        }
      }

      setIsSubmitModalOpen(false);

      setNewClientName('');
      setNewClientCompany('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewNotes('');
      setNewDealValue('75000');
      setNewReferralFiles([]);
    } catch (err: any) {
      console.error('Submit referral error:', err);
      toast.error('Submission Notice', 'Failed to register referral. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Payout
  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const reqAmt = Number(payoutRequestAmount);
    if (!reqAmt || reqAmt <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid payout amount.');
      return;
    }
    const MIN_PAYOUT_INR = 1000;
    if (reqAmt < MIN_PAYOUT_INR) {
      toast.error('Minimum Threshold', `Minimum payout amount is ₹${MIN_PAYOUT_INR.toLocaleString('en-IN')}.`);
      return;
    }
    if (reqAmt > availablePendingPayout) {
      toast.error('Insufficient Balance', `Your maximum available payout balance is ₹${availablePendingPayout.toLocaleString('en-IN')}.`);
      return;
    }

    store.recordPartnerPayout({
      partnerId: partner.id,
      partnerName: partner.name,
      amount: reqAmt,
      payoutDate: new Date().toISOString().split('T')[0],
      paymentMethod: partner.payoutMethod || 'UPI',
      status: 'Pending',
      notes: payoutNotes.trim() || 'Requested via AGX Partner Portal'
    });

    toast.success(
      'Payout Request Submitted 💸',
      `₹${reqAmt.toLocaleString('en-IN')} requested. Our finance team will disburse via ${partner.payoutMethod || 'UPI'}.`
    );
    setIsPayoutModalOpen(false);
    setPayoutRequestAmount('');
    setPayoutNotes('');
  };

  // Save Partner Profile & Payout Coordinates
  const handleSaveProfileAndPayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!editName.trim() || editName.trim().length < 2) {
      errors.name = 'Please provide a valid full name (min 2 characters).';
    }

    if (editPhone.trim() && !/^[+0-9\s-]{7,18}$/.test(editPhone.trim())) {
      errors.phone = 'Please provide a valid phone or WhatsApp number.';
    }

    if (editPayoutMethod === 'UPI') {
      const upi = editUpiId.trim();
      if (!upi) {
        errors.upiId = 'UPI ID is required.';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(upi)) {
        errors.upiId = 'Enter a valid UPI format (e.g. name@bank or 9876543210@paytm).';
      }
    } else if (editPayoutMethod === 'Bank Transfer') {
      if (!editBankName.trim()) errors.bankName = 'Bank name is required.';
      if (!editAccountName.trim()) errors.accountName = 'Account holder name is required.';
      if (!editAccountNumber.trim() || editAccountNumber.trim().length < 6) {
        errors.accountNumber = 'Enter a valid bank account number (min 6 digits).';
      }
      const ifsc = editIfsc.trim().toUpperCase();
      if (!ifsc) {
        errors.ifsc = 'IFSC code is required.';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
        errors.ifsc = 'Enter a valid 11-character Indian IFSC code (e.g. HDFC0001234).';
      }
    } else if (editPayoutMethod === 'PayPal') {
      const pEmail = editPaypalEmail.trim().toLowerCase();
      if (!pEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pEmail)) {
        errors.paypalEmail = 'Please provide a valid PayPal registered email.';
      }
    } else if (editPayoutMethod === 'Wire') {
      const swift = editSwiftCode.trim().toUpperCase();
      if (!swift || swift.length < 8 || swift.length > 11) {
        errors.swiftCode = 'SWIFT / BIC code must be 8-11 alphanumeric characters.';
      }
      if (!editAccountNumber.trim() && !editWireDetails.trim()) {
        errors.wireDetails = 'Please provide your IBAN or Account Number.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error('Validation Warning', firstError);
      return;
    }

    setFormValidationErrors({});
    setIsSavingSettings(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(null);

    const updatedDetails: PartnerPayoutDetails = {
      upiId: editPayoutMethod === 'UPI' ? editUpiId.trim() : undefined,
      bankName: editPayoutMethod === 'Bank Transfer' || editPayoutMethod === 'Wire' ? editBankName.trim() : undefined,
      accountNumber: editPayoutMethod === 'Bank Transfer' || editPayoutMethod === 'Wire' ? editAccountNumber.trim() : undefined,
      accountName: editPayoutMethod === 'Bank Transfer' || editPayoutMethod === 'Wire' ? editAccountName.trim() : undefined,
      ifsc: editPayoutMethod === 'Bank Transfer' ? editIfsc.trim().toUpperCase() : undefined,
      paypalEmail: editPayoutMethod === 'PayPal' ? editPaypalEmail.trim() : undefined,
      swiftCode: editPayoutMethod === 'Wire' ? editSwiftCode.trim().toUpperCase() : undefined,
      wireDetails: editPayoutMethod === 'Wire' ? editWireDetails.trim() : undefined,
      panTaxId: editPanTaxId.trim() || undefined,
      autoPayoutThreshold: Number(editAutoPayoutThreshold) || 1000,
      notifyOnWhatsApp: Boolean(editNotifyOnWhatsApp),
      notes: editBio.trim() || undefined
    };

    const updatedPartner: Partner = {
      ...partner,
      name: editName.trim(),
      company: editCompany.trim() || undefined,
      phone: editPhone.trim() || undefined,
      notes: editBio.trim() || undefined,
      payoutMethod: editPayoutMethod,
      payoutDetails: updatedDetails,
      updatedAt: new Date().toISOString()
    };

    try {
      // 1. Optimistic Local Save (Instantly persist to memory, store, and active session)
      store.updatePartner(partner.id, {
        name: updatedPartner.name,
        company: updatedPartner.company,
        phone: updatedPartner.phone,
        notes: updatedPartner.notes,
        payoutMethod: editPayoutMethod,
        payoutDetails: updatedDetails
      });

      authService.setPartnerSession(updatedPartner);
      setPartner(updatedPartner);

      if (onPartnerUpdated) onPartnerUpdated(updatedPartner);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('agx_crm_partner_updated', { detail: updatedPartner }));
      }

      setProfileSaveSuccess('Partner profile and payout coordinates saved successfully! ✨');
      toast.success('Partner Profile Saved! ✨', 'Your coordinates have been saved and updated.');
      setTimeout(() => setProfileSaveSuccess(null), 6000);

      // 2. Cloud MySQL Sync (Non-blocking background sync)
      const payload: any = {
        name: updatedPartner.name,
        company: updatedPartner.company,
        phone: updatedPartner.phone,
        notes: updatedPartner.notes,
        payout_method: editPayoutMethod,
        payout_details: updatedDetails,
        updated_at: new Date().toISOString()
      };

      apiClient.put(`/crm/partners/${partner.id}`, payload).then((res) => {
        if (res && res.success && !res.deferred) {
          console.log('[Partner Portal] MySQL cloud sync confirmed');
        }
      }).catch((syncErr) => {
        console.warn('[Partner Portal] Database sync deferred (saved locally):', syncErr.message);
      });
    } catch (err: any) {
      console.error('Error updating partner profile:', err);
      const errMsg = err?.message || 'Unable to update coordinates. Please retry.';
      setProfileSaveError(errMsg);
      toast.error('Save Failed', errMsg);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (hasExistingPassword) {
      if (!trimmedCurrent) {
        setPasswordError('Please enter your current password.');
        toast.error('Validation Warning', 'Current password is required.');
        return;
      }
      if (trimmedNew === trimmedCurrent) {
        setPasswordError('New password must be different from your current password.');
        toast.error('Invalid Password', 'New password must differ from current.');
        return;
      }
    }

    if (!trimmedNew) {
      setPasswordError('Please enter a password.');
      toast.error('Validation Warning', 'Password is required.');
      return;
    }
    if (trimmedNew.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      toast.error('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setPasswordError('Password confirmation does not match. Please verify.');
      toast.error('Mismatch', 'Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.updatePartnerPassword(
        partner.id,
        partner.email,
        hasExistingPassword ? trimmedCurrent : null,
        trimmedNew
      );

      if (res.error) {
        setPasswordError(res.error.message);
        toast.error('Operation Failed', res.error.message);
      } else {
        const successMsg = hasExistingPassword
          ? 'Password successfully updated! Your credentials have been refreshed.'
          : 'Password successfully created! You can now log in using your email and password.';
        setPasswordSuccess(successMsg);
        toast.success(
          hasExistingPassword ? 'Password Updated 🔐' : 'Password Created 🎉',
          hasExistingPassword
            ? 'Your partner login password has been successfully updated.'
            : 'Account password created. You can now use email & password to sign in!'
        );
        setHasExistingPassword(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 6000);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Please try again.';
      setPasswordError(msg);
      toast.error('Error', msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLogoutPartner = () => {
    authService.signOutPartner();
    onLogout();
  };

  // Filtered referrals list for referrals tab
  const filteredReferrals = myReferrals.filter(r => {
    const matchesSearch =
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.company && r.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.projectType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NEW') return r.dealStatus === 'NEW' || r.dealStatus === 'CONTACTED' || r.dealStatus === 'QUALIFIED';
    if (statusFilter === 'WON') return r.dealStatus === 'WON' || r.dealStatus === 'IN PROGRESS';
    if (statusFilter === 'COMPLETED') return r.dealStatus === 'COMPLETED';
    return true;
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'referrals', label: 'Referred Clients', icon: Users, count: myReferrals.length },
    { id: 'payouts', label: 'Payout Vault & Ledger', icon: Wallet, count: availablePendingPayout > 0 ? 1 : undefined },
    { id: 'toolkit', label: 'Growth Toolkit', icon: Sparkles },
    { id: 'settings', label: 'Profile & Settings', icon: CreditCard },
  ];

  return (
    <div className="crm-theme min-h-screen bg-[#F4F3F9] text-gray-900 flex antialiased overflow-x-hidden relative">
      
      {/* 1. Left Dark Sidebar (Exact Admin CRM Architecture) */}
      <aside className="w-64 bg-gradient-to-b from-[#0C0F17] via-[#090C12] to-[#06080D] border-r border-white/[0.08] text-white flex-shrink-0 flex flex-col justify-between p-4 hidden md:flex z-30 shadow-2xl">
        <div>
          {/* Top Logo */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 px-3 py-4 cursor-pointer hover:opacity-90 transition-opacity mb-4 group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#CCFF00] text-black font-black italic flex items-center justify-center text-lg shadow-[0_0_15px_rgba(204,255,0,0.3)] group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="text-xl font-black italic tracking-tighter text-white block leading-none">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <span className="text-[10px] font-mono text-[#CCFF00] uppercase tracking-widest block mt-0.5 font-bold">
                Partner OS
              </span>
            </div>
          </div>

          {/* Partner Tier Summary Badge */}
          <div className="mx-2 mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ backgroundColor: `${partnerTier.tierColor}20`, color: partnerTier.tierColor }}
            >
              <Award size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block">Active Tier</span>
              <span className="text-xs font-black text-white block truncate">{partnerTier.badgeLabel} ({partnerRatePercent}%)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as PartnerTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative btn-press ${
                    isActive
                      ? 'bg-white/[0.12] text-white shadow-inner border border-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#CCFF00] rounded-r-full shadow-[0_0_10px_#CCFF00]" />
                  )}
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-[#CCFF00]' : 'text-gray-400'} />
                    <span className={isActive ? 'text-white font-extrabold' : 'font-medium'}>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#CCFF00] text-black font-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {/* Referral Code Quick Pill */}
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] uppercase font-mono text-white/40 block">Your Code</span>
              <span className="font-mono font-bold text-[#CCFF00] text-xs">{partner.referralCode}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Copy Referral Code"
            >
              {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>

          {/* Cloud Sync Status */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-2xl border border-white/5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${store.isMySQLConnected ? 'bg-[#CCFF00] animate-pulse shadow-[0_0_6px_#CCFF00]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]'}`} />
              <span className="text-gray-300 font-medium">{store.isMySQLConnected ? 'MySQL Cloud Sync' : 'Local Storage Engine'}</span>
            </div>
            <button
              onClick={() => store.refreshFromCloud(false)}
              className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer btn-press"
              title={store.isMySQLConnected ? 'Sync with MySQL cloud database' : 'Sync latest local storage records'}
            >
              <RefreshCw size={12} className={store.isSyncing ? 'animate-spin text-[#CCFF00]' : ''} />
            </button>
          </div>

          {/* Back to Website */}
          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer btn-press"
          >
            <div className="flex items-center gap-2">
              <Globe size={15} />
              <span>Back to Website</span>
            </div>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Floating Glass Island Top Header */}
        <div className="px-4 sm:px-6 pt-3 pb-1 z-20 sticky top-0">
          <header className="glass-island h-14 rounded-2xl px-4 sm:px-5 flex items-center justify-between">
            {/* Left Search / Action Area */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'referrals' && e.target.value.trim()) {
                      setActiveTab('referrals');
                    }
                  }}
                  placeholder="Search referred clients, companies, or deals..."
                  className="w-full bg-gray-100/70 hover:bg-gray-100 focus:bg-white text-gray-900 pl-9 pr-3.5 py-1.5 rounded-xl text-xs transition-colors border border-gray-200/50 outline-none focus:border-black font-medium"
                />
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5">
              {/* Quick Link Copy Button */}
              <button
                onClick={handleCopyLink}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 font-bold text-xs cursor-pointer transition-colors btn-press"
                title="Copy tracking URL"
              >
                {copiedLink ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} className="text-gray-500" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              {/* QR Code Quick Button */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 font-semibold text-xs cursor-pointer transition-colors btn-press"
                title="Show QR Code"
              >
                <QrCode size={13} />
                <span className="hidden md:inline">QR</span>
              </button>

              {/* Primary Action Button: + Submit Client Intro */}
              <div className="relative">
                <BorderBeam size="pulse-inner" colorVariant="sunset" strength={0.8} style={{ display: 'inline-block' }}>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full bg-black hover:bg-gray-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer btn-press group"
                  >
                    <span>Submit Intro</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                      <Plus size={12} className="text-[#CCFF00] group-hover:text-black transition-colors" />
                    </span>
                  </button>
                </BorderBeam>
              </div>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifDrawerOpen(!isNotifDrawerOpen)}
                  className="p-2 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 transition-colors relative cursor-pointer btn-press"
                >
                  <Bell size={17} />
                  {availablePendingPayout > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white shadow-xs" />
                  )}
                </button>

                {/* Notifications Popover */}
                <AnimatePresence>
                  {isNotifDrawerOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      style={{ transformOrigin: 'top right' }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 text-xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                          <h4 className="font-extrabold text-sm text-gray-900">Partner Alerts</h4>
                          <span className="text-[10px] text-gray-400">Real-time commission and deal updates</span>
                        </div>
                      </div>

                      <div className="py-2 space-y-2">
                        {availablePendingPayout > 0 ? (
                          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                              <Wallet size={14} className="text-emerald-600" />
                              <span>₹{availablePendingPayout.toLocaleString('en-IN')} Available in Vault</span>
                            </div>
                            <p className="text-emerald-700 text-[11px] mt-1">
                              You have cleared milestone commissions ready for withdrawal via {partner.payoutMethod || 'UPI'}.
                            </p>
                            <button
                              onClick={() => { setIsNotifDrawerOpen(false); setIsPayoutModalOpen(true); }}
                              className="mt-2 text-[11px] font-black text-emerald-900 underline cursor-pointer"
                            >
                              Request Withdrawal Now →
                            </button>
                          </div>
                        ) : null}

                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <span className="font-bold text-gray-900 text-xs block">Active Tier: {partnerTier.badgeLabel}</span>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            {partnerTier.nextTier ? `Refer ${partnerTier.dealsNeededForNextTier} more client to unlock ${partnerTier.nextTier} Tier (${partnerTier.nextTier === 'Gold' ? '20%' : '15%'})!` : 'You are at maximum Gold Tier (20%)!'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Partner Profile Pill */}
              <div className="relative">
                <div
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200/80 p-1.5 pr-3 rounded-full cursor-pointer transition-colors btn-press"
                >
                  <div className="w-8 h-8 rounded-full bg-black text-[#CCFF00] font-black italic flex items-center justify-center text-xs shadow-xs">
                    {partner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-extrabold text-gray-900 block leading-none">
                      {partner.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-400 block leading-none mt-0.5">
                      {partnerTier.badgeLabel}
                    </span>
                  </div>
                </div>

                {/* Profile Popover */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      style={{ transformOrigin: 'top right' }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 z-50 text-xs"
                    >
                      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] font-black italic flex items-center justify-center text-base shadow-sm">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="text-gray-900 text-xs font-black block truncate">{partner.name}</strong>
                          <span className="text-[11px] text-gray-400 block truncate">{partner.email}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold text-gray-800 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              {partnerTier.badgeLabel} ({partnerRatePercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => { setActiveTab('settings'); setIsProfileMenuOpen(false); }}
                          className="w-full px-3 py-2 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                        >
                          <CreditCard size={14} className="text-gray-400" />
                          <span>Payout Coordinates & Profile</span>
                        </button>
                        <button
                          onClick={() => { setIsQrModalOpen(true); setIsProfileMenuOpen(false); }}
                          className="w-full px-3 py-2 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                        >
                          <QrCode size={14} className="text-gray-400" />
                          <span>Show QR Business Card</span>
                        </button>
                        <button
                          onClick={() => { setActiveTab('toolkit'); setIsProfileMenuOpen(false); }}
                          className="w-full px-3 py-2 rounded-xl text-left font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                        >
                          <Sparkles size={14} className="text-gray-400" />
                          <span>Growth & Outreach Scripts</span>
                        </button>
                      </div>

                      <div className="pt-2 mt-2 border-t border-gray-100">
                        <button
                          onClick={handleLogoutPartner}
                          className="w-full px-3 py-2 rounded-xl text-left font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors btn-press"
                        >
                          <LogOut size={14} />
                          <span>Sign Out Partner Session</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
        </div>

        {/* Mobile Floating Bottom Dock */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'referrals', label: 'Clients', icon: Users, count: myReferrals.length },
            { id: 'payouts', label: 'Vault', icon: Wallet },
            { id: 'toolkit', label: 'Toolkit', icon: Sparkles },
            { id: 'settings', label: 'Settings', icon: CreditCard },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as PartnerTab); setIsMobileMoreOpen(false); }}
                className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all relative btn-press ${
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                <div className="relative">
                  <Icon size={18} className={isActive ? 'text-black' : 'text-gray-400'} />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-2 bg-black text-[#CCFF00] text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{tab.label}</span>
                {isActive && <span className="w-1 h-1 rounded-full bg-black mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Workspace Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-2 sm:pt-4 pb-24 md:pb-8 overflow-y-auto crm-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* ======================================================== */}
            {/* VIEW 1: EXECUTIVE DASHBOARD                             */}
            {/* ======================================================== */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Top Banner Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                        {greeting}, {partner.name.split(' ')[0]} 👋
                      </h2>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                        effectivePartnerRateInfo.isCustom
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-black text-[#CCFF00]'
                      }`}>
                        {effectivePartnerRateInfo.isCustom ? `⚡ Fixed ${effectivePartnerRateInfo.percentage}% (VIP)` : partnerTier.badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Track your client introductions, deal milestone releases, and withdraw your commission directly to UPI.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors shadow-xs cursor-pointer btn-press"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                    </button>
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-bold hover:bg-[#b8e600] transition-colors shadow-sm cursor-pointer btn-press"
                    >
                      <Plus size={14} /> Submit Client Intro
                    </button>
                  </div>
                </div>

                {/* 4 Double-Bezel Tactile KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Introductions */}
                  <div
                    onClick={() => setActiveTab('referrals')}
                    className="double-bezel-outer card-tactile cursor-pointer group"
                  >
                    <div className="double-bezel-inner p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs bg-blue-50 text-blue-600 border border-blue-100">
                            <Users size={20} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-black transition-colors">Introductions</h3>
                            <p className="text-xs text-gray-500 font-medium tabular-nums">{totalReferredClients} Total Leads</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-black flex items-center justify-center transition-colors">
                          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#CCFF00] transition-all" />
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Win Rate</span>
                          <span className="font-extrabold text-gray-900 text-sm tabular-nums">{winRate}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Won Deals</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] mt-0.5 inline-block">
                            {wonDealsCount} Won
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Deal Pipeline */}
                  <div
                    onClick={() => setActiveTab('referrals')}
                    className="double-bezel-outer card-tactile cursor-pointer group"
                  >
                    <div className="double-bezel-inner p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs bg-purple-50 text-purple-600 border border-purple-100">
                            <Briefcase size={20} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-black transition-colors">Deal Pipeline</h3>
                            <p className="text-xs text-gray-500 font-medium tabular-nums">Active Contracts</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-black flex items-center justify-center transition-colors">
                          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#CCFF00] transition-all" />
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contract Value</span>
                          <span className="font-extrabold text-gray-900 text-sm tabular-nums font-mono">
                            ₹{totalPipelineValue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Potential Cut</span>
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg text-[10px] mt-0.5 inline-block font-mono">
                            ₹{Math.round(totalPipelineValue * partnerRate).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Available Payout Vault (Luminous Hero Card) */}
                  <div
                    className="double-bezel-outer card-tactile cursor-pointer group"
                    onClick={() => setActiveTab('payouts')}
                  >
                    <div className="double-bezel-inner p-5 h-full flex flex-col justify-between bg-gradient-to-br from-[#0E131F] to-[#080B12] text-white relative overflow-hidden">
                      <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-[#CCFF00]/15 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/25">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 inline-block mb-1">
                              Payout Vault
                            </span>
                            <h3 className="font-extrabold text-white text-sm">Ready to Withdraw</h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                        <div>
                          <div className="text-2xl font-black text-[#CCFF00] font-['Outfit'] tabular-nums tracking-tight">
                            ₹{availablePendingPayout.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-0.5 block">Via {partner.payoutMethod || 'UPI'}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsPayoutModalOpen(true);
                          }}
                          disabled={availablePendingPayout < 1000}
                          className="px-3 py-1.5 rounded-xl bg-[#CCFF00] text-black text-[11px] font-black uppercase tracking-wider hover:bg-[#b8e600] disabled:opacity-30 disabled:hover:bg-[#CCFF00] transition-colors cursor-pointer"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Lifetime Earnings */}
                  <div
                    onClick={() => setActiveTab('payouts')}
                    className="double-bezel-outer card-tactile cursor-pointer group"
                  >
                    <div className="double-bezel-inner p-5 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <IndianRupee size={20} />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-black transition-colors">Lifetime Earnings</h3>
                            <p className="text-xs text-gray-500 font-medium tabular-nums">All Milestones</p>
                          </div>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-black flex items-center justify-center transition-colors">
                          <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#CCFF00] transition-all" />
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Earned</span>
                          <span className="font-extrabold text-gray-900 text-sm tabular-nums font-mono">
                            ₹{totalCommissionEarned.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Disbursed</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px] mt-0.5 inline-block font-mono">
                            ₹{totalCommissionPaidOut.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volume-Based Partner Tier Progression Card OR VIP Custom Fixed Rate Agreement */}
                {effectivePartnerRateInfo.isCustom ? (
                  <div className="bg-gradient-to-br from-[#120B22] via-[#1A1033] to-[#0D0719] text-white rounded-3xl p-6 md:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-6">
                    {/* Atmospheric Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg shadow-purple-900/40 border border-purple-400/30 shrink-0">
                          <Zap size={28} className="text-[#CCFF00] fill-[#CCFF00]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-purple-300 font-bold">
                              Exclusive Partnership Status
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/40 font-mono flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                              VIP Custom Rate
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                            Guaranteed {effectivePartnerRateInfo.percentage}% Fixed Commission
                          </h3>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs text-right self-start md:self-auto">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Active Billing Volume</span>
                        <span className="text-lg font-black font-mono text-[#CCFF00]">
                          ₹{activeBillingVolume.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Explanatory Message */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-purple-400/20 text-xs text-purple-200/90 leading-relaxed relative z-10">
                      <div className="flex items-start gap-2.5">
                        <Sparkles size={16} className="text-[#CCFF00] shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white">VIP Priority Plan:</strong> Your account is locked at a guaranteed flat <strong>{effectivePartnerRateInfo.percentage}% commission</strong> across all cleared contract milestones. Monthly volume tiers and minimum quotas are bypassed.
                          {partner.customRateReason && (
                            <div className="mt-2 text-purple-200 font-medium text-[11px] bg-purple-950/60 p-2.5 rounded-xl border border-purple-500/30">
                              📋 <strong>Agreement Note:</strong> {partner.customRateReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4 Guaranteed Sample Milestone Payout Cards */}
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block font-mono">
                        Guaranteed Take-Home Earnings Matrix
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { deal: 100000, label: 'Starter Deal' },
                          { deal: 250000, label: 'Mid-Market Deal' },
                          { deal: 500000, label: 'Enterprise Deal' },
                          { deal: 1000000, label: 'Large Enterprise' }
                        ].map(tierSample => {
                          const payout = Math.round(tierSample.deal * effectivePartnerRateInfo.rate);
                          return (
                            <div key={tierSample.deal} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/40 transition-all flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-purple-300 uppercase block">{tierSample.label}</span>
                                <span className="text-xs text-gray-400 font-mono mt-0.5 block">₹{tierSample.deal.toLocaleString('en-IN')} Deal</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-white/10">
                                <div className="text-2xl font-black text-white tracking-tight font-mono">
                                  ₹{payout.toLocaleString('en-IN')}
                                </div>
                                <span className="text-[10px] text-[#CCFF00] font-bold block mt-0.5">
                                  {effectivePartnerRateInfo.percentage}% Guaranteed
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reference Toggle: View Standard Dynamic Tiers */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                      <span className="text-gray-400 text-[11px]">Want to check standard public agency tiers?</span>
                      <button
                        type="button"
                        onClick={() => setShowStandardTiersWhenCustom(!showStandardTiersWhenCustom)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {showStandardTiersWhenCustom ? 'Hide Standard Tiers' : 'View Standard Tiers (Reference)'}
                      </button>
                    </div>

                    {/* Standard Tiers when expanded */}
                    {showStandardTiersWhenCustom && (
                      <div className="pt-4 border-t border-white/10 space-y-3 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          Standard Public Tiers Reference
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-gray-900">
                          <div className="p-3.5 rounded-xl bg-white text-gray-900 text-xs">
                            <span className="font-bold block text-gray-500 uppercase text-[10px]">Starter Tier</span>
                            <span className="text-lg font-black font-['Outfit'] block mt-1">10%</span>
                            <span className="text-[10px] text-gray-600 block">Up to ₹2.5L volume</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white text-gray-900 text-xs">
                            <span className="font-bold block text-blue-600 uppercase text-[10px]">Base Tier</span>
                            <span className="text-lg font-black font-['Outfit'] block mt-1">15%</span>
                            <span className="text-[10px] text-gray-600 block">₹2.5L — ₹4.0L volume</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white text-gray-900 text-xs">
                            <span className="font-bold block text-emerald-600 uppercase text-[10px]">Pro Tier</span>
                            <span className="text-lg font-black font-['Outfit'] block mt-1">20%</span>
                            <span className="text-[10px] text-gray-600 block">Above ₹4.0L volume</span>
                          </div>
                          <div className="p-3.5 rounded-xl bg-white text-gray-900 text-xs border border-emerald-400">
                            <span className="font-bold block text-emerald-700 uppercase text-[10px]">Elite Tier</span>
                            <span className="text-lg font-black font-['Outfit'] block mt-1">25%</span>
                            <span className="text-[10px] text-gray-600 block">&gt; ₹12.0L (+5% Bonus)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border"
                          style={{ 
                            backgroundColor: `${partnerTier.tierColor}15`, 
                            color: partnerTier.tierColor,
                            borderColor: `${partnerTier.tierColor}30`
                          }}
                        >
                          <Award size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 font-bold">Commission Tier</span>
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono"
                              style={{ 
                                backgroundColor: `${partnerTier.tierColor}15`, 
                                color: partnerTier.tierColor,
                                borderColor: `${partnerTier.tierColor}30`
                              }}
                            >
                              {partnerTier.badgeLabel}
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 mt-0.5">
                            {partnerTier.nextTier ? (
                              <span>
                                Generate <strong className="text-black font-black">₹{partnerTier.volumeNeededForNextTier.toLocaleString('en-IN')} more</strong> in monthly business to unlock the <strong>{partnerTier.nextTier} Tier ({partnerTier.nextTier === 'Elite' ? '25%' : partnerTier.nextTier === 'Pro' ? '20%' : '15%'})</strong>!
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-bold">
                                Max Elite Bonus Tier Unlocked! You receive top-tier 25% (+5% Performance Bonus) on all business generated.
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Current Month&apos;s Business</span>
                        <span className="text-base font-black font-mono text-gray-900">₹{activeBillingVolume.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Flexible Business Volume Clarification Banner */}
                    <div className="mt-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-2.5 text-xs text-gray-600">
                      <Sparkles size={15} className="text-[#CCFF00] bg-black rounded-md p-0.5 shrink-0" />
                      <span>
                        <strong className="text-gray-900">100% Flexible & Performance-Based:</strong> Monthly billing is not a fixed retainer or rigid quota. Your payout tier flexes dynamically based on the actual business volume your referred clients bill each month.
                      </span>
                    </div>

                    {/* 4 Cards Matrix matching User's Provided Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
                      {/* Card 1: Starter Tier */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        partnerTier.tier === 'Starter'
                          ? 'bg-slate-50 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-600 block">Starter Tier</span>
                            {partnerTier.tier === 'Starter' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800">Current</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">Up to ₹2,50,000<br/>(Monthly Business)</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/60">
                          <div className="text-3xl font-black text-gray-900 tracking-tight font-['Outfit']">10%</div>
                          <span className="text-xs font-bold text-gray-700 block">Share.</span>
                          <span className="text-[10px] text-gray-400 mt-1 block">Entry tier with zero mandatory quotas.</span>
                        </div>
                      </div>

                      {/* Card 2: Base Tier */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        partnerTier.tier === 'Base'
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-900 block">Base Tier</span>
                            {partnerTier.tier === 'Base' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">Current</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">₹2,50,001 — ₹4,00,000<br/>(Monthly Business)</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/60">
                          <div className="text-3xl font-black text-gray-900 tracking-tight font-['Outfit']">15%</div>
                          <span className="text-xs font-bold text-gray-900 block">Share.</span>
                          <span className="text-[10px] text-gray-400 mt-1 block">Standard agency & partner rate.</span>
                        </div>
                      </div>

                      {/* Card 3: Pro Tier */}
                      <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        partnerTier.tier === 'Pro'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-gray-50/50 border-gray-200'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-900 block">Pro Tier</span>
                            {partnerTier.tier === 'Pro' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">Current</span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">Above ₹4,00,000<br/>(Monthly Business)</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200/60">
                          <div className="text-3xl font-black text-gray-900 tracking-tight font-['Outfit']">20%</div>
                          <span className="text-xs font-bold text-gray-900 block">Share.</span>
                          <span className="text-[10px] text-emerald-800 font-medium italic mt-1 block leading-tight">
                            Applied to all business closed this month, not just overflow.
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Elite Bonus Tier (Vibrant Green Border like Image) */}
                      <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                        partnerTier.tier === 'Elite'
                          ? 'bg-emerald-50/80 border-emerald-500 ring-4 ring-emerald-400/20 shadow-md'
                          : 'bg-emerald-50/30 border-emerald-500/80'
                      }`}>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-emerald-950 block">Elite Bonus Tier</span>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-black">Top Tier</span>
                          </div>
                          <p className="text-[11px] text-emerald-900 font-medium mt-1">Exceeds ₹12,00,000<br/>(Monthly Business)</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-200">
                          <div className="text-3xl font-black text-gray-900 tracking-tight font-['Outfit']">25%</div>
                          <span className="text-xs font-black text-gray-900 block">Share.</span>
                          <span className="text-[10px] text-emerald-800 font-bold mt-1 block leading-tight">
                            (+5% Performance Bonus on total monthly business).
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="mt-5 pt-3.5 border-t border-gray-100 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-gray-500 font-medium">₹{activeBillingVolume.toLocaleString('en-IN')} Billing Active</span>
                        <span className="text-gray-900 font-bold">{partnerTier.progressPercent}% to {partnerTier.nextTier ? `${partnerTier.nextTier} Tier` : 'Max Tier'}</span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                        <div 
                          className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-black via-emerald-500 to-[#CCFF00]"
                          style={{ width: `${Math.max(4, partnerTier.progressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2-Column Split: Recent Referrals Table & Growth Widget */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column (8 cols): Recent Referrals Table */}
                  <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-base">Recent Client Introductions</h3>
                          <span className="text-xs text-gray-400 font-medium">Live pipeline tracking & 3-stage milestone progression</span>
                        </div>
                        <button
                          onClick={() => setActiveTab('referrals')}
                          className="text-xs font-bold text-gray-900 hover:text-black hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View All ({myReferrals.length}) <ChevronRight size={14} />
                        </button>
                      </div>

                      {myReferrals.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center justify-center">
                          <BotAvatar type="star" size={72} state="default" aria-label="Partner Assistant" />
                          <h4 className="text-sm font-bold text-gray-900 mt-3">No client introductions yet</h4>
                          <p className="text-xs text-gray-500 mt-1 max-w-sm">
                            Introduce businesses looking for AI automations and claim {partnerRatePercent}% on every cleared contract milestone.
                          </p>
                          <button
                            onClick={() => setIsSubmitModalOpen(true)}
                            className="mt-4 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            + Submit First Client Intro
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 mt-2">
                          {myReferrals.slice(0, 4).map((r) => {
                            const percentPaid = r.dealValue > 0 ? Math.min(100, Math.round((r.totalPaid / r.dealValue) * 100)) : 0;
                            return (
                              <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-gray-900">{r.clientName}</span>
                                    {r.company && <span className="text-xs text-gray-400 font-medium">@{r.company}</span>}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold">{r.projectType}</span>
                                    <span>· Deal: ₹{(r.dealValue || 0).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-gray-900 block">
                                      ₹{Math.round((r.dealValue || 0) * partnerRate).toLocaleString('en-IN')} Cut
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                      r.dealStatus === 'WON' || r.dealStatus === 'COMPLETED'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      {r.dealStatus} ({percentPaid}% Paid)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (4 cols): Commission Calculator & Link Card */}
                  <div className="lg:col-span-4 space-y-4">
                    {/* Interactive Commission Simulator Widget */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator size={16} className="text-indigo-600" />
                        <h4 className="font-extrabold text-sm text-gray-900">Commission Calculator</h4>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">
                        Slide to see your take-home cut adjust dynamically across the 10%, 15%, 20%, and 25% tiers based on actual business closed.
                      </p>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 font-medium">Monthly Business Generated</span>
                          <span className="font-mono font-bold text-gray-900 text-sm">₹{simDealValue.toLocaleString('en-IN')}</span>
                        </div>
                        <input
                          type="range"
                          min={50000}
                          max={1600000}
                          step={25000}
                          value={simDealValue}
                          onChange={(e) => setSimDealValue(Number(e.target.value))}
                          className="w-full accent-black cursor-pointer"
                        />

                        {/* Dynamically simulated tier and commission */}
                        {(() => {
                          const effectiveSim = getEffectivePartnerRate(partner, simDealValue);
                          const simCut = Math.round(simDealValue * effectiveSim.rate);
                          return (
                            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Your Take-Home</span>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    effectiveSim.isCustom ? 'bg-purple-700 text-white' : 'bg-black text-[#CCFF00]'
                                  }`}>
                                    {effectiveSim.isCustom ? 'VIP Fixed' : `${effectiveSim.tier} Tier`}
                                  </span>
                                </div>
                                <span className="text-xl font-black text-gray-900 font-mono mt-0.5 block">
                                  ₹{simCut.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-black px-2.5 py-1 rounded-xl block border ${
                                  effectiveSim.isCustom
                                    ? 'text-purple-800 bg-purple-50 border-purple-200'
                                    : 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                                }`}>
                                  {effectiveSim.percentage}% Share
                                </span>
                                {effectiveSim.isCustom ? (
                                  <span className="text-[9px] font-bold text-purple-700 block mt-1">Guaranteed Fixed Rate</span>
                                ) : effectiveSim.tier === 'Elite' ? (
                                  <span className="text-[9px] font-bold text-emerald-600 block mt-1">+5% Bonus Included</span>
                                ) : null}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Quick Referral QR / Share Card */}
                    <div className="bg-gradient-to-br from-[#0C0F17] to-[#07090E] text-white rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider">Direct Referral Link</span>
                        <QrCode size={16} className="text-white/60 cursor-pointer hover:text-white" onClick={() => setIsQrModalOpen(true)} />
                      </div>
                      <h4 className="font-black text-base text-white">Share Your Link</h4>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed">
                        Clients using your link are automatically tagged to your partner ledger.
                      </p>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={handleCopyLink}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs hover:bg-[#b8e600] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md btn-press"
                        >
                          {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
                          <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                        <button
                          onClick={() => setIsQrModalOpen(true)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer btn-press"
                          title="Show QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: REFERRED CLIENTS & DEAL PIPELINE                */}
            {/* ======================================================== */}
            {activeTab === 'referrals' && (
              <div className="space-y-5">
                {/* Header row with search & filters */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Referred Clients & Deals</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Track the real-time milestone release and payments for every client you introduced.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center p-1 rounded-xl bg-gray-100 text-xs font-bold">
                      {(['ALL', 'NEW', 'WON', 'COMPLETED'] as const).map(f => (
                        <button
                          key={f}
                          onClick={() => setStatusFilter(f)}
                          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            statusFilter === f
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors cursor-pointer btn-press"
                    >
                      <Plus size={14} className="text-[#CCFF00]" />
                      <span>Submit Intro</span>
                    </button>
                  </div>
                </div>

                {/* Referrals Cards Grid */}
                {filteredReferrals.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                    <BotAvatar type="star" size={88} state="default" aria-label="Partner Mascot" />
                    <h4 className="text-base font-extrabold text-gray-900 mt-4">No matching referrals found</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-md">
                      Introduce clients using your referral link or the submit form. When contracts close, milestones disburse into your payout vault.
                    </p>
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black text-xs font-extrabold hover:bg-[#b8e600] transition-colors cursor-pointer"
                    >
                      + Submit Client Intro
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredReferrals.map((referral) => {
                      const percentPaid =
                        referral.dealValue > 0
                          ? Math.min(100, Math.round((referral.totalPaid / referral.dealValue) * 100))
                          : 0;
                      const isFullySettled = referral.totalPaid >= referral.dealValue && referral.dealValue > 0;
                      const earnedCut = referral.commissionEarned || Math.round(referral.totalPaid * partnerRate);
                      const fullPotentialCut = Math.round(referral.dealValue * partnerRate);

                      const stage1Cleared = percentPaid >= 35;
                      const stage2Cleared = percentPaid >= 65;
                      const stage3Cleared = isFullySettled;

                      const isDocsExpanded = expandedDocReferralId === referral.id;
                      const isUploadingThis = uploadingReferralId === referral.id;
                      const isDraggingThis = dragActiveReferralId === referral.id;

                      const attachedDocs: ClientDocument[] = [
                        ...(referral.documents || []),
                        ...(store.documents || []).filter(
                          d => (d.leadId && (d.leadId === referral.id || d.leadId === referral.leadId)) ||
                               (d.clientId && d.clientId === referral.clientId) ||
                               (d.leadName && referral.clientName && d.leadName.toLowerCase() === referral.clientName.toLowerCase())
                        ).map(cd => ({
                          id: cd.id,
                          title: cd.title,
                          docType: cd.docType,
                          leadId: cd.leadId,
                          clientId: cd.clientId,
                          leadName: cd.leadName,
                          fileUrl: cd.fileUrl,
                          fileSize: cd.fileSize,
                          uploadedBy: cd.uploadedBy,
                          createdAt: cd.createdAt
                        }))
                      ].filter((doc, idx, arr) => arr.findIndex(x => x.id === doc.id || (x.title === doc.title && x.fileUrl === doc.fileUrl)) === idx);

                      return (
                        <div
                          key={referral.id}
                          className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow space-y-4"
                        >
                          {/* Client Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="text-base font-extrabold text-gray-900">{referral.clientName}</h4>
                                {referral.company && (
                                  <span className="text-xs text-gray-500 font-medium">@{referral.company}</span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[10px]">
                                  {referral.projectType}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                <span>Introduced {new Date(referral.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                {referral.clientPhone && <span>• {referral.clientPhone}</span>}
                                {referral.clientEmail && <span>• {referral.clientEmail}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                referral.dealStatus === 'COMPLETED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : referral.dealStatus === 'WON' || referral.dealStatus === 'IN PROGRESS'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                Deal: {referral.dealStatus}
                              </span>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-800">
                                {isFullySettled ? '100% Settled ✓' : `${percentPaid}% Paid`}
                              </span>
                            </div>
                          </div>

                          {/* 3-Stage Milestone Visualizer */}
                          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-semibold">Milestone Release Progress</span>
                              <span className="font-mono text-gray-900 font-bold text-[11px]">
                                ₹{referral.totalPaid.toLocaleString('en-IN')} of ₹{referral.dealValue.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                              {/* Stage 1 */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                                stage1Cleared
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}>
                                <div className="flex items-center gap-1">
                                  {stage1Cleared ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Clock size={12} />}
                                  <span>Milestone 1</span>
                                </div>
                                <span className="text-[9px] font-normal">Kickoff Advance (40%)</span>
                              </div>

                              {/* Stage 2 */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                                stage2Cleared
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}>
                                <div className="flex items-center gap-1">
                                  {stage2Cleared ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Clock size={12} />}
                                  <span>Milestone 2</span>
                                </div>
                                <span className="text-[9px] font-normal">UAT Demo (30%)</span>
                              </div>

                              {/* Stage 3 */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                                stage3Cleared
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                                  : 'bg-white border-gray-200 text-gray-400'
                              }`}>
                                <div className="flex items-center gap-1">
                                  {stage3Cleared ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Clock size={12} />}
                                  <span>Milestone 3</span>
                                </div>
                                <span className="text-[9px] font-normal">Final Handover (30%)</span>
                              </div>
                            </div>
                          </div>

                          {/* Financial Breakdown Strip */}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Contract Budget</span>
                                <span className="font-mono font-extrabold text-gray-900 text-sm">
                                  ₹{referral.dealValue.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div className="h-6 w-[1px] bg-gray-200" />
                              <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Your Cut ({partnerRatePercent}%)</span>
                                <span className="font-mono font-extrabold text-emerald-600 text-sm">
                                  ₹{fullPotentialCut.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commission Released</span>
                              <span className="font-mono font-black text-gray-900 text-sm">
                                ₹{earnedCut.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Client Documents & Google Drive Vault Section */}
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              {/* Left: Badge with folder icon, count, and accordion toggle */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedDocReferralId(isDocsExpanded ? null : referral.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold transition-all cursor-pointer"
                                >
                                  <Folder size={13} className="text-[#0C0F17]" />
                                  <span>Client Files & Drive</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    attachedDocs.length > 0 ? 'bg-black text-[#CCFF00]' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {attachedDocs.length}
                                  </span>
                                  <ChevronDown size={12} className={`transition-transform text-gray-500 ${isDocsExpanded ? 'rotate-180' : ''}`} />
                                </button>

                                {referral.driveFolderUrl && (
                                  <a
                                    href={referral.driveFolderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer"
                                    title="Open dedicated Google Drive folder for this client"
                                  >
                                    <span>📁 Open in Drive</span>
                                    <ExternalLink size={10} />
                                  </a>
                                )}
                              </div>

                              {/* Right: Quick Attach Button */}
                              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs">
                                <input
                                  type="file"
                                  className="hidden"
                                  disabled={isUploadingThis}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUploadFileForReferral(referral, file);
                                      if (!isDocsExpanded) setExpandedDocReferralId(referral.id);
                                    }
                                    e.target.value = '';
                                  }}
                                />
                                {isUploadingThis ? (
                                  <>
                                    <RefreshCw size={11} className="animate-spin text-[#CCFF00]" />
                                    <span>Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud size={11} className="text-[#CCFF00]" />
                                    <span>+ Attach File</span>
                                  </>
                                )}
                              </label>
                            </div>

                            {/* Expandable Vault Drawer */}
                            <AnimatePresence>
                              {isDocsExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden mt-3 pt-3 border-t border-dashed border-gray-200 space-y-3"
                                >
                                  {/* Folder Info Strip */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Folder size={12} />
                                      </div>
                                      <div className="truncate">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Google Drive Destination</span>
                                        <span className="text-gray-800 font-mono text-[11px] font-semibold truncate block">
                                          AGX Client Vault / {referral.clientName} {referral.company ? `- ${referral.company}` : ''}
                                        </span>
                                      </div>
                                    </div>

                                    {referral.driveFolderUrl && (
                                      <a
                                        href={referral.driveFolderUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-white hover:bg-gray-100 border border-gray-200 text-gray-900 text-[11px] font-bold shrink-0 transition-colors cursor-pointer"
                                      >
                                        <span>View Drive Folder</span>
                                        <ExternalLink size={10} />
                                      </a>
                                    )}
                                  </div>

                                  {/* Drag and Drop Zone */}
                                  <div
                                    onDragOver={(e) => { e.preventDefault(); setDragActiveReferralId(referral.id); }}
                                    onDragLeave={(e) => { e.preventDefault(); setDragActiveReferralId(null); }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      setDragActiveReferralId(null);
                                      const files = Array.from(e.dataTransfer.files || []);
                                      if (files.length > 0) {
                                        files.forEach(f => handleUploadFileForReferral(referral, f));
                                      }
                                    }}
                                    className={`relative p-4 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-1.5 ${
                                      isDraggingThis
                                        ? 'border-[#CCFF00] bg-black/5 scale-[0.99]'
                                        : 'border-gray-200 hover:border-gray-400 bg-white'
                                    }`}
                                  >
                                    <input
                                      type="file"
                                      id={`dropzone-${referral.id}`}
                                      className="hidden"
                                      disabled={isUploadingThis}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadFileForReferral(referral, file);
                                        e.target.value = '';
                                      }}
                                    />
                                    <label htmlFor={`dropzone-${referral.id}`} className="cursor-pointer flex flex-col items-center">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 hover:bg-[#CCFF00]/20 text-gray-700 hover:text-black flex items-center justify-center transition-colors mb-1">
                                        <UploadCloud size={16} />
                                      </div>
                                      <span className="text-xs font-bold text-gray-900">
                                        {isUploadingThis ? 'Streaming file to Google Drive...' : 'Drop files here, or click to browse'}
                                      </span>
                                      <span className="text-[10px] text-gray-400 mt-0.5">
                                        PDF, DOCX, PNG, JPG, XLSX, ZIP up to 25MB • Stored in your Google Drive Vault
                                      </span>
                                    </label>
                                  </div>

                                  {/* Uploaded Documents List */}
                                  {attachedDocs.length > 0 ? (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block px-1">
                                        Attached Documents ({attachedDocs.length})
                                      </span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {attachedDocs.map((doc) => {
                                          const isPdf = doc.title.toLowerCase().endsWith('.pdf');
                                          const isImg = /\.(png|jpe?g|webp|gif|svg)$/i.test(doc.title);
                                          const isDoc = /\.(docx?|txt|md)$/i.test(doc.title);
                                          const isSheet = /\.(xlsx?|csv)$/i.test(doc.title);

                                          return (
                                            <div
                                              key={doc.id}
                                              className="p-2.5 rounded-xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-300 transition-all flex items-center justify-between gap-2 text-xs shadow-2xs"
                                            >
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-[10px] ${
                                                  isPdf ? 'bg-rose-500' : isImg ? 'bg-violet-500' : isSheet ? 'bg-emerald-600' : isDoc ? 'bg-blue-600' : 'bg-gray-800'
                                                }`}>
                                                  {isPdf ? 'PDF' : isImg ? 'IMG' : isSheet ? 'XLS' : isDoc ? 'DOC' : 'FILE'}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-bold text-gray-900 truncate text-[11px]" title={doc.title}>
                                                    {doc.title}
                                                  </p>
                                                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                    <span>{doc.fileSize || 'Attached'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                  </div>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1 shrink-0">
                                                <a
                                                  href={doc.fileUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="p-1.5 rounded-lg bg-white hover:bg-black hover:text-[#CCFF00] border border-gray-200 text-gray-700 transition-colors"
                                                  title="Open in Google Drive"
                                                >
                                                  <ExternalLink size={12} />
                                                </a>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-2 text-gray-400 text-xs">
                                      No documents attached yet for this referral.
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: PAYOUT VAULT & LEDGER                           */}
            {/* ======================================================== */}
            {activeTab === 'payouts' && (
              <div className="space-y-6">
                {/* Hero Vault Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Available Balance Box (8 cols) */}
                  <div className="lg:col-span-8 bg-gradient-to-br from-[#0C0F17] via-[#090C12] to-[#06080D] text-white rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute right-[-20px] top-[-20px] w-64 h-64 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
                          <span className="text-xs font-mono font-bold text-[#CCFF00] uppercase tracking-wider">
                            Available Payout Vault
                          </span>
                        </div>
                        <span className="text-xs text-white/50">Settlement Currency: INR (₹)</span>
                      </div>

                      <span className="text-xs uppercase font-bold text-white/40 tracking-wider block">Ready for Immediate Withdrawal</span>
                      <div className="text-3xl sm:text-5xl font-black text-[#CCFF00] tracking-tight tabular-nums mt-1 font-['Outfit']">
                        ₹{availablePendingPayout.toLocaleString('en-IN')}
                      </div>

                      <p className="text-xs text-white/60 mt-3 max-w-lg leading-relaxed">
                        Funds settle directly via <strong className="text-white">{partner.payoutMethod || 'UPI'}</strong> to your registered coordinates. Minimum withdrawal threshold is ₹1,000 INR.
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col text-xs">
                          <span className="text-white/40">Registered Method:</span>
                          <span className="text-white font-bold">{partner.payoutMethod || 'UPI'}</span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/10" />
                        <div className="flex flex-col text-xs">
                          <span className="text-white/40">Auto-Payout Threshold:</span>
                          <span className="text-white font-mono font-bold">₹{(partner.payoutDetails?.autoPayoutThreshold || 1000).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsPayoutModalOpen(true)}
                        disabled={availablePendingPayout < 1000}
                        className="px-6 py-2.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-30 disabled:hover:bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#CCFF00]/15 disabled:cursor-not-allowed btn-press"
                      >
                        Request Withdrawal
                      </button>
                    </div>
                  </div>

                  {/* Coordinates Summary Card (4 cols) */}
                  <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                        <h4 className="font-extrabold text-sm text-gray-900">Payout Coordinates</h4>
                        <button
                          onClick={() => setActiveTab('settings')}
                          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Primary Method</span>
                          <span className="font-extrabold text-gray-900 text-sm">{partner.payoutMethod || 'UPI'}</span>
                        </div>

                        {partner.payoutDetails?.upiId && (
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">UPI ID</span>
                            <span className="font-mono font-bold text-gray-900">{partner.payoutDetails.upiId}</span>
                          </div>
                        )}

                        {partner.payoutDetails?.accountNumber && (
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Bank Account</span>
                            <span className="font-mono font-bold text-gray-900">
                              {partner.payoutDetails.bankName || 'Bank'} · Ending in {partner.payoutDetails.accountNumber.slice(-4)}
                            </span>
                          </div>
                        )}

                        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                          <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">PAN / Tax ID</span>
                          <span className="font-mono font-semibold text-gray-700">
                            {partner.payoutDetails?.panTaxId || 'Not registered'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                      Instant settlements process upon client invoice clearance.
                    </p>
                  </div>
                </div>

                {/* Historical Payout Ledger */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">Payout History & Ledger</h4>
                      <p className="text-xs text-gray-400">All historical withdrawals, settlements, and bank disbursements.</p>
                    </div>
                  </div>

                  {myPayouts.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      No payout requests on record yet. Once your client deals hit cleared milestones, withdraw anytime.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                            <th className="pb-3">Reference / ID</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Method</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {myPayouts.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="py-3 font-mono font-bold text-gray-900">{p.id.slice(0, 10)}</td>
                              <td className="py-3 text-gray-500">{new Date(p.payoutDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td className="py-3 font-mono font-black text-gray-900">₹{p.amount.toLocaleString('en-IN')}</td>
                              <td className="py-3 text-gray-700 font-medium">{p.paymentMethod}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : p.status === 'Failed'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3 text-right text-gray-500">{p.notes || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: PARTNER GROWTH TOOLKIT                          */}
            {/* ======================================================== */}
            {activeTab === 'toolkit' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                  <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">Partner Growth & Enablement Toolkit</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                    Everything you need to introduce clients with confidence: battlecards, pre-written pitch messages, and tracking assets.
                  </p>
                </div>

                {/* 3 High-Converting Pitch Scripts */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h4 className="font-extrabold text-base text-gray-900">Ready-to-Send Outreach Scripts</h4>
                      <p className="text-xs text-gray-400">Tested message templates customized with your tracking link.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: 'agency',
                        title: 'For Marketing Agencies & Consultants',
                        target: 'Upselling Existing Retainer Clients',
                        text: `Hey [Client Name], we handle your brand/growth, but noticed a lot of manual bottlenecks in your internal operations. We've partnered with an elite engineering group (AGX) who builds custom autonomous AI workflows and support bots in under 14 days. Want me to connect you with their team for a free architecture review?`
                      },
                      {
                        id: 'ops',
                        title: 'For Operations Heads & Founders',
                        target: 'Growing Businesses & COOs',
                        text: `Hi [Name], saw your team has been scaling fast. Are you guys currently automating your customer support and lead qualification workflows? My partners at AGX replace repetitive manual desk work with autonomous agents backed by a 30-day performance guarantee. Check them out here: ${referralUrl}`
                      },
                      {
                        id: 'quick',
                        title: 'WhatsApp / DM Quick Ping',
                        target: 'Informal WhatsApp / Slack Intro',
                        text: `Hey [Name]! Quick question—have you explored deploying custom AI agents for your back-office workflows yet? AGX built out full end-to-end automations for us in 2 weeks. Here's their partner link if you want to book a 15-min discovery audit: ${referralUrl}`
                      }
                    ].map(pitch => (
                      <div
                        key={pitch.id}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between gap-3 hover:border-gray-200 transition-colors"
                      >
                        <div>
                          <span className="text-xs font-extrabold text-gray-900 block mb-1">{pitch.title}</span>
                          <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block mb-2">
                            {pitch.target}
                          </span>
                          <p className="text-[11px] text-gray-700 leading-relaxed italic bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                            "{pitch.text}"
                          </p>
                        </div>

                        <button
                          onClick={() => handleCopyPitch(pitch.id, pitch.text)}
                          className="w-full py-2 rounded-xl bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:bg-gray-800 btn-press"
                        >
                          {copiedPitchId === pitch.id ? (
                            <>
                              <Check size={12} className="text-[#CCFF00]" />
                              <span className="text-[#CCFF00]">Copied Script!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AGX Core Solutions Cheat-Sheet */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                  <h4 className="font-extrabold text-base text-gray-900">What AGX Builds: Services & Budgets Cheat-Sheet</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Blueprint</span>
                      <h5 className="font-extrabold text-gray-900 text-sm">AI Operations Audit</h5>
                      <p className="text-gray-500 text-[11px]">Comprehensive workflow architecture diagnostic for operational bottlenecks.</p>
                      <div className="pt-2 font-mono font-bold text-gray-900 text-xs">₹50,000+</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Autonomous</span>
                      <h5 className="font-extrabold text-gray-900 text-sm">Custom AI Support Agent</h5>
                      <p className="text-gray-500 text-[11px]">Human-like customer support, sales lead qualification, and WhatsApp bots.</p>
                      <div className="pt-2 font-mono font-bold text-gray-900 text-xs">₹1,50,000+</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Pipelines</span>
                      <h5 className="font-extrabold text-gray-900 text-sm">Workflow Automation</h5>
                      <p className="text-gray-500 text-[11px]">Connecting CRM, invoicing, payment gateways, and backend database syncs.</p>
                      <div className="pt-2 font-mono font-bold text-gray-900 text-xs">₹75,000+</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-gray-400">Enterprise</span>
                      <h5 className="font-extrabold text-gray-900 text-sm">Custom Business OS</h5>
                      <p className="text-gray-500 text-[11px]">Full end-to-end bespoke operating system with custom portals and role-based access.</p>
                      <div className="pt-2 font-mono font-bold text-gray-900 text-xs">₹2,50,000+</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: PROFILE & PAYOUT SETTINGS                       */}
            {/* ======================================================== */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Identity Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black text-[#CCFF00] font-black italic flex items-center justify-center text-2xl shadow-md">
                      {editName ? editName.charAt(0).toUpperCase() : partner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{editName || partner.name}</h3>
                      <p className="text-xs text-gray-400">{partner.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-[#CCFF00] font-mono text-[10px] font-bold">
                          {partnerTier.badgeLabel} ({partnerRatePercent}%)
                        </span>
                        <span className="text-xs font-mono text-gray-500">Ref: {partner.referralCode}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSaveProfileAndPayoutSettings} className="space-y-6">
                  {/* Card 1: Contact Coordinates */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <h4 className="font-extrabold text-base text-gray-900">Partner Coordinates</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          placeholder="e.g. Acme Agency"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Phone / WhatsApp</label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">PAN / Tax ID (Optional)</label>
                        <input
                          type="text"
                          value={editPanTaxId}
                          onChange={(e) => setEditPanTaxId(e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Payout Coordinates */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                    <h4 className="font-extrabold text-base text-gray-900">Payout Coordinates (Bank & UPI)</h4>

                    {/* Method Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['UPI', 'Bank Transfer', 'PayPal', 'Wire'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setEditPayoutMethod(method)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            editPayoutMethod === method
                              ? 'bg-black text-[#CCFF00] border-black shadow-sm'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    {/* UPI Fields */}
                    {editPayoutMethod === 'UPI' && (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">UPI ID (VPA) *</label>
                        <input
                          type="text"
                          required
                          value={editUpiId}
                          onChange={(e) => setEditUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-mono font-bold"
                        />
                      </div>
                    )}

                    {/* Bank Transfer Fields */}
                    {editPayoutMethod === 'Bank Transfer' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Bank Name *</label>
                          <input
                            type="text"
                            required
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            placeholder="HDFC Bank"
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Account Holder Name *</label>
                          <input
                            type="text"
                            required
                            value={editAccountName}
                            onChange={(e) => setEditAccountName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Account Number *</label>
                          <input
                            type="text"
                            required
                            value={editAccountNumber}
                            onChange={(e) => setEditAccountNumber(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">IFSC Code *</label>
                          <input
                            type="text"
                            required
                            value={editIfsc}
                            onChange={(e) => setEditIfsc(e.target.value.toUpperCase())}
                            placeholder="HDFC0001234"
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white font-mono font-bold"
                          />
                        </div>
                      </div>
                    )}

                    {/* PayPal Fields */}
                    {editPayoutMethod === 'PayPal' && (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">PayPal Email Address *</label>
                        <input
                          type="email"
                          required
                          value={editPaypalEmail}
                          onChange={(e) => setEditPaypalEmail(e.target.value)}
                          placeholder="billing@yourdomain.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white font-medium"
                        />
                      </div>
                    )}

                    {/* Wire Fields */}
                    {editPayoutMethod === 'Wire' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">SWIFT / BIC Code *</label>
                          <input
                            type="text"
                            required
                            value={editSwiftCode}
                            onChange={(e) => setEditSwiftCode(e.target.value.toUpperCase())}
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">IBAN / Wire Details *</label>
                          <input
                            type="text"
                            required
                            value={editWireDetails}
                            onChange={(e) => setEditWireDetails(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Preferences */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">WhatsApp Payout Notifications</span>
                        <span className="text-[11px] text-gray-400">Receive instant alerts when commission disbursements execute.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editNotifyOnWhatsApp}
                        onChange={(e) => setEditNotifyOnWhatsApp(e.target.checked)}
                        className="w-4 h-4 accent-black cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 rounded-xl bg-black text-white text-xs font-extrabold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2 btn-press"
                    >
                      {isSavingSettings ? (
                        <>
                          <RefreshCw size={14} className="animate-spin text-[#CCFF00]" />
                          <span>Saving Coordinates...</span>
                        </>
                      ) : (
                        <span>Save Coordinates</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Password Update Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                  <h4 className="font-extrabold text-base text-gray-900">Partner Portal Access Password</h4>
                  <p className="text-xs text-gray-500">
                    {hasExistingPassword
                      ? 'Update your portal password to keep your earnings vault secure.'
                      : 'Set a password to log into the Partner Portal directly with your email.'}
                  </p>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {hasExistingPassword && (
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Current Password *</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">New Password *</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white"
                        />
                        {passwordStrength.label && (
                          <div className="mt-1 flex items-center gap-2 text-[10px]">
                            <span className="text-gray-400">Strength:</span>
                            <span className={`font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase text-gray-500 block mb-1">Confirm Password *</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword}
                        className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-bold transition-colors cursor-pointer btn-press"
                      >
                        {isUpdatingPassword ? 'Updating...' : hasExistingPassword ? 'Update Password' : 'Create Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Legal Agreement & Statutory Compliance Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] flex items-center justify-center font-bold">
                        <Scale size={20} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-gray-900">Partner Program Agreement</h4>
                        <p className="text-xs text-gray-500">
                          Governed under the Indian Contract Act (1872), IT Act (2000), and DPDP Act (2023).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border ${
                        partner.termsAccepted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {partner.termsAccepted ? 'Signed & Active (v1.0)' : 'Action Required'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-gray-600 block">
                        {partner.termsAccepted ? (
                          <>Digitally accepted on <strong>{partner.termsAcceptedAt ? new Date(partner.termsAcceptedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Active Session'}</strong></>
                        ) : (
                          <span className="text-amber-700 font-semibold">Please review and sign the agreement to keep your account in good standing.</span>
                        )}
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Covers Principal-to-Principal status, flexible 10%–25% tiers, 40/30/30 milestones, TDS Section 194H, and non-circumvention.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsTermsModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-xs btn-press"
                    >
                      <FileText size={13} />
                      <span>{partner.termsAccepted ? 'View Signed Agreement' : 'Review & Sign Agreement'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SUBMIT CLIENT INTRO                             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-['Outfit']">Submit Client Introduction</h3>
                  <p className="text-xs text-gray-400">Earn {partnerRatePercent}% on every cleared contract milestone.</p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReferral} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      placeholder="e.g. Nexus Media"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="john@nexus.com"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Target Service</label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium cursor-pointer"
                    >
                      <option value="AI Automation Blueprint">AI Automation Blueprint (₹50k+)</option>
                      <option value="Custom Autonomous AI Agent">Custom Autonomous AI Agent (₹1.5L+)</option>
                      <option value="Workflow & Operations Automation">Workflow Automation (₹75k+)</option>
                      <option value="Custom Internal Business OS">Custom Internal Business OS (₹2.5L+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={newDealValue}
                      onChange={(e) => setNewDealValue(e.target.value)}
                      placeholder="75000"
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Real-time Estimated Cut Preview */}
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-semibold">Projected Commission ({partnerRatePercent}%):</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    ₹{Math.round((Number(newDealValue) || 0) * partnerRate).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Introduction Notes / Context</label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Tell our sales team what challenges this business is facing..."
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                  />
                </div>

                {/* File Attachment Dropzone for New Referral */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500 block">
                      Attach Project Documents / Photos (Optional)
                    </label>
                    <span className="text-[10px] text-gray-400">Stores in Google Drive Vault</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                    <label className="flex items-center justify-center gap-2 p-2 rounded-xl bg-white border border-dashed border-gray-300 hover:border-black cursor-pointer text-xs font-semibold text-gray-700 transition-colors">
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            setNewReferralFiles(prev => [...prev, ...files]);
                          }
                          e.target.value = '';
                        }}
                      />
                      <Paperclip size={13} className="text-gray-500" />
                      <span>Choose briefs, specs, photos, or RFPs (up to 25MB)</span>
                    </label>

                    {newReferralFiles.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {newReferralFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={12} className="text-gray-400 shrink-0" />
                              <span className="font-semibold text-gray-800 truncate text-[11px]">{file.name}</span>
                              <span className="text-[10px] text-gray-400 shrink-0">({Math.round(file.size / 1024)} KB)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewReferralFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-rose-600 p-0.5 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin text-[#CCFF00]" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      'Submit Intro'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: REQUEST PAYOUT                                  */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white border border-gray-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900 font-['Outfit']">
                  Request Commission Payout
                </h3>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#0C0F17] text-white flex justify-between items-center shadow-inner">
                <span className="text-xs text-white/70 font-semibold">Available in Vault:</span>
                <span className="text-2xl font-black text-[#CCFF00] font-mono tabular-nums">
                  ₹{availablePendingPayout.toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase text-gray-500">
                      Withdrawal Amount (₹) *
                    </label>
                    <div className="flex items-center gap-1">
                      {[0.5, 1].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPayoutRequestAmount(String(Math.floor(availablePendingPayout * pct)))}
                          className="px-2 py-0.5 rounded text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-mono font-bold cursor-pointer"
                        >
                          {pct === 1 ? '100% (Max)' : `${pct * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="number"
                    max={availablePendingPayout}
                    required
                    value={payoutRequestAmount}
                    onChange={(e) => setPayoutRequestAmount(e.target.value)}
                    placeholder={`Max ₹${availablePendingPayout.toLocaleString('en-IN')}`}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                    Destination Coordinates
                  </label>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 font-medium">
                    {partner.payoutMethod || 'UPI'}{' '}
                    {partner.payoutDetails?.upiId ? `(${partner.payoutDetails.upiId})` : ''}
                    {partner.payoutDetails?.accountNumber ? `(A/C: ${partner.payoutDetails.accountNumber})` : ''}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                    Optional Reference Notes
                  </label>
                  <textarea
                    rows={2}
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="e.g. Milestone settlement withdrawal"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs focus:bg-white focus:outline-none focus:border-black font-medium"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: QR CODE PREVIEW                                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-white border border-gray-200 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="w-full flex justify-end">
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-black text-[#CCFF00] font-black italic flex items-center justify-center text-xl shadow-md">
                A
              </div>

              <div>
                <h3 className="text-lg font-black uppercase text-gray-900 font-['Outfit']">Partner QR Code</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Scan to open your personalized referral landing page.
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 shadow-xs">
                <img
                  src={qrImageUrl}
                  alt="Partner Referral QR Code"
                  className="w-52 h-52 rounded-lg"
                />
              </div>

              <span className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                Code: {partner.referralCode}
              </span>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-black text-white text-xs font-bold transition-colors cursor-pointer hover:bg-gray-800"
              >
                {copiedLink ? 'Link Copied!' : 'Copy Referral URL'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MANDATORY / REVIEW: PARTNER TERMS & LEGAL AGREEMENT MODAL*/}
      {/* ======================================================== */}
      <PartnerTermsModal
        partner={partner}
        isOpen={!partner.termsAccepted || isTermsModalOpen}
        isMandatory={!partner.termsAccepted}
        alreadyAccepted={Boolean(partner.termsAccepted)}
        onAccept={handleAcceptTerms}
        onClose={() => setIsTermsModalOpen(false)}
      />

    </div>
  );
};
