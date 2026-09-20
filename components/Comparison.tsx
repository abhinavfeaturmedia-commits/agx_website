import React from 'react';
import { motion } from 'motion/react';
import { X, Check, Clock, Zap, TrendingUp, Users, Activity, ShieldCheck, ArrowRight, Sparkles, Scale } from 'lucide-react';

interface ComparisonProps {
  onUpgradeClick?: () => void;
}

const Comparison: React.FC<ComparisonProps> = ({ onUpgradeClick }) => {
  const comparisonRows = [
    {
      metric: "Operational Availability",
      oldWay: "40 Hours / Week (9am - 5pm, Weekdays only, sick leaves, vacations)",
      newWay: "168 Hours / Week (24/7/365 continuous real-time execution)",
      oldIcon: Clock,
      newIcon: Activity,
    },
    {
      metric: "Execution Consistency",
      oldWay: "Prone to fatigue, distraction & manual data-entry errors",
      newWay: "Deterministic verification with automated error-handling fallbacks",
      oldIcon: X,
      newIcon: Check,
    },
    {
      metric: "Scaling Velocity",
      oldWay: "Requires 6–8 weeks of recruiting, interviews & training per seat",
      newWay: "Instant scaling to 10x throughput with zero marginal headcount friction",
      oldIcon: Users,
      newIcon: Zap,
    },
    {
      metric: "Management Effort & Sacrifice",
      oldWay: "Daily standups, 1-on-1s, micro-management & employee turnover anxiety",
      newWay: "100% Done-For-You turnkey systems. We build, maintain & monitor 24/7",
      oldIcon: Users,
      newIcon: Sparkles,
    },
    {
      metric: "Financial Structure",
      oldWay: "Heavy fixed recurring salary, payroll taxes, health benefits & liabilities",
      newWay: "High-leverage asset with measurable payback in under 30 days",
      oldIcon: TrendingUp,
      newIcon: ShieldCheck,
    },
  ];

  return (
    <section id="comparison" className="px-6 md:px-12 py-20 md:py-24 bg-transparent border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-14">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#CCFF00] text-xs font-mono uppercase tracking-widest backdrop-blur-sm">
            <Scale className="w-3.5 h-3.5" />
            The Operational Paradigm Shift
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-tight leading-[1.08] font-['Outfit']">
            THE OLD WAY <span className="text-white/40">VS.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">THE AGX WAY</span>
          </h2>
          <p className="text-white/60 font-light max-w-2xl text-sm md:text-base mt-2">
            Why settle for human friction, repetitive burnout, and bloated payroll when you can install a high-performance autonomous engine?
          </p>
        </motion.div>

        {/* Side by Side Comparison Cards */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
        >
          {/* Legacy Hiring Card */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-8 md:p-10 flex flex-col justify-between gap-8 h-full bg-[#0E0F14]">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase font-mono text-red-400 tracking-widest flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                    <Activity className="w-3 h-3" /> THE OLD WAY
                  </span>
                  <span className="text-xs font-mono text-white/40 uppercase">Fragile Headcount Model</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-['Outfit']">
                  Hiring More Staff & Linear Scaling
                </h3>
                <p className="text-xs text-white/50 font-light leading-relaxed">
                  Throwing more headcount at repetitive processes creates management overhead, communication bottlenecks, and fixed financial risk.
                </p>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-6">
                {comparisonRows.map((row, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 text-xs text-white/60">
                    <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                      <X className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-mono uppercase text-[10px] text-white/40 tracking-wider">{row.metric}</div>
                      <div className="text-white/70 mt-0.5 leading-relaxed">{row.oldWay}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="w-full bg-white/5 text-white/40 py-3 text-center text-xs font-mono rounded-xl uppercase tracking-wider border border-white/10">
                  Outcome: Diminishing Margins & Burnout
                </div>
              </div>
            </div>
          </div>

          {/* AGX Autonomous Standard Card */}
          <div className="double-bezel-outer border-[#CCFF00]/30 shadow-[0_0_50px_rgba(204,255,0,0.06)]">
            <div className="double-bezel-inner p-8 md:p-10 flex flex-col justify-between gap-8 h-full bg-[#0B0E14] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase font-mono text-[#CCFF00] tracking-widest flex items-center gap-1.5 bg-[#CCFF00]/10 px-3 py-1 rounded-full border border-[#CCFF00]/20">
                    <Zap className="w-3 h-3" /> THE AGX STANDARD
                  </span>
                  <span className="text-xs font-mono text-[#CCFF00]/80 uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> High-Leverage Playbook
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight font-['Outfit']">
                  Autonomous AI Workforces & Systems
                </h3>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Deterministic workflows, autonomous reasoning agents, and automated data pipelines designed to run 24/7 with zero handholding.
                </p>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6 relative z-10">
                {comparisonRows.map((row, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 text-xs text-white/80">
                    <div className="w-5 h-5 rounded-full bg-[#CCFF00]/20 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00] shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="font-mono uppercase text-[10px] text-[#CCFF00] tracking-wider">{row.metric}</div>
                      <div className="text-white font-medium mt-0.5 leading-relaxed">{row.newWay}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 relative z-10 flex flex-col gap-3">
                <button
                  onClick={onUpgradeClick}
                  className="group relative w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/20 cursor-pointer btn-press"
                >
                  <span>Upgrade Your Operations To Autonomous</span>
                  <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight size={12} className="text-black" />
                  </span>
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[11px] text-white/60 text-center font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>30-Day Zero-Risk Guarantee: Save 10+ hrs/wk or we work free</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Comparison;
