import React from 'react';
import { motion } from 'motion/react';
import { Building2, TrendingUp, Rocket, CheckCircle2, ArrowRight, ShieldCheck, Users } from 'lucide-react';

interface WhoWeServeProps {
  onAuditClick?: () => void;
}

interface ClientArchetype {
  id: string;
  badge: string;
  title: string;
  icon: React.ReactNode;
  pain: string;
  solution: string;
  outcomes: string[];
}

const ARCHETYPES: ClientArchetype[] = [
  {
    id: 'b2b-services',
    badge: 'Growing B2B & Services',
    title: 'Companies Drowning in Manual Admin',
    icon: <Building2 className="w-5 h-5 text-[#CCFF00]" />,
    pain: 'Trapped in spreadsheet chaos, manual invoicing, copy-pasting customer details across tools, and 4-hour lead delays.',
    solution: 'We build bespoke Personalized WebApps (CRM, ERP), client request portals, and automated WhatsApp billing pipelines that run on autopilot.',
    outcomes: [
      'Save 40+ staff hours every week',
      'Instant WhatsApp lead capture (<15s)',
      'Zero manual invoice generation errors'
    ]
  },
  {
    id: 'high-volume',
    badge: 'Operations & Commerce',
    title: 'High-Volume Transaction Operators',
    icon: <TrendingUp className="w-5 h-5 text-[#CCFF00]" />,
    pain: 'Losing revenue to dropped leads, broken Zapier webhooks, unmonitored server crashes, and fragile third-party software limits.',
    solution: 'We engineer robust Business DevOps pipelines, Docker containerization, resilient API queues, and autonomous 24/7 AI agents.',
    outcomes: [
      '99.98% production uptime guarantee',
      'Zero silent dropped webhooks or leads',
      'Automated nightly backups & auto-healing'
    ]
  },
  {
    id: 'founders-leaders',
    badge: 'Founders & Product Leaders',
    title: 'Teams Needing Custom Web & Mobile Apps',
    icon: <Rocket className="w-5 h-5 text-[#CCFF00]" />,
    pain: 'Frustrated by slow agencies quoting 6-month timelines, fragile no-code platforms, or escalating $200/month/user SaaS license fees.',
    solution: 'We design and code production-grade WebApps and native Android & iOS mobile apps in rapid 14-day sprints with 100% client IP ownership.',
    outcomes: [
      'Shipped live in 14-day production sprints',
      '100% full source code ownership',
      'Zero recurring per-seat software taxes'
    ]
  }
];

export const WhoWeServe: React.FC<WhoWeServeProps> = ({ onAuditClick }) => {
  return (
    <section id="who-we-serve" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#07090E] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5"
        >
          <div className="max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase block mb-3">
              // Ideal Client Fit
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white tracking-tight leading-[1.05] font-['Outfit']">
              Who We Serve. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#CCFF00]">
                Built For Operators, Not Spectators.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base font-light text-white/70 leading-relaxed">
              We partner with businesses that have outgrown off-the-shelf software and need custom systems to scale without hiring more back-office staff.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl shrink-0">
            <Users size={14} />
            <span>High-ROI Engagements Only</span>
          </div>
        </motion.div>

        {/* 3 Archetype Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARCHETYPES.map((arch, idx) => (
            <motion.div
              key={arch.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-2.5 py-1 rounded-md">
                    {arch.badge}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {arch.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white font-['Outfit'] mb-3">
                  {arch.title}
                </h3>

                {/* The Friction */}
                <div className="mb-3 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/15 text-white/70 text-xs font-light leading-relaxed">
                  <span className="text-red-400 font-mono font-semibold block text-[10px] uppercase mb-1">
                    The Bottleneck:
                  </span>
                  {arch.pain}
                </div>

                {/* How AGX Solves It */}
                <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed mb-4">
                  {arch.solution}
                </p>

                {/* Outcome Checklist */}
                <div className="space-y-2 py-3 border-t border-white/5">
                  {arch.outcomes.map((out, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2 text-xs text-white/90">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="pt-4 mt-2 border-t border-white/5">
                {onAuditClick ? (
                  <button
                    onClick={onAuditClick}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check Operational Fit</span>
                    <ArrowRight size={12} className="text-[#CCFF00]" />
                  </button>
                ) : (
                  <a
                    href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20see%20if%20our%20business%20fits%20your%20services."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check Operational Fit</span>
                    <ArrowRight size={12} className="text-[#CCFF00]" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Callout Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-5"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-['Outfit'] uppercase">
                Zero High-Pressure Sales. 100% Technical Candor.
              </h4>
              <p className="text-xs text-white/60 font-light mt-0.5">
                If custom software or automations are not the highest-ROI solution for your current stage, we will tell you directly on day one.
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            {onAuditClick ? (
              <button
                onClick={onAuditClick}
                className="w-full md:w-auto px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book 20-Min Fit Diagnostic</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <a
                href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20a%2020-min%20fit%20diagnostic."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#CCFF00]/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Book 20-Min Fit Diagnostic</span>
                <ArrowRight size={13} />
              </a>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
};

