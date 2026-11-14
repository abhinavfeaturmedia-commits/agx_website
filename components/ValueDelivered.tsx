import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, ArrowRight, Clock, CheckCircle2, Lock, Flame } from 'lucide-react';

interface ValueDeliveredProps {
  onClaimAudit?: () => void;
}

interface ValueMetric {
  metric: string;
  metricLabel: string;
  title: string;
  before: string;
  after: string;
  description: string;
}

const VALUES: ValueMetric[] = [
  {
    metric: '-94%',
    metricLabel: 'Manual Admin Labor',
    title: 'Automated Operations & Billing',
    before: '4.5 hrs/day manual entry',
    after: '14 mins/day automated',
    description: 'Custom ERP and CRM pipelines eliminate repetitive spreadsheet copy-pasting, manual invoice drafting, and reconciliation lag.'
  },
  {
    metric: '12s',
    metricLabel: 'Lead Response Time',
    title: '24/7 Inbound Autonomous Qualification',
    before: '4.2 hrs average delay',
    after: '12 seconds instant reply',
    description: 'Autonomous AI agents qualify inbound WhatsApp & web leads immediately, answer FAQs, and route booked meetings into your calendar.'
  },
  {
    metric: '14 Days',
    metricLabel: 'Sprint Velocity',
    title: 'Rapid Production Deployment',
    before: '4–6 months traditional agency',
    after: 'Live in 14-day sprints',
    description: 'We test edge cases first and deploy working, tested software directly to your servers without multi-month development drag.'
  },
  {
    metric: '100%',
    metricLabel: 'Client IP Ownership',
    title: 'Zero Recurring Software Tax',
    before: '$150/user/mo SaaS fees',
    after: '$0 recurring license fees',
    description: 'You own the complete code repository, database schemas, and server keys. No vendor lock-in or escalating per-seat monthly bills.'
  }
];

export const ValueDelivered: React.FC<ValueDeliveredProps> = ({ onClaimAudit }) => {
  return (
    <section id="value" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#05070B] border-t border-white/5 relative">
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
              // The Value Delivered
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white tracking-tight leading-[1.05] font-['Outfit']">
              Measured Outcomes. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#CCFF00]">
                Zero Vague Promises.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base font-light text-white/70 leading-relaxed">
              We judge our engineering on tangible business deltas: hours saved, revenue captured, and operating friction permanently eliminated.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3.5 py-2 rounded-xl shrink-0">
            <ShieldCheck size={14} />
            <span>Guaranteed in Writing</span>
          </div>
        </motion.div>

        {/* 4 Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map((val, idx) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 sm:p-7 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Metric Callout */}
                <div className="pb-4 mb-4 border-b border-white/5 flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#CCFF00] font-['Outfit'] block leading-none">
                      {val.metric}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mt-1">
                      {val.metricLabel}
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00]">
                    <Zap size={14} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-['Outfit'] mb-3">
                  {val.title}
                </h3>

                {/* Before / After Baseline */}
                <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-white/40">
                    <span>Before:</span>
                    <span className="text-red-400 line-through">{val.before}</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-emerald-400 font-semibold">With AGX:</span>
                    <span className="text-emerald-400 font-semibold">{val.after}</span>
                  </div>
                </div>

                <p className="text-xs text-white/65 font-light leading-relaxed">
                  {val.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 30-Day Zero-Risk Guarantee Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 p-7 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B0E14] via-[#0E121B] to-[#0B0E14] border border-[#CCFF00]/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>30-Day Zero-Risk Ironclad Guarantee</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit'] uppercase">
                Save 10+ Hours Every Week, Or We Work For Free.
              </h3>
              <p className="text-sm text-white/70 font-light leading-relaxed">
                We agree on targeted operational metrics before writing a single line of code. If your deployed system does not deliver the agreed time savings, we continue engineering at zero additional cost until it does.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
              {onClaimAudit ? (
                <button
                  onClick={onClaimAudit}
                  className="px-8 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#CCFF00]/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Claim Operations Audit</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <a
                  href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20claim%20the%20free%20operations%20audit."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#CCFF00]/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Claim Operations Audit</span>
                  <ArrowRight size={13} />
                </a>
              )}

              <a
                href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20speak%20with%20an%20engineer%20directly."
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

