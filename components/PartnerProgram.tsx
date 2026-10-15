import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Handshake, ArrowRight, Users, TrendingUp, Sparkles, Award, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { calculatePartnerTier } from '../types/crm';

interface PartnerProgramProps {
  onBecomePartnerClick?: () => void;
  onPartnerLoginClick?: () => void;
  isPartnerLoggedIn?: boolean;
}

const PartnerProgram: React.FC<PartnerProgramProps> = ({
  onBecomePartnerClick,
  onPartnerLoginClick,
  isPartnerLoggedIn
}) => {
  // Monthly billing volume in INR (₹)
  const [monthlyVolume, setMonthlyVolume] = useState<number>(450000);

  // Dynamically calculate tier info using central single source of truth
  const activeTier = useMemo(() => calculatePartnerTier(monthlyVolume), [monthlyVolume]);
  const monthlyTakeHome = Math.round(monthlyVolume * activeTier.commissionRate);
  const yearlyTakeHome = monthlyTakeHome * 12;

  // Preset volume milestones for quick clicking
  const volumePresets = [
    { label: '₹1.5 Lakhs (Starter)', value: 150000 },
    { label: '₹3.5 Lakhs (Base)', value: 350000 },
    { label: '₹6.0 Lakhs (Pro)', value: 600000 },
    { label: '₹15.0 Lakhs (Elite)', value: 1500000 }
  ];

  return (
    <section className="px-6 md:px-12 py-20 md:py-28 bg-transparent border-t border-white/5 relative overflow-hidden">
      {/* Ambient Glow Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#CCFF00]/[0.015] to-transparent pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#CCFF00]/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-md">
            <Handshake size={14} className="text-[#CCFF00]" />
            AGX Partner & Referral Network
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal uppercase text-white tracking-tight leading-[1.08] max-w-4xl" style={{ fontFamily: "var(--font-display)" }}>
            PARTNER WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/40">AGX.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-2xl font-light leading-relaxed">
            Are you a web designer, marketing agency, or business consultant? Introduce clients who need automated workflows, AI agents, or custom engineering and earn a recurring <strong className="text-white font-medium">10% to 25% revenue share</strong>.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/80 backdrop-blur-md">
            <Sparkles size={14} className="text-[#CCFF00]" />
            <span><strong className="text-white font-semibold">100% Performance-Based:</strong> No fixed monthly retainers or mandatory quotas. Your tier scales dynamically with the actual business you close.</span>
          </div>
        </motion.div>

        {/* 4 Commercial Tier Cards Grid (Starter 10%, Base 15%, Pro 20%, Elite 25%) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {/* Card 1: Starter Tier (10%) */}
          <div 
            onClick={() => setMonthlyVolume(150000)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative backdrop-blur-md ${
              activeTier.tier === 'Starter'
                ? 'bg-white/[0.08] border-white/40 ring-2 ring-white/20 shadow-xl'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/50">Starter Tier</span>
                {activeTier.tier === 'Starter' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">Simulating</span>
                )}
              </div>
              <p className="text-xs text-white/70 leading-snug">Up to ₹2,50,000<br/><span className="text-white/40">(Monthly Business)</span></p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-4xl font-normal text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
                10%
              </div>
              <span className="text-xs font-bold text-white/80 block mt-1">Share.</span>
              <span className="text-[11px] text-white/40 block mt-1">Entry tier with zero minimum quotas or commitments.</span>
            </div>
          </div>

          {/* Card 2: Base Tier (15%) */}
          <div 
            onClick={() => setMonthlyVolume(350000)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative backdrop-blur-md ${
              activeTier.tier === 'Base'
                ? 'bg-blue-950/30 border-blue-400 ring-2 ring-blue-400/30 shadow-xl'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-blue-400">Base Tier</span>
                {activeTier.tier === 'Base' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Simulating</span>
                )}
              </div>
              <p className="text-xs text-white/70 leading-snug">₹2,50,001 — ₹4,00,000<br/><span className="text-white/40">(Monthly Business)</span></p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-4xl font-normal text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
                15%
              </div>
              <span className="text-xs font-bold text-blue-300 block mt-1">Share.</span>
              <span className="text-[11px] text-white/40 block mt-1">Standard rate for active consulting agencies.</span>
            </div>
          </div>

          {/* Card 3: Pro Tier (20%) */}
          <div 
            onClick={() => setMonthlyVolume(600000)}
            className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between relative backdrop-blur-md ${
              activeTier.tier === 'Pro'
                ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/30 shadow-xl'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">Pro Tier</span>
                {activeTier.tier === 'Pro' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Simulating</span>
                )}
              </div>
              <p className="text-xs text-white/70 leading-snug">Above ₹4,00,000<br/><span className="text-white/40">(Monthly Business)</span></p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-4xl font-normal text-white tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
                20%
              </div>
              <span className="text-xs font-bold text-emerald-300 block mt-1">Share.</span>
              <span className="text-[11px] text-emerald-400/90 font-medium block mt-1 leading-snug">
                *Applied to all business closed this month, not just overflow.
              </span>
            </div>
          </div>

          {/* Card 4: Elite Bonus Tier (25%) */}
          <div 
            onClick={() => setMonthlyVolume(1500000)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative backdrop-blur-md overflow-hidden ${
              activeTier.tier === 'Elite'
                ? 'bg-[#CCFF00]/10 border-[#CCFF00] ring-4 ring-[#CCFF00]/20 shadow-2xl'
                : 'bg-[#CCFF00]/[0.03] border-[#CCFF00]/40 hover:border-[#CCFF00]/70'
            }`}
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-wider rounded-bl-xl font-mono">
              Top Tier
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#CCFF00]">Elite Bonus</span>
              </div>
              <p className="text-xs text-white/80 leading-snug">Exceeds ₹12,00,000<br/><span className="text-white/40">(Monthly Business)</span></p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#CCFF00]/20">
              <div className="text-4xl font-normal text-[#CCFF00] tracking-tight leading-none" style={{ fontFamily: "var(--font-display)" }}>
                25%
              </div>
              <span className="text-xs font-bold text-white block mt-1">Share.</span>
              <span className="text-[11px] text-[#CCFF00]/90 font-semibold block mt-1 leading-snug">
                (+5% Performance Bonus on total monthly business).
              </span>
            </div>
          </div>
        </motion.div>

        {/* 2-Column Section: Left Value Props & Right Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Why Partner with AGX (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col gap-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 text-[#CCFF00]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1.5">Retrospective Payout Leap</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Crossing ₹4,00,000 in monthly client billing upgrades your commission to <strong className="text-white font-medium">20% across your entire volume</strong>—not just the increment. Exceeding ₹12,00,000 automatically attaches a +5% performance bonus, yielding a 25% total cut.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 text-white/80">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1.5">You Own the Client Relationship</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    We handle complex enterprise AI, workflow automation, and custom backend infrastructure. You maintain your core client accounts (design, ads, advisory) while delivering cutting-edge AI power under your wing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 text-white/80">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-1.5">Zero Technical Overhead</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    No coding or AI engineering needed on your part. Introduce your client via your custom Partner Portal link, and our engineering leaders conduct technical scoping, scoping calls, and implementation.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              {onBecomePartnerClick ? (
                <button 
                  onClick={onBecomePartnerClick}
                  className="liquid-glass inline-flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-black bg-[#CCFF00] hover:bg-[#b8e600] transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer shadow-xl shadow-[#CCFF00]/20"
                >
                  <span>Become a Partner</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <a 
                  href="https://wa.me/918698324316?text=I'm%20interested%20in%20the%20AGX%20Partner%20Program" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="liquid-glass inline-flex items-center gap-3 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-black bg-[#CCFF00] hover:bg-[#b8e600] transition-all hover:scale-[1.02] active:scale-95 group shadow-xl shadow-[#CCFF00]/20"
                >
                  <span>Become a Partner</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {onPartnerLoginClick && (
                <button
                  onClick={onPartnerLoginClick}
                  className={`px-6 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isPartnerLoggedIn
                      ? 'bg-white/10 text-[#CCFF00] hover:bg-white/15 border border-[#CCFF00]/30'
                      : 'text-white/70 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {isPartnerLoggedIn ? 'Open Partner Portal →' : 'Partner Sign In →'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Column: Interactive Commission Simulator (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#CCFF00]/5 to-transparent rounded-3xl transform rotate-2 scale-105 border border-white/5 pointer-events-none" />
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 relative z-10 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#CCFF00] font-bold block">
                    Interactive Revenue Estimator
                  </span>
                  <h3 className="text-xl font-normal text-white mt-0.5" style={{ fontFamily: "var(--font-display)" }}>
                    COMMISSION SIMULATOR
                  </h3>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase font-mono tracking-wider border"
                  style={{
                    backgroundColor: `${activeTier.tierColor}15`,
                    color: activeTier.tierColor,
                    borderColor: `${activeTier.tierColor}40`
                  }}
                >
                  {activeTier.badgeLabel}
                </span>
              </div>
              
              <div className="flex flex-col gap-6">
                {/* Monthly Volume Slider */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-medium text-white/80">Monthly Business Generated</label>
                    <span className="text-2xl font-black font-mono text-white tracking-tight">
                      ₹{monthlyVolume.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min={50000} 
                    max={1600000} 
                    step={25000}
                    value={monthlyVolume} 
                    onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]"
                  />
                  
                  {/* Preset quick pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                    {volumePresets.map(preset => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setMonthlyVolume(preset.value)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-mono transition-all text-center cursor-pointer border ${
                          monthlyVolume === preset.value
                            ? 'bg-[#CCFF00] text-black border-[#CCFF00] font-bold'
                            : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        ₹{(preset.value / 100000).toFixed(1)}L
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation Breakdown & Rule Note */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <Zap size={18} className="text-[#CCFF00] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="text-white font-semibold block">
                      {activeTier.ruleDescription} → {Math.round(activeTier.commissionRate * 100)}% Share
                    </span>
                    <span className="text-white/50 text-[11px] block mt-0.5 leading-snug">
                      {activeTier.bonusNote || 'Standard tiered revenue allocation.'}
                    </span>
                  </div>
                </div>

                {/* Results Card */}
                <div className="p-6 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60 uppercase tracking-widest font-mono">Monthly Take-Home</span>
                    <span className="text-3xl font-black text-[#CCFF00] font-mono">
                      ₹{monthlyTakeHome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/60 uppercase tracking-widest font-mono">Yearly Run Rate</span>
                    <span className="text-2xl font-bold text-white font-mono">
                      ₹{yearlyTakeHome.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress / Upgrade Callout */}
                <div className="text-center">
                  {activeTier.nextTier ? (
                    <p className="text-[11px] text-white/50 leading-relaxed">
                      💡 Generate <strong className="text-white font-mono font-bold">₹{activeTier.volumeNeededForNextTier.toLocaleString('en-IN')}</strong> more in client contracts to upgrade to the <strong className="text-[#CCFF00]">{activeTier.nextTier} Tier ({activeTier.nextTier === 'Elite' ? '25%' : activeTier.nextTier === 'Pro' ? '20%' : '15%'})</strong>.
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#CCFF00] font-bold leading-relaxed">
                      ⭐ Maximum Elite Tier Unlocked! Top 25% revenue cut including the +5% Performance Bonus.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnerProgram;

