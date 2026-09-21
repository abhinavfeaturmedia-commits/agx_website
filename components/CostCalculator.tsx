import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, TrendingDown, ArrowRight, ShieldCheck, Zap, Users, FileDown, Check } from 'lucide-react';

interface CostCalculatorProps {
  onAuditClick?: (hours: number, monthlyLoss: number) => void;
}

const AnimatedValue = ({ value, prefix = "$" }: { value: number, prefix?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const duration = 400;
    const diff = value - start;
    if (diff === 0) return;
    const increment = diff / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= value) || (increment < 0 && start <= value)) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}</span>;
};

const CostCalculator: React.FC<CostCalculatorProps> = ({ onAuditClick }) => {
  const [teamSize, setTeamSize] = useState(3);
  const [hours, setHours] = useState(12);
  const [rate, setRate] = useState(45);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const monthlyLoss = Math.round(teamSize * hours * rate * 4.33);
  const yearlyLoss = monthlyLoss * 12;
  const dailyLoss = Math.round(monthlyLoss / 30);
  const estimatedPaybackDays = Math.max(9, Math.round(3500 / (dailyLoss || 1)));
  const netYearlySavings = Math.max(0, yearlyLoss - 3500);

  const handleAuditAction = () => {
    if (onAuditClick) {
      onAuditClick(hours * teamSize, monthlyLoss);
    } else {
      window.open('https://wa.me/918698324316', '_blank');
    }
  };

  const handleDownloadReport = () => {
    const reportText = `=====================================================
AGXPERIENCE INC. - FINANCIAL INACTION & PAYROLL LEAK AUDIT
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
=====================================================

1. EXECUTIVE DIAGNOSTIC PARAMETERS:
- Operational Team Size Trapped in Repetitive Admin: ${teamSize} Member(s)
- Average Lost Hours Per Person / Week: ${hours} hrs/week
- Total Organizational Capacity Lost: ${teamSize * hours} hours/week
- Blended Hourly Capital Cost: $${rate}/hr

2. FINANCIAL IMPACT SUMMARY:
- Estimated Monthly Payroll Waste: $${monthlyLoss.toLocaleString()}/month
- Annual Inaction Capital Burn: $${yearlyLoss.toLocaleString()}/year
- Daily Operational Burn Rate: ~$${dailyLoss.toLocaleString()}/day

3. PROJECTED RETURN WITH AGX AUTONOMOUS ENGINES:
- Estimated Break-Even Payback Period: ~${estimatedPaybackDays} Business Days
- Net Projected Year-1 Capital Reclaimed: +$${netYearlySavings.toLocaleString()}
- Turnkey Delivery Velocity: 14 Business Days
- 30-Day Zero-Risk Efficiency ROI Guarantee: Save 10+ hrs/wk or AGX works 100% free

=====================================================
Book Your 14-Day Custom Architecture Diagnostic:
Web: https://agxperience.com
Direct WhatsApp VIP: +91 86983 24316
Desk: abhinavagxprience@gmail.com
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AGX_Payroll_Leak_Audit_${monthlyLoss}mo.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3500);
  };

  return (
    <section id="calculator" className="px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col gap-12 relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="bg-white/5 text-[#CCFF00] px-3.5 py-1.5 text-xs font-mono uppercase tracking-widest flex items-center gap-2 rounded-full border border-white/10 backdrop-blur-sm">
            <AlertCircle size={14} className="text-amber-400" />
            Financial Inaction Audit
          </div>
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-tight leading-[1.08] font-['Outfit']"
          >
            THE COST OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">DOING NOTHING</span>
          </h2>
          <p className="text-white/60 max-w-2xl text-sm md:text-base font-light leading-relaxed">
            Every hour your team spends on manual copy-pasting, customer support backlog, and CSV manipulation is stolen payroll capital. Quantify your operational leak below:
          </p>
        </motion.div>

        {/* Double-Bezel Interactive Calculator Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="double-bezel-outer shadow-2xl"
        >
          <div className="double-bezel-inner p-6 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-8">
              <div>
                <span className="text-[10px] font-mono text-[#CCFF00] tracking-widest uppercase block mb-1">Interactive Diagnostic</span>
                <h3 className="text-2xl font-bold text-white uppercase font-['Outfit']">Configure Your Team Parameters</h3>
              </div>

              {/* Slider 1: Team Size */}
              <div className="flex flex-col gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                    <Users size={14} className="text-[#CCFF00]" /> Team Members Trapped in Repetitive Admin
                  </label>
                  <div className="text-white text-base font-bold font-mono px-2.5 py-0.5 rounded bg-white/10">{teamSize} people</div>
                </div>
                <input 
                  type="range" min="1" max="15" value={teamSize} 
                  onChange={(e) => setTeamSize(parseInt(e.target.value))}
                  className="accent-[#CCFF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 font-mono">
                  <span>Solo (1)</span>
                  <span>Small Squad (5)</span>
                  <span>Growing Department (15+)</span>
                </div>
              </div>

              {/* Slider 2: Hours Per Person */}
              <div className="flex flex-col gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Hours Lost to Admin Per Person / Week
                  </label>
                  <div className="text-white text-base font-bold font-mono px-2.5 py-0.5 rounded bg-white/10">{hours} hrs/wk</div>
                </div>
                <input 
                  type="range" min="2" max="30" value={hours} 
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="accent-[#CCFF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 font-mono">
                  <span>2 hrs (Light)</span>
                  <span>12 hrs (Standard)</span>
                  <span>30 hrs (Severe Bottleneck)</span>
                </div>
              </div>

              {/* Slider 3: Hourly Value */}
              <div className="flex flex-col gap-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Average Blended Hourly Cost
                  </label>
                  <div className="text-white text-base font-bold font-mono px-2.5 py-0.5 rounded bg-white/10">${rate} / hr</div>
                </div>
                <input 
                  type="range" min="20" max="250" step="5" value={rate} 
                  onChange={(e) => setRate(parseInt(e.target.value))}
                  className="accent-[#CCFF00] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 font-mono">
                  <span>Support / Admin ($25)</span>
                  <span>Manager ($65)</span>
                  <span>Executive / Founder ($200+)</span>
                </div>
              </div>
            </div>

            {/* Right Results Card (5 cols) */}
            <div className="lg:col-span-5 bg-black/40 border border-white/10 rounded-2xl p-7 flex flex-col justify-between gap-6 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-[#CCFF00]" />
              
              <div>
                <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-widest block mb-2">
                  ⚠️ Estimated Payroll Waste
                </span>
                
                <div 
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-['Outfit']"
                >
                  <AnimatedValue value={monthlyLoss} />
                </div>
                <div className="text-xs font-mono uppercase text-white/40 tracking-wider mt-1">Capital Burned Every Single Month</div>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-2.5 text-left border-y border-white/10 py-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Annual Inaction Loss:</span>
                  <strong className="text-white font-mono text-sm"><AnimatedValue value={yearlyLoss} /></strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Estimated Daily Burn:</span>
                  <strong className="text-red-400 font-mono text-sm">~${dailyLoss.toLocaleString()}/day</strong>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                  <span className="text-[#CCFF00] font-semibold flex items-center gap-1">
                    <Zap size={12} /> AGX Payback Period:
                  </span>
                  <strong className="text-[#CCFF00] font-mono text-sm">~{estimatedPaybackDays} Days</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-semibold">Net Year-1 Capital Reclaimed:</span>
                  <strong className="text-emerald-400 font-mono text-sm">+<AnimatedValue value={netYearlySavings} /></strong>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="space-y-3">
                <button
                  onClick={handleAuditAction}
                  className="group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/15 cursor-pointer btn-press"
                >
                  <span>Plug This Leak → Get Free Blueprint</span>
                  <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={12} className="text-black" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer btn-press"
                >
                  {isDownloaded ? (
                    <>
                      <Check size={13} className="text-[#CCFF00]" />
                      <span className="text-[#CCFF00] font-bold">CFO Audit Memo Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <FileDown size={13} className="text-white/60" />
                      <span>Download Audit Report (Memo)</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-1.5 text-white/50 text-[11px] font-mono">
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" /> 
                  <span>Guaranteed 10+ hrs/wk saved in 30 days or we work free</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CostCalculator;
