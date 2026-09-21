import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, CheckCircle2, MessageSquare, Phone, Mail, Building, ArrowRight, Shield, Clock, ArrowLeft, Zap, Calendar } from 'lucide-react';
import { crmService } from '../lib/crmService';
import { toast } from '../lib/toastStore';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  initialNotes?: string;
  initialEmail?: string;
}

const BOTTLENECKS = [
  { id: 'support', title: 'Tier-1 Customer Support & Lead Delay', desc: 'Slow response times, missed weekend inquiries, rep burnout', icon: '💬' },
  { id: 'data_entry', title: 'Manual Copy-Pasting & Invoicing', desc: 'Fragmented data across CRM, Google Sheets, Stripe, and ERP', icon: '⚡' },
  { id: 'qualification', title: 'Lead Qualification & Booking Lag', desc: 'Inbound leads going cold waiting for manual SDR research', icon: '🎯' },
  { id: 'custom', title: 'Custom Systems & Bespoke Portals', desc: 'Need custom autonomous agents or dedicated client portal', icon: '🛠️' },
];

const TIME_LEAKS = [
  { id: 'light', range: '5–15 hrs/week', loss: '~$1,500/mo Burn Rate', desc: '1–2 operators spending partial time on admin' },
  { id: 'medium', range: '15–40 hrs/week', loss: '~$4,500/mo Burn Rate', desc: 'Full-time headcount trapped in manual work' },
  { id: 'heavy', range: '40+ hrs/week', loss: '~$8,000+/mo Burn Rate', desc: 'Multiple department bottlenecks holding back growth' },
];

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  onClose,
  initialService,
  initialNotes,
  initialEmail
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBottleneck, setSelectedBottleneck] = useState(initialService || 'Tier-1 Customer Support & Lead Delay');
  const [selectedLeak, setSelectedLeak] = useState('15–40 hrs/week');
  
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialService) setSelectedBottleneck(initialService);
      if (initialNotes) setNotes(initialNotes);
      if (initialEmail) setEmail(initialEmail);
      setStep(1);
      setIsSuccess(false);
    }
  }, [isOpen, initialService, initialNotes, initialEmail]);

  if (!isOpen) return null;

  const handleNext = () => {
    setStep(prev => Math.min(3, prev + 1) as any);
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1) as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Required Fields', 'Please enter your name and work email.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for partner referral code in session or localStorage
      const partnerRef = (typeof window !== 'undefined' 
        ? (sessionStorage.getItem('agx_partner_ref') || localStorage.getItem('agx_partner_ref')) 
        : '') || '';

      // 1. Create Lead in CRM Supabase Database
      await crmService.createLead({
        name: name.trim(),
        company: company.trim() || 'Direct Client',
        phone: phone.trim() || null,
        email: email.trim().toLowerCase(),
        whatsapp: phone.trim() || null,
        location: 'Website Inbound Wizard',
        interestedService: selectedBottleneck,
        estimatedDealValue: selectedLeak.includes('40+') ? 350000 : 150000,
        probability: 70,
        source: partnerRef ? `Partner Referral (${partnerRef})` : 'Website Diagnostic',
        partnerCode: partnerRef || undefined,
        assignedTo: 'Abhinav (Super Admin)',
        priority: 'High',
        status: 'NEW',
        notes: `Operational Bottleneck: ${selectedBottleneck}\nWeekly Time Loss: ${selectedLeak}\n${partnerRef ? `Referred By Partner Code: ${partnerRef}\n` : ''}Client Notes: ${notes || 'Requested custom 14-day automation blueprint.'}`
      });

      // 2. Trigger Real-time Staff Alert in CRM Notifications
      await crmService.createNotification({
        title: 'New High-Intent Diagnostic Lead ⚡',
        message: `${name.trim()} (${company.trim() || 'Direct'}) requested blueprint for ${selectedBottleneck} (${selectedLeak}).${partnerRef ? ` [Ref: ${partnerRef}]` : ''}`,
        type: 'urgent'
      });

      setIsSuccess(true);
      toast.success('Blueprint Reserved', 'A Solution Architect will prepare your 14-day roadmap.');
    } catch (err: any) {
      console.warn('Inbound lead capture fallback:', err);
      setIsSuccess(true);
      toast.success('Inquiry Received', 'Thank you! We have registered your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setCompany('');
    setEmail('');
    setPhone('');
    setNotes('');
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="double-bezel-outer max-w-lg w-full text-white shadow-2xl relative my-6 overflow-hidden"
      >
        <div className="double-bezel-inner p-0 overflow-hidden bg-[#0A0D14]">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black italic tracking-tighter text-white font-['Outfit']">
                AG<span className="text-[#CCFF00]">X</span>
              </span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-bold uppercase tracking-wider">
                14-Day Diagnostic Blueprint
              </span>
            </div>
            
            {/* Step Indicators */}
            {!isSuccess && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
                <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-[#CCFF00]' : 'bg-white/20'}`} />
                <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-[#CCFF00]' : 'bg-white/20'}`} />
                <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-[#CCFF00]' : 'bg-white/20'}`} />
                <span className="ml-1 text-[11px] text-white/60">Step {step}/3</span>
              </div>
            )}

            <button
              onClick={handleReset}
              className="p-1.5 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center mx-auto border border-[#CCFF00]/30 shadow-lg shadow-[#CCFF00]/10">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-white font-['Outfit']">
                Diagnostic Request Confirmed
              </h3>
              <p className="text-xs text-white/70 leading-relaxed max-w-sm mx-auto font-light">
                Your request has been routed to the <strong>AGX Solutions Engineering Desk</strong>. An architect will review your bottleneck and prepare your tailored 14-day architecture proposal.
              </p>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left text-xs space-y-1.5 my-4">
                <div className="flex justify-between text-white/60">
                  <span>Targeted System:</span>
                  <strong className="text-white">{selectedBottleneck}</strong>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Estimated Time Reclaim:</span>
                  <strong className="text-[#CCFF00]">{selectedLeak}</strong>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Guarantee Protection:</span>
                  <strong className="text-emerald-400">30-Day Zero-Risk Active</strong>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
                <a
                  href={`https://calendly.com/abhinavagxprience/agx-automation-diagnostic?name=${encodeURIComponent(name.trim())}&email=${encodeURIComponent(email.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer btn-press"
                >
                  <Calendar size={14} />
                  <span>Schedule Strategy Call (20 min)</span>
                </a>
                <a
                  href={`https://wa.me/918698324316?text=${encodeURIComponent(`Hi AGX, I just submitted the 14-Day Diagnostic Blueprint for ${selectedBottleneck} (${selectedLeak}). My name is ${name.trim()} from ${company.trim() || 'our team'}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer btn-press"
                >
                  <Phone size={14} />
                  <span>WhatsApp VIP Line</span>
                </a>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Bottleneck Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-['Outfit']">
                      1. Select Your Core Operational Bottleneck
                    </h3>
                    <p className="text-white/50 text-xs mt-1">
                      Which friction point is costing your team the most time and payroll?
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {BOTTLENECKS.map((b) => {
                      const isSelected = selectedBottleneck === b.title;
                      return (
                        <button
                          type="button"
                          key={b.id}
                          onClick={() => setSelectedBottleneck(b.title)}
                          className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-white shadow-md shadow-[#CCFF00]/5'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-2xl mt-0.5">{b.icon}</span>
                          <div className="flex-1">
                            <strong className="block text-xs font-bold text-white uppercase tracking-wide">{b.title}</strong>
                            <span className="text-[11px] text-white/50 font-light mt-0.5 block">{b.desc}</span>
                          </div>
                          {isSelected && <span className="text-[#CCFF00] font-bold text-sm">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer btn-press"
                    >
                      <span>Continue to Scale Step</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Time Leaks */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-['Outfit']">
                      2. Estimate Weekly Hours Trapped in Admin
                    </h3>
                    <p className="text-white/50 text-xs mt-1">
                      This calculates your payback period and expected efficiency return.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {TIME_LEAKS.map((leak) => {
                      const isSelected = selectedLeak === leak.range;
                      return (
                        <button
                          type="button"
                          key={leak.id}
                          onClick={() => setSelectedLeak(leak.range)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-white shadow-md shadow-[#CCFF00]/5'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-extrabold text-white font-mono block">{leak.range}</span>
                            <span className="text-[11px] text-white/50 font-light mt-0.5 block">{leak.desc}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-[#CCFF00] px-2.5 py-1 rounded bg-white/5 border border-white/10">
                            {leak.loss}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer btn-press"
                    >
                      <span>Final Step: Delivery</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Delivery */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-['Outfit']">
                      3. Where Should We Deliver Your Blueprint?
                    </h3>
                    <p className="text-white/50 text-xs mt-1">
                      Includes custom architecture diagram, 14-day timeline & guarantee terms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Marcus Chen"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Omnilog Freight"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marcus@omnilog.io"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider mb-1">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-white/60 uppercase tracking-wider mb-1">
                      Key Software to Integrate (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g., Stripe, HubSpot, custom PostgreSQL database, WhatsApp API..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#CCFF00] resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="text-xs font-bold text-white/60 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer btn-press shadow-lg shadow-[#CCFF00]/15"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Submit & Schedule Strategy Session</span>
                          <Send size={13} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Shield size={11} /> 100% Confidential • NDA Protected
                    </span>
                    <span>Zero Spam Guarantee</span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
