import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Activity, Terminal, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface DifferenceSectionProps {
  onAuditClick?: () => void;
}

export const DifferenceSection: React.FC<DifferenceSectionProps> = ({ onAuditClick }) => {
  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#07090E] border-t border-white/5 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#CCFF00]/5 blur-[160px] pointer-events-none rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Big Statement inspired by digi.ai.in */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#CCFF00] font-mono text-[11px] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
              <span>The Engineering Difference</span>
            </div>

            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white tracking-tight leading-[1.08] uppercase font-['Outfit']"
            >
              Most of our work <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">
                never has a public URL
              </span> <br />
              you’d recognise.
            </h2>

            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed max-w-2xl">
              It runs custom <strong className="text-white font-medium">CRMs</strong>, backoffice <strong className="text-white font-medium">ERPs</strong>, multi-channel <strong className="text-white font-medium">automated billing</strong>, native <strong className="text-white font-medium">mobile dispatch apps</strong>, and private cloud <strong className="text-white font-medium">DevOps pipelines</strong> that had to work on day one—with zero room for failure or second tries.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {onAuditClick ? (
                <button
                  onClick={onAuditClick}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer"
                >
                  <span>Audit Your Current Stack</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <a
                  href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20audit%20our%20current%20software%20and%20automation%20systems."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer"
                >
                  <span>Audit Your Current Stack</span>
                  <ArrowRight size={13} />
                </a>
              )}
              <span className="text-xs font-mono text-white/40">
                // Strict NDAs respected. Private repos only.
              </span>
            </div>
          </motion.div>

          {/* Right Column: 4 Engineering Standards */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
          >
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Lock size={15} />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wide">
                  Behind Private Firewalls
                </h4>
              </div>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                We build role-based internal ERPs, customer support vaults, and financial ledgers that your competitors never see.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                  <Zap size={15} />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wide">
                  Zero Fragile No-Code Tax
                </h4>
              </div>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                No fragile glue scripts or escalating per-seat monthly subscription taxes. 100% compiled code, typed schemas, and client IP ownership.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Activity size={15} />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wide">
                  Stress-Tested for Failure
                </h4>
              </div>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                We test what happens when APIs timeout, networks disconnect, and servers restart. Edge cases are handled gracefully.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Terminal size={15} />
                </div>
                <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wide">
                  Maintained with Pure DevOps
                </h4>
              </div>
              <p className="text-xs text-white/60 font-light leading-relaxed">
                Automated Docker containers, health checks, cron supervisors, and automated backups so business operations never stop.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

