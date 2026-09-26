import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Handshake, Users, IndianRupee, Wallet, ArrowUpRight, Copy, Check,
  Plus, LogOut, ArrowLeft, TrendingUp, Clock, CheckCircle2, AlertCircle,
  ExternalLink, Sparkles, Building, Phone, Mail, FileText, ChevronRight,
  CreditCard, Shield, Download, RefreshCw, QrCode, Share2, Calculator,
  MessageSquare, ChevronDown, CheckCheck, Send, Zap, Award, Sliders,
  ArrowDownRight, Eye, EyeOff, KeyRound, Percent, DollarSign, CheckCircle, User, Lock, Bell, Globe
} from 'lucide-react';
import { Partner, PartnerReferral, PartnerPayout, PartnerPayoutDetails } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { authService } from '../../lib/authService';
import { toast } from '../../lib/toastStore';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { BotAvatar } from 'bot-avatars';
import { MetalBadge } from 'metal-fx';

interface PartnerPortalProps {
  initialPartner?: Partner | null;
  onBackToWebsite: () => void;
  onLogout: () => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  initialPartner,
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

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'referrals' | 'payouts' | 'toolkit' | 'settings'>('referrals');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

  // Payout Request Form State
  const [payoutRequestAmount, setPayoutRequestAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');

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

  // Real-time dynamic password strength meter
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-white/10', text: 'text-white/40' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
    return { score: 4, label: 'Strong', color: 'bg-[#CCFF00]', text: 'text-[#CCFF00]' };
  }, [newPassword]);

  useEffect(() => {
    if (activeSessionPartner) {
      setPartner(activeSessionPartner);
      setEditName(activeSessionPartner.name || '');
      setEditCompany(activeSessionPartner.company || '');
      setEditPhone(activeSessionPartner.phone || '');
      setEditBio(activeSessionPartner.notes || '');
      setEditPanTaxId(activeSessionPartner.payoutDetails?.panTaxId || '');
      setEditPayoutMethod(activeSessionPartner.payoutMethod || 'UPI');
      setEditUpiId(activeSessionPartner.payoutDetails?.upiId || '');
      setEditBankName(activeSessionPartner.payoutDetails?.bankName || '');
      setEditAccountNumber(activeSessionPartner.payoutDetails?.accountNumber || '');
      setEditAccountName(activeSessionPartner.payoutDetails?.accountName || activeSessionPartner.name || '');
      setEditIfsc(activeSessionPartner.payoutDetails?.ifsc || '');
      setEditPaypalEmail(activeSessionPartner.payoutDetails?.paypalEmail || activeSessionPartner.email || '');
      setEditSwiftCode(activeSessionPartner.payoutDetails?.swiftCode || '');
      setEditWireDetails(activeSessionPartner.payoutDetails?.wireDetails || '');
      setEditAutoPayoutThreshold(activeSessionPartner.payoutDetails?.autoPayoutThreshold || 1000);
      setEditNotifyOnWhatsApp(activeSessionPartner.payoutDetails?.notifyOnWhatsApp ?? true);
    }
  }, [activeSessionPartner]);

  // Interactive Commission Simulator State
  const [simDealValue, setSimDealValue] = useState<number>(150000);

  // Referral link
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${encodeURIComponent(partner.referralCode)}`
    : `https://agxperience.com/?ref=${partner.referralCode}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    referralUrl
  )}&color=07090e&bgcolor=ffffff&format=svg`;

  // Partner commission rate (standardized float, e.g. 0.15)
  const partnerRate = useMemo(() => {
    const rawRate = partner.commissionRate || 0.10;
    return rawRate >= 1 ? rawRate / 100 : rawRate;
  }, [partner.commissionRate]);

  const partnerRatePercent = Math.round(partnerRate * 100);

  // Filter referrals specifically for this partner & reconcile with store.leads
  const myReferrals = useMemo(() => {
    const directReferrals = store.partnerReferrals.filter(r => r.partnerId === partner.id);
    const existingLeadIds = new Set(directReferrals.map(r => r.leadId).filter(Boolean));
    const existingEmails = new Set(directReferrals.map(r => r.clientEmail?.toLowerCase()).filter(Boolean));

    // Discover any leads attributed to this partner in the CRM that do not have an explicit referral record yet
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
      projectType: l.interestedService || 'AI Automation',
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

  // Calculations
  const totalReferredClients = myReferrals.length;
  const wonDealsCount = myReferrals.filter(
    r => r.dealStatus === 'WON' || r.dealStatus === 'IN PROGRESS' || r.dealStatus === 'COMPLETED'
  ).length;
  const winRate = totalReferredClients > 0 ? Math.round((wonDealsCount / totalReferredClients) * 100) : 0;

  const totalPipelineValue = myReferrals.reduce((acc, r) => acc + (r.dealValue || 0), 0);
  const totalClientPaymentsReceived = myReferrals.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const totalPendingClientPayments = myReferrals.reduce((acc, r) => acc + (r.pendingPayment || 0), 0);
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
      await store.addPartnerLeadReferral(partner, {
        clientName: newClientName.trim(),
        company: newClientCompany.trim() || newClientName.trim(),
        clientEmail: newClientEmail.trim() || undefined,
        clientPhone: newClientPhone.trim() || undefined,
        projectType: newProjectType,
        dealValue: val,
        notes: newNotes.trim() || undefined
      });

      setIsSubmitModalOpen(false);

      // Reset form
      setNewClientName('');
      setNewClientCompany('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewNotes('');
      setNewDealValue('75000');
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
      `₹${reqAmt.toLocaleString('en-IN')} requested. Our finance team will disburse via ${partner.payoutMethod}.`
    );
    setIsPayoutModalOpen(false);
    setPayoutRequestAmount('');
    setPayoutNotes('');
  };

  // Save Partner Profile & Payout Coordinates
  const handleSaveProfileAndPayoutSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    // 1. Validate Name
    if (!editName.trim() || editName.trim().length < 2) {
      errors.name = 'Please provide a valid full name (min 2 characters).';
    }

    // 2. Validate Phone (optional but if provided, validate)
    if (editPhone.trim() && !/^[+0-9\s-]{7,18}$/.test(editPhone.trim())) {
      errors.phone = 'Please provide a valid phone or WhatsApp number.';
    }

    // 3. Validate Payout method specific requirements
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
      toast.success('Partner Profile Saved! ✨', 'Your contact and payout coordinates have been updated.');
    } catch (err: any) {
      console.error('Error updating partner profile:', err);
      toast.error('Save Failed', 'Unable to update coordinates. Please retry.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Partner Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent) {
      setPasswordError('Please enter your current password.');
      toast.error('Validation Warning', 'Current password is required.');
      return;
    }
    if (!trimmedNew) {
      setPasswordError('Please enter a new password.');
      toast.error('Validation Warning', 'New password is required.');
      return;
    }
    if (trimmedNew.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      toast.error('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (trimmedNew === trimmedCurrent) {
      setPasswordError('New password must be different from your current password.');
      toast.error('Invalid Password', 'New password must differ from current.');
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setPasswordError('New password confirmation does not match. Please verify.');
      toast.error('Mismatch', 'New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.updatePartnerPassword(
        partner.id,
        partner.email,
        trimmedCurrent,
        trimmedNew
      );

      if (res.error) {
        setPasswordError(res.error.message);
        toast.error('Update Failed', res.error.message);
      } else {
        setPasswordSuccess('Password successfully updated! Your credentials have been refreshed.');
        toast.success('Password Updated 🔐', 'Your partner login password has been successfully updated.');
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

  // Filtered referrals list for display
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

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col relative antialiased selection:bg-[#CCFF00] selection:text-black">
      {/* Background Decorative Ambient Flares */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[350px] bg-[#CCFF00]/5 rounded-full blur-[170px] pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-[550px] h-[550px] bg-emerald-600/5 rounded-full blur-[190px] pointer-events-none" />

      {/* Top Glass Navigation Bar */}
      <header className="w-full bg-[#0C0F17]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onBackToWebsite}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Agency Site</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-white font-['Outfit']">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-[10px] font-bold uppercase tracking-wider">
                <Handshake size={11} />
                <span>Partner Portal</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-white leading-tight">{partner.name}</span>
              <span className="text-[10px] text-white/40">{partner.company || partner.email}</span>
            </div>

            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#CCFF00]/20 to-emerald-400/20 border border-[#CCFF00]/40 flex items-center justify-center font-bold text-xs text-[#CCFF00]">
                {partner.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0C0F17]" />
            </div>

            <button
              onClick={handleLogoutPartner}
              title="Sign Out Partner Session"
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-red-500/15 text-white/40 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 z-10">
        
        {/* EXECUTIVE BENTO HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Welcome & Quick Referral Card (Col 8) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F1422] via-[#0B0E17] to-[#07090E] border border-white/[0.1] relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top ambient highlight */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#CCFF00]/[0.04] rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <MetalBadge>{`${partnerRatePercent}% Verified Partner Tier`}</MetalBadge>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle size={10} /> Active Contract
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white font-['Outfit']">
                Welcome, {partner.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 max-w-xl leading-relaxed font-light">
                Introduce businesses to AGX autonomous systems. Track deal milestones live, celebrate milestone collections, and withdraw your commission immediately upon invoice clearance.
              </p>
            </div>

            {/* Quick Link & Code Action Strip */}
            <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Referral Code Badge */}
                <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 font-semibold">Your Referral Code</span>
                    <span className="text-sm font-bold text-[#CCFF00] tracking-wider font-mono">{partner.referralCode}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy Tracking Link"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                {/* Show QR Code Button */}
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="p-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                  title="Show Referral QR Code"
                >
                  <QrCode size={16} />
                </button>
              </div>

              {/* Submit Client CTA */}
              <BorderBeam size="sm" colorVariant="ocean" style={{ display: 'inline-block' }}>
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-wider transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#CCFF00]/15"
                >
                  <Plus size={16} />
                  <span>Submit Client Intro</span>
                </button>
              </BorderBeam>
            </div>
          </div>

          {/* Luminous Payout Vault Card (Col 4) */}
          <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#13192B] via-[#0E1321] to-[#0A0D17] border border-[#CCFF00]/25 relative overflow-hidden flex flex-col justify-between shadow-2xl group">
            {/* Luminous Glow Accent */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between text-[#CCFF00]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Available Payout Vault</span>
                </div>
                <Wallet size={16} className="text-[#CCFF00]" />
              </div>

              <div className="mt-4">
                <span className="text-[10px] uppercase font-bold text-white/40 block tracking-wider">Ready for Withdrawal</span>
                <div className="text-3xl sm:text-4xl font-black text-[#CCFF00] tracking-tight tabular-nums mt-0.5 font-['Outfit']">
                  ₹{availablePendingPayout.toLocaleString('en-IN')}
                </div>
              </div>

              <p className="text-[11px] text-white/50 mt-2 font-light leading-relaxed">
                Settles immediately via <strong className="text-white font-medium">{partner.payoutMethod || 'UPI'}</strong> to your registered coordinates.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex flex-col text-[10px]">
                <span className="text-white/40">Min. Threshold</span>
                <span className="text-white font-mono font-semibold">₹1,000 INR</span>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={availablePendingPayout < 1000}
                className="px-4 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-30 disabled:hover:bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#CCFF00]/10 disabled:cursor-not-allowed"
              >
                Request Payout
              </button>
            </div>
          </div>
        </section>

        {/* 4 HIGH-CONTRAST METRICS PILLARS */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Clients & Win Rate */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Introductions</span>
              <Users size={14} className="text-blue-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums font-['Outfit']">
                {totalReferredClients}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/50">
                <span className="text-emerald-400 font-semibold">{winRate}% conversion</span>
                <span>• {wonDealsCount} won</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Contract Pipeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Deal Pipeline</span>
              <TrendingUp size={14} className="text-purple-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums font-['Outfit']">
                ₹{totalPipelineValue.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-white/50 mt-1">
                Potential Cut: <span className="text-purple-300 font-semibold">₹{Math.round(totalPipelineValue * partnerRate).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Client Payments Collected */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Client Collections</span>
              <CreditCard size={14} className="text-emerald-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums font-['Outfit']">
                ₹{totalClientPaymentsReceived.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-white/50 mt-1">
                Pending: ₹{totalPendingClientPayments.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Card 4: Lifetime Commission Earned */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-[10px] font-bold uppercase tracking-wider">
              <span>Lifetime Earnings</span>
              <IndianRupee size={14} className="text-amber-400" />
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black text-white tabular-nums font-['Outfit']">
                ₹{totalCommissionEarned.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-white/50 mt-1">
                Paid: ₹{totalCommissionPaidOut.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE NAVIGATION TABS */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'referrals', label: 'Referred Clients & Deals', badge: myReferrals.length, icon: Users },
              { id: 'payouts', label: 'Payout Vault & Ledger', badge: myPayouts.length, icon: Wallet },
              { id: 'toolkit', label: 'Partner Growth Toolkit', badge: 'Tools', icon: Sparkles },
              { id: 'settings', label: 'Profile & Payout Settings', badge: null, icon: CreditCard }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-black shadow-lg font-black'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-black' : 'text-white/60'} />
                  <span>{tab.label}</span>
                  {tab.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive ? 'bg-black/10 text-black' : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab-specific Search & Quick Filters */}
          {activeTab === 'referrals' && (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client or company..."
                  className="w-48 sm:w-56 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                />
              </div>

              <div className="flex items-center p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10px] font-bold">
                {(['ALL', 'NEW', 'WON', 'COMPLETED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === f
                        ? 'bg-white/20 text-white font-bold'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* TAB 1: REFERRED CLIENTS & MILESTONE TRACKING */}
        {activeTab === 'referrals' && (
          <div className="space-y-4">
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] flex flex-col items-center justify-center">
                <div className="mb-4">
                  <BotAvatar type="star" size={88} state="default" aria-label="Partner Assistant Mascot" />
                </div>
                <h3 className="text-lg font-bold text-white">No Referred Clients Found</h3>
                <p className="text-xs text-white/50 mt-1 max-w-md mx-auto leading-relaxed font-light">
                  Introduce your first client or share your personalized referral link. When they contract with AGX, you earn {partnerRatePercent}% on every milestone payment collected.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-[#b8e600] transition-colors"
                  >
                    Submit Client Intro
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Copy Referral Link
                  </button>
                </div>
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

                  // Milestone stages: Stage 1 (Advance 40%), Stage 2 (Delivery 30%), Stage 3 (Handover 30%)
                  const stage1Cleared = percentPaid >= 35;
                  const stage2Cleared = percentPaid >= 65;
                  const stage3Cleared = isFullySettled;

                  return (
                    <div
                      key={referral.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#0C101A] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col gap-4 shadow-xl"
                    >
                      {/* Top Row: Client Info + Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-lg font-bold text-white tracking-tight">{referral.clientName}</h3>
                            {referral.company && (
                              <span className="text-xs text-white/50 font-medium">@{referral.company}</span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 font-semibold text-[10px]">
                              {referral.projectType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                            <span>Referred {new Date(referral.createdAt).toLocaleDateString()}</span>
                            {referral.clientPhone && <span>• {referral.clientPhone}</span>}
                            {referral.clientEmail && <span>• {referral.clientEmail}</span>}
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              referral.dealStatus === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : referral.dealStatus === 'WON' || referral.dealStatus === 'IN PROGRESS'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            Deal: {referral.dealStatus}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isFullySettled
                                ? 'bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-black'
                                : percentPaid > 0
                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            {isFullySettled ? '100% Fully Settled ✓' : `${percentPaid}% Paid`}
                          </span>
                        </div>
                      </div>

                      {/* 3-STAGE MILESTONE VISUALIZER */}
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.05] space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/60 font-medium">Milestone Release Progress</span>
                          <span className="font-mono text-white text-[11px]">
                            ₹{referral.totalPaid.toLocaleString('en-IN')} of ₹{referral.dealValue.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                          {/* Stage 1 */}
                          <div
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                              stage1Cleared
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-white/[0.02] border-white/10 text-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold">
                              {stage1Cleared ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} />}
                              <span>Milestone 1</span>
                            </div>
                            <span className="text-[9px]">Kickoff Advance (40%)</span>
                          </div>

                          {/* Stage 2 */}
                          <div
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                              stage2Cleared
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-white/[0.02] border-white/10 text-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold">
                              {stage2Cleared ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Clock size={12} />}
                              <span>Milestone 2</span>
                            </div>
                            <span className="text-[9px]">UAT Demo (30%)</span>
                          </div>

                          {/* Stage 3 */}
                          <div
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                              stage3Cleared
                                ? 'bg-[#CCFF00]/10 border-[#CCFF00]/30 text-[#CCFF00]'
                                : 'bg-white/[0.02] border-white/10 text-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-bold">
                              {stage3Cleared ? <CheckCircle2 size={12} className="text-[#CCFF00]" /> : <Clock size={12} />}
                              <span>Milestone 3</span>
                            </div>
                            <span className="text-[9px]">Handover & Final (30%)</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Audit Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs">
                        <div>
                          <span className="text-[10px] text-white/40 block font-medium">Contract Value</span>
                          <span className="text-white font-bold font-mono">₹{referral.dealValue.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block font-medium">Commission Rate</span>
                          <span className="text-white font-bold">{partnerRatePercent}% Tier</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block font-medium">Earned Cut (Ready)</span>
                          <span className="text-[#CCFF00] font-black font-mono">₹{earnedCut.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-white/40 block font-medium">Max Potential Cut</span>
                          <span className="text-white/80 font-bold font-mono">₹{fullPotentialCut.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Quick Contact Actions if client contact info exists */}
                      {(referral.clientPhone || referral.clientEmail) && (
                        <div className="flex items-center gap-2 pt-1">
                          {referral.clientPhone && (
                            <a
                              href={`https://wa.me/${referral.clientPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare size={12} /> WhatsApp Client
                            </a>
                          )}
                          {referral.clientEmail && (
                            <a
                              href={`mailto:${referral.clientEmail}`}
                              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Mail size={12} /> Email Client
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PAYOUT VAULT & LEDGER */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Payout Status Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">Commission Disbursements</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Payments are processed directly to your registered {partner.payoutMethod || 'UPI'} coordinates within 24 business hours.
                </p>
              </div>

              <button
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={availablePendingPayout < 1000}
                className="px-5 py-2.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-30 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#CCFF00]/15"
              >
                Request Withdrawal
              </button>
            </div>

            {/* Table */}
            <div className="rounded-3xl bg-[#0C101A] border border-white/[0.08] overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-white/40 uppercase tracking-wider text-[10px] font-bold bg-white/[0.01]">
                      <th className="py-3.5 px-5">Date</th>
                      <th className="py-3.5 px-5">Disbursed Amount</th>
                      <th className="py-3.5 px-5">Method</th>
                      <th className="py-3.5 px-5">Reference / UTR</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {myPayouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center text-white/40 text-xs">
                          No commission payouts logged yet. When your referred clients make milestone payments, your available balance unlocks for withdrawal.
                        </td>
                      </tr>
                    ) : (
                      myPayouts.map(p => (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-5 text-white/80 font-mono">{p.payoutDate}</td>
                          <td className="py-4 px-5 text-[#CCFF00] font-black font-mono text-sm">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-5 text-white/70 font-medium">{p.paymentMethod}</td>
                          <td className="py-4 px-5 text-white/50 font-mono text-[11px]">{p.transactionRef || 'Processing'}</td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                p.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-white/50 text-[11px] max-w-xs truncate">{p.notes || '—'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARTNER GROWTH TOOLKIT */}
        {activeTab === 'toolkit' && (
          <div className="space-y-6">
            {/* Top Row: Commission Calculator & QR Code */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Deal & Commission Simulator (Col 7) */}
              <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/[0.08] space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                      <Calculator size={16} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">Commission Simulator</h3>
                      <span className="text-[11px] text-white/40">Calculate your estimated earnings based on client contract size</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] font-black text-xs font-mono">
                    {partnerRatePercent}% Tier
                  </span>
                </div>

                {/* Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60 font-medium">Estimated Client Budget</span>
                    <span className="text-lg font-black text-white font-mono">
                      ₹{simDealValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={1000000}
                    step={25000}
                    value={simDealValue}
                    onChange={(e) => setSimDealValue(Number(e.target.value))}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 font-mono">
                    <span>₹25,000</span>
                    <span>₹5,00,000</span>
                    <span>₹10,00,000+</span>
                  </div>
                </div>

                {/* Projected Result Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#CCFF00]/10 via-[#CCFF00]/5 to-transparent border border-[#CCFF00]/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Your Take-Home Cut</span>
                    <div className="text-2xl sm:text-3xl font-black text-[#CCFF00] font-mono tracking-tight">
                      ₹{Math.round(simDealValue * partnerRate).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewDealValue(String(simDealValue));
                      setIsSubmitModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-black uppercase tracking-wider hover:bg-[#b8e600] transition-colors cursor-pointer"
                  >
                    Submit Deal
                  </button>
                </div>
              </div>

              {/* QR Code & Direct Link Card (Col 5) */}
              <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0C101A] border border-white/[0.08] flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <QrCode size={16} />
                    </div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">Your Instant Referral Link</h3>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed font-light mb-4">
                    Any prospect who clicks this link or scans the code receives a 60-day tracking cookie mapping any discovery call directly to your account.
                  </p>

                  <div className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[#CCFF00] truncate font-mono text-[11px]">{referralUrl}</span>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] shrink-0 cursor-pointer"
                    >
                      {copiedLink ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs text-white/50">Need a printable QR code?</span>
                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-xs text-[#CCFF00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} /> View QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* High-Converting Outreach Pitch Templates */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/[0.08] space-y-5 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">Client Outreach & Intro Scripts</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Tested messages for marketing agencies, consultants, and tech founders introducing AGX services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'agency',
                    title: 'For Agencies (Upsell Strategy)',
                    target: 'Existing Retainer Clients',
                    text: `Hey [Client Name], we handle your brand/growth, but noticed a lot of manual bottlenecks in your internal operations. We’ve partnered with an elite engineering group (AGX) who builds custom autonomous AI workflows and support bots in under 14 days. Want me to connect you with their team for a free architecture review?`
                  },
                  {
                    id: 'ops',
                    title: 'For Operations & Founders',
                    target: 'Founders / COOs',
                    text: `Hi [Name], saw your team has been scaling fast. Are you guys currently automating your customer support and lead qualification workflows? My partners at AGX replace repetitive manual desk work with autonomous agents backed by a 30-day performance guarantee. Check them out here: ${referralUrl}`
                  },
                  {
                    id: 'quick',
                    title: 'WhatsApp Quick Ping',
                    target: 'Informal WhatsApp Intro',
                    text: `Hey [Name]! Quick question—have you explored deploying custom AI agents for your back-office workflows yet? AGX built out full end-to-end automations for us in 2 weeks. Here’s their partner link if you want to book a 15-min discovery audit: ${referralUrl}`
                  }
                ].map(pitch => (
                  <div
                    key={pitch.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{pitch.title}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block mb-2">
                        {pitch.target}
                      </span>
                      <p className="text-[11px] text-white/70 leading-relaxed italic bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                        "{pitch.text}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyPitch(pitch.id, pitch.text)}
                      className="w-full py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedPitchId === pitch.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied to Clipboard!</span>
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
          </div>
        )}

        {/* TAB 4: PARTNER PROFILE & PAYOUT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            {/* Header Banner with Partner Identity Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0E1321] via-[#0C101A] to-[#080B12] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#CCFF00]/20 to-emerald-400/20 border-2 border-[#CCFF00]/40 flex items-center justify-center font-black text-xl text-[#CCFF00] font-['Outfit'] shadow-lg">
                    {editName ? editName.charAt(0).toUpperCase() : partner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0C101A] flex items-center justify-center">
                    <Check size={9} className="text-black stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                      {editName || partner.name}
                    </h2>
                    <MetalBadge>{`${partnerRatePercent}% Commission Tier`}</MetalBadge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mt-1 flex-wrap">
                    <span>Code: <strong className="text-[#CCFF00] font-mono">{partner.referralCode}</strong></span>
                    <span>•</span>
                    <span>{editCompany || partner.company || 'Independent Partner'}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{partner.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.06]">
                <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Account ID</span>
                <span className="text-xs font-mono text-white/70">{partner.id.slice(0, 14)}...</span>
              </div>
            </div>

            <form onSubmit={handleSaveProfileAndPayoutSettings} className="space-y-6">
              {/* SECTION 1: Personal & Business Identity */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/[0.08] shadow-xl space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">Partner Identity & Contact</h3>
                    <p className="text-[11px] text-white/50">Your profile details for deal attribution and AGX notifications</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => {
                          setEditName(e.target.value);
                          if (formValidationErrors.name) {
                            setFormValidationErrors(prev => ({ ...prev, name: '' }));
                          }
                        }}
                        placeholder="e.g. Abhinav Sharma"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors ${
                          formValidationErrors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                        }`}
                      />
                    </div>
                    {formValidationErrors.name && (
                      <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.name}</span>
                    )}
                  </div>

                  {/* Agency / Company */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Agency / Business Name
                    </label>
                    <div className="relative">
                      <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        value={editCompany}
                        onChange={(e) => setEditCompany(e.target.value)}
                        placeholder="e.g. Apex Media Labs"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Phone / WhatsApp Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => {
                          setEditPhone(e.target.value);
                          if (formValidationErrors.phone) {
                            setFormValidationErrors(prev => ({ ...prev, phone: '' }));
                          }
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors font-mono ${
                          formValidationErrors.phone ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Used by AGX ops to send instant WhatsApp notifications for closed deals.
                    </span>
                    {formValidationErrors.phone && (
                      <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.phone}</span>
                    )}
                  </div>

                  {/* Registered Email (Locked) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                        Primary Account Email
                      </label>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-white/10 text-white/60 font-semibold flex items-center gap-1">
                        <Lock size={9} /> Verified Auth
                      </span>
                    </div>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="email"
                        disabled
                        value={partner.email}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-white/50 text-xs cursor-not-allowed font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Contact support to transfer ownership or change auth email.
                    </span>
                  </div>
                </div>

                {/* Additional Info: Specialization & PAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Agency Specialization / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="e.g. Design Studio & Fractional CTO for venture-backed fintechs..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      PAN / Tax / GST Identification (Optional)
                    </label>
                    <input
                      type="text"
                      value={editPanTaxId}
                      onChange={(e) => setEditPanTaxId(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F or GSTIN"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors font-mono"
                    />
                    <span className="text-[10px] text-white/40 mt-1 block">
                      Enables automated generation of tax compliance payout vouchers.
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Payout Coordinates (Multi-Rail) */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/[0.08] shadow-xl space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">Payout Disbursement Coordinates</h3>
                    <p className="text-[11px] text-white/50">Select your preferred payout rail and provide withdrawal coordinates</p>
                  </div>
                </div>

                {/* Rail Selector */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-2">
                    Disbursement Rail *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'UPI', label: 'UPI / VPA', sub: 'Instant (INR)', icon: Zap },
                      { id: 'Bank Transfer', label: 'Bank Transfer', sub: 'NEFT / IMPS', icon: Building },
                      { id: 'PayPal', label: 'PayPal', sub: 'Global USD/EUR', icon: Globe },
                      { id: 'Wire', label: 'SWIFT / Wire', sub: 'International', icon: Shield }
                    ].map(rail => {
                      const isSelected = editPayoutMethod === rail.id;
                      const RailIcon = rail.icon;
                      return (
                        <button
                          key={rail.id}
                          type="button"
                          onClick={() => {
                            setEditPayoutMethod(rail.id as any);
                            setFormValidationErrors({});
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#CCFF00] text-black border-[#CCFF00] shadow-md shadow-[#CCFF00]/15'
                              : 'bg-white/[0.02] text-white/70 border-white/10 hover:bg-white/[0.05] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <RailIcon size={16} className={isSelected ? 'text-black' : 'text-[#CCFF00]'} />
                            {isSelected && <Check size={14} className="text-black stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-black block tracking-tight">{rail.label}</span>
                            <span className={`text-[10px] block ${isSelected ? 'text-black/70' : 'text-white/40'}`}>
                              {rail.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conditional Payout Form Fields */}
                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-4">
                  {/* Rail 1: UPI */}
                  {editPayoutMethod === 'UPI' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/70">
                          UPI ID (Virtual Payment Address) *
                        </label>
                        <span className="text-[10px] text-[#CCFF00] font-mono">Google Pay / PhonePe / Paytm</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={editUpiId}
                        onChange={(e) => {
                          setEditUpiId(e.target.value);
                          if (formValidationErrors.upiId) setFormValidationErrors(prev => ({ ...prev, upiId: '' }));
                        }}
                        placeholder="e.g. abhinav@okhdfcbank or 9876543210@paytm"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors font-mono ${
                          formValidationErrors.upiId ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                        }`}
                      />
                      {formValidationErrors.upiId && (
                        <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.upiId}</span>
                      )}
                    </div>
                  )}

                  {/* Rail 2: Bank Transfer (Domestic) */}
                  {editPayoutMethod === 'Bank Transfer' && (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={editBankName}
                            onChange={(e) => {
                              setEditBankName(e.target.value);
                              if (formValidationErrors.bankName) setFormValidationErrors(prev => ({ ...prev, bankName: '' }));
                            }}
                            placeholder="e.g. HDFC Bank Ltd"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors ${
                              formValidationErrors.bankName ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                            }`}
                          />
                          {formValidationErrors.bankName && (
                            <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.bankName}</span>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            Account Holder Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={editAccountName}
                            onChange={(e) => {
                              setEditAccountName(e.target.value);
                              if (formValidationErrors.accountName) setFormValidationErrors(prev => ({ ...prev, accountName: '' }));
                            }}
                            placeholder="e.g. Abhinav Sharma"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors ${
                              formValidationErrors.accountName ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                            }`}
                          />
                          {formValidationErrors.accountName && (
                            <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.accountName}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            Account Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={editAccountNumber}
                            onChange={(e) => {
                              setEditAccountNumber(e.target.value);
                              if (formValidationErrors.accountNumber) setFormValidationErrors(prev => ({ ...prev, accountNumber: '' }));
                            }}
                            placeholder="e.g. 50100456789123"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors font-mono ${
                              formValidationErrors.accountNumber ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                            }`}
                          />
                          {formValidationErrors.accountNumber && (
                            <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.accountNumber}</span>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={11}
                            value={editIfsc}
                            onChange={(e) => {
                              setEditIfsc(e.target.value.toUpperCase());
                              if (formValidationErrors.ifsc) setFormValidationErrors(prev => ({ ...prev, ifsc: '' }));
                            }}
                            placeholder="e.g. HDFC0001234"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors font-mono uppercase ${
                              formValidationErrors.ifsc ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                            }`}
                          />
                          {formValidationErrors.ifsc && (
                            <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.ifsc}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rail 3: PayPal */}
                  {editPayoutMethod === 'PayPal' && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                        PayPal Registered Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={editPaypalEmail}
                        onChange={(e) => {
                          setEditPaypalEmail(e.target.value);
                          if (formValidationErrors.paypalEmail) setFormValidationErrors(prev => ({ ...prev, paypalEmail: '' }));
                        }}
                        placeholder="e.g. partner-payouts@agency.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors ${
                          formValidationErrors.paypalEmail ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                        }`}
                      />
                      <span className="text-[10px] text-white/40 mt-1 block">
                        Commissions will be transferred in equivalent USD/EUR via PayPal Mass Payments.
                      </span>
                      {formValidationErrors.paypalEmail && (
                        <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.paypalEmail}</span>
                      )}
                    </div>
                  )}

                  {/* Rail 4: Wire / SWIFT */}
                  {editPayoutMethod === 'Wire' && (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            Bank Name & Country *
                          </label>
                          <input
                            type="text"
                            required
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            placeholder="e.g. Barclays Bank UK"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                            SWIFT / BIC Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={editSwiftCode}
                            onChange={(e) => {
                              setEditSwiftCode(e.target.value.toUpperCase());
                              if (formValidationErrors.swiftCode) setFormValidationErrors(prev => ({ ...prev, swiftCode: '' }));
                            }}
                            placeholder="e.g. BARCGB22"
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border text-white text-xs placeholder:text-white/30 focus:outline-none transition-colors font-mono uppercase ${
                              formValidationErrors.swiftCode ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-[#CCFF00]'
                            }`}
                          />
                          {formValidationErrors.swiftCode && (
                            <span className="text-[10px] text-red-400 mt-1 block">{formValidationErrors.swiftCode}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                          IBAN or International Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={editAccountNumber}
                          onChange={(e) => setEditAccountNumber(e.target.value)}
                          placeholder="e.g. GB29BARC20201531234567"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Payout Automation & Preferences */}
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sliders size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">Preferences & Automation</h3>
                    <p className="text-[11px] text-white/50">Tailor payout frequencies and milestone communication</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-1.5">
                      Minimum Auto-Disbursement Threshold
                    </label>
                    <select
                      value={editAutoPayoutThreshold}
                      onChange={(e) => setEditAutoPayoutThreshold(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value={1000}>₹1,000 (Standard Min.)</option>
                      <option value={5000}>₹5,000 (Recommended)</option>
                      <option value={10000}>₹10,000 (Batch Settlements)</option>
                      <option value={25000}>₹25,000 (High Volume)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/70 block mb-2">
                      WhatsApp Deal Alerts
                    </label>
                    <label className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer hover:bg-white/[0.05] transition-colors">
                      <input
                        type="checkbox"
                        checked={editNotifyOnWhatsApp}
                        onChange={(e) => setEditNotifyOnWhatsApp(e.target.checked)}
                        className="w-4 h-4 accent-[#CCFF00] rounded cursor-pointer"
                      />
                      <span className="text-xs text-white/80 font-medium">
                        Notify me instantly via WhatsApp on milestone payments
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SAVE ACTION BAR */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to active partner data
                    if (partner) {
                      setEditName(partner.name || '');
                      setEditCompany(partner.company || '');
                      setEditPhone(partner.phone || '');
                      setEditBio(partner.notes || '');
                      setEditPanTaxId(partner.payoutDetails?.panTaxId || '');
                      setEditPayoutMethod(partner.payoutMethod || 'UPI');
                      setEditUpiId(partner.payoutDetails?.upiId || '');
                      setEditBankName(partner.payoutDetails?.bankName || '');
                      setEditAccountNumber(partner.payoutDetails?.accountNumber || '');
                      setEditAccountName(partner.payoutDetails?.accountName || partner.name || '');
                      setEditIfsc(partner.payoutDetails?.ifsc || '');
                      setEditPaypalEmail(partner.payoutDetails?.paypalEmail || partner.email || '');
                      setEditSwiftCode(partner.payoutDetails?.swiftCode || '');
                      setEditWireDetails(partner.payoutDetails?.wireDetails || '');
                      setFormValidationErrors({});
                      toast.info('Form Reset', 'Reverted back to your saved profile.');
                    }
                  }}
                  className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Discard Changes
                </button>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-7 py-3 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#CCFF00]/15 flex items-center gap-2"
                >
                  {isSavingSettings ? (
                    <>
                      <ThinkingOrb state="connecting" size={20} theme="dark" aria-label="Saving profile..." />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} />
                      <span>Save Profile & Payout Coordinates</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* SECTION 4: SECURITY & CREDENTIAL UPDATE */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#0B0F17] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Security & Authentication</h3>
                    <p className="text-xs text-white/50">Update your partner account password and credential access.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium self-start sm:self-auto">
                  <Shield size={12} />
                  <span>Dual-Sync Encrypted</span>
                </div>
              </div>

              {/* Password Feedback Banners */}
              {passwordError && (
                <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1 font-medium">{passwordError}</div>
                  <button
                    type="button"
                    onClick={() => setPasswordError(null)}
                    className="text-white/40 hover:text-white text-xs underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {passwordSuccess && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <div className="flex-1 font-medium">{passwordSuccess}</div>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* CURRENT PASSWORD */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={12} className="text-white/40" />
                      <span>Current Password</span>
                      <span className="text-[#CCFF00]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => {
                          setCurrentPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="••••••••••••"
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-amber-400/50 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound size={12} className="text-amber-400" />
                      <span>New Password</span>
                      <span className="text-[#CCFF00]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => {
                          setNewPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="Min. 8 characters"
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#CCFF00]/50 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* LIVE PASSWORD STRENGTH METER */}
                    {newPassword && (
                      <div className="space-y-1.5 pt-1">
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map(step => (
                            <div
                              key={step}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                step <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white/40">Strength Rating:</span>
                          <span className={`font-bold ${passwordStrength.text}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM NEW PASSWORD */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCheck size={12} className="text-emerald-400" />
                      <span>Confirm New Password</span>
                      <span className="text-[#CCFF00]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => {
                          setConfirmPassword(e.target.value);
                          if (passwordError) setPasswordError(null);
                        }}
                        placeholder="Re-enter new password"
                        className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 text-xs focus:outline-none focus:border-emerald-400/50 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* MATCH FEEDBACK */}
                    {confirmPassword && (
                      <div className="text-[10px] flex items-center gap-1 pt-1">
                        {newPassword === confirmPassword ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Passwords match perfectly
                          </span>
                        ) : (
                          <span className="text-amber-400/80 flex items-center gap-1">
                            <AlertCircle size={11} /> Passwords do not match yet
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECURITY FOOTER & SUBMIT */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/40 text-[11px]">
                    <Shield size={13} className="text-[#CCFF00]/80 shrink-0" />
                    <span>Minimum 8 characters with numbers or symbols recommended.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <ThinkingOrb state="connecting" size={20} theme="dark" aria-label="Updating password..." />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound size={15} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: SUBMIT CLIENT INTRO */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0C101A] border border-white/15 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase text-white font-['Outfit']">
                    Submit Client Referral
                  </h3>
                  <p className="text-xs text-white/60">
                    We will initiate discovery and keep your portal updated with live deal milestones.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReferral} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="e.g. David Miller"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newClientCompany}
                      onChange={(e) => setNewClientCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="david@acmecorp.com"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Target Service</label>
                    <select
                      value={newProjectType}
                      onChange={(e) => setNewProjectType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-[#CCFF00]"
                    >
                      <option value="AI Automation Blueprint">AI Automation Blueprint (₹50k+)</option>
                      <option value="Custom Autonomous AI Agent">Custom Autonomous AI Agent (₹1.5L+)</option>
                      <option value="Workflow & Operations Automation">Workflow Automation (₹75k+)</option>
                      <option value="Custom Internal Business OS">Custom Internal Business OS (₹2.5L+)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      value={newDealValue}
                      onChange={(e) => setNewDealValue(e.target.value)}
                      placeholder="75000"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] font-mono tabular-nums"
                    />
                  </div>
                </div>

                {/* Real-time Estimated Cut Preview */}
                <div className="p-3 rounded-2xl bg-[#CCFF00]/5 border border-[#CCFF00]/20 flex items-center justify-between text-xs">
                  <span className="text-white/70">Projected Commission ({partnerRatePercent}%):</span>
                  <span className="text-sm font-black text-[#CCFF00] font-mono">
                    ₹{Math.round((Number(newDealValue) || 0) * partnerRate).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">Introduction Notes / Bottlenecks</label>
                  <textarea
                    rows={3}
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Tell us what bottlenecks this client faces or how the introduction occurred..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#CCFF00]/15 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <ThinkingOrb state="connecting" size={20} theme="dark" aria-label="Registering referral..." />
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

      {/* MODAL 2: REQUEST PAYOUT */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-[#0C101A] border border-white/15 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase text-white font-['Outfit']">
                  Request Commission Payout
                </h3>
                <button
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/25 flex justify-between items-center">
                <span className="text-xs text-white/70 font-semibold">Available Balance:</span>
                <span className="text-2xl font-black text-[#CCFF00] font-mono tabular-nums">
                  ₹{availablePendingPayout.toLocaleString('en-IN')}
                </span>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold uppercase text-white/70">
                      Withdrawal Amount (₹) *
                    </label>
                    {/* Quick percentage chips */}
                    <div className="flex items-center gap-1">
                      {[0.5, 1].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setPayoutRequestAmount(String(Math.floor(availablePendingPayout * pct)))}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/10 hover:bg-white/20 text-white/80 font-mono cursor-pointer"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">
                    Destination Coordinates
                  </label>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 font-medium">
                    {partner.payoutMethod || 'UPI'}{' '}
                    {partner.payoutDetails?.upiId ? `(${partner.payoutDetails.upiId})` : ''}
                    {partner.payoutDetails?.accountNumber ? `(A/C: ${partner.payoutDetails.accountNumber})` : ''}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/70 block mb-1">
                    Optional Reference Notes
                  </label>
                  <textarea
                    rows={2}
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="e.g. Milestone settlement withdrawal"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#CCFF00]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black text-xs font-black uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-[#CCFF00]/15"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: QR CODE PREVIEW */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-[#0C101A] border border-white/15 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="w-full flex justify-end">
                <button
                  onClick={() => setIsQrModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                <QrCode size={24} />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase text-white font-['Outfit']">Your Partner QR Code</h3>
                <p className="text-xs text-white/50 mt-1">
                  Have prospective clients scan this directly from your mobile screen during live meetings.
                </p>
              </div>

              {/* QR Image Box */}
              <div className="p-4 bg-white rounded-2xl shadow-xl">
                <img
                  src={qrImageUrl}
                  alt="Partner Referral QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>

              <span className="text-xs font-mono font-bold text-[#CCFF00]">Code: {partner.referralCode}</span>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {copiedLink ? 'Link Copied!' : 'Copy Referral URL'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
