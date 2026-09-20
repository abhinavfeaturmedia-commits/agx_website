import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Gift, CheckCircle2, ArrowRight, Lock, Zap, FileText, BellRing, PhoneCall } from 'lucide-react';

interface GrandSlamStackProps {
  onClaimOffer?: () => void;
}

const bonuses = [
  {
    number: "FREE BONUS #1",
    value: "$3,500 Value",
    title: "Custom Company SOP & Loom Training Portal",
    desc: "Complete video-recorded SOPs and an interactive Notion training portal tailored to your team. We train your staff so internal adoption happens in under 30 minutes.",
    icon: <FileText size={20} className="text-[#CCFF00]" />,
  },
  {
    number: "FREE BONUS #2",
    value: "$2,500 Value",
    title: "60-Day VIP Error Monitoring & Webhook Warranty",
    desc: "If any third-party software updates an API or a webhook encounters an error, our engineering team fixes and refines it within 4 hours at zero extra charge.",
    icon: <Zap size={20} className="text-emerald-400" />,
  },
  {
    number: "FREE BONUS #3",
    value: "$1,800 Value",
    title: "Dedicated VIP WhatsApp / Slack Dispatch Line",
    desc: "Direct, priority communication line with your Lead Solutions Architect and engineering lead. Zero frustrating ticket queues or chatbot hoops.",
    icon: <PhoneCall size={20} className="text-blue-400" />,
  },
  {
    number: "FREE BONUS #4",
    value: "$2,000 Value",
    title: "Weekly Executive KPI & Revenue Pulse Digest",
    desc: "Automated Monday morning operational digests delivered directly to your executive Slack or WhatsApp channel detailing hours saved, tasks completed, and uptime.",
    icon: <BellRing size={20} className="text-purple-400" />,
  }
];

const guarantees = [
  {
    title: "14-Day Production Delivery Sprint",
    desc: "Your core automation workforce is completely engineered, thoroughly tested, and functioning in your live environment within 14 business days.",
    badge: "Speed Guarantee"
  },
  {
    title: "30-Day Zero-Risk Efficiency ROI",
    desc: "If our systems do not measurably save your organization at least 10 hours per week within 30 days of launch, we work completely free until they do.",
    badge: "Performance Guarantee"
  },
  {
    title: "100% Intellectual Property Ownership",
    desc: "You retain full code and workflow ownership from day one. All API keys, database tables, and automation scripts belong 100% to you. No vendor lock-in.",
    badge: "Data Sovereignty"
  }
];

export const GrandSlamStack: React.FC<GrandSlamStackProps> = ({ onClaimOffer }) => {
  return (
    <section id="guarantee-stack" className="px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-transparent border-t border-white/5 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#CCFF00]/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col gap-12 md:gap-14 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center gap-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-mono uppercase tracking-widest backdrop-blur-sm">
            <Gift size={14} />
            The $100M Grand Slam Offer Stack
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-tight leading-[1.08] font-['Outfit']">
            THE ZERO-RISK <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">OPERATIONAL PROMISE</span>
          </h2>
          <p className="text-white/60 font-light max-w-2xl text-sm md:text-base">
            We don't ask you to take on risk. We absorb 100% of the operational and financial risk so you can scale with complete confidence.
          </p>
        </motion.div>

        {/* 3-Part Guarantee Banner (Machined Double-Bezel) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="double-bezel-outer shadow-2xl"
        >
          <div className="double-bezel-inner p-8 md:p-10 bg-[#0B0E14] relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 font-bold tracking-widest mb-6">
              <ShieldCheck size={16} /> 3-Part Ironclad Client Protection
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {guarantees.map((g, idx) => (
                <div key={idx} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#CCFF00] tracking-wider px-2 py-0.5 rounded bg-[#CCFF00]/10 border border-[#CCFF00]/20">
                      {g.badge}
                    </span>
                    <h3 className="text-lg font-bold text-white uppercase mt-2 font-['Outfit']">
                      {g.title}
                    </h3>
                  </div>
                  <p className="text-xs text-white/60 font-light leading-relaxed">
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* $9,800 Free Bonus Stack */}
        <div>
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase text-white/40 tracking-widest block mb-1">
              Complementary Inclusions
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold uppercase text-white font-['Outfit']">
              Included Free With Every Engagement (<span className="text-[#CCFF00]">$9,800 Value</span>)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bonuses.map((b, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="double-bezel-outer"
              >
                <div className="double-bezel-inner p-7 flex flex-col justify-between h-full bg-[#0D1017]">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                      <span className="text-[10px] font-mono uppercase text-[#CCFF00] font-bold tracking-widest">
                        {b.number}
                      </span>
                      <span className="text-[11px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {b.value}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 mb-2">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                        {b.icon}
                      </div>
                      <h4 className="text-lg font-bold text-white uppercase font-['Outfit'] leading-snug">
                        {b.title}
                      </h4>
                    </div>

                    <p className="text-xs text-white/60 font-light leading-relaxed pl-12">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Trigger Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] border border-white/15 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-2xl sm:text-3xl font-extrabold uppercase text-white font-['Outfit']">
              Ready To Install Your Autonomous Engine?
            </h4>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              We accept a strict maximum of 4 client onboarding deployments per month.
            </p>
          </div>

          <button
            onClick={onClaimOffer}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/20 cursor-pointer btn-press shrink-0"
          >
            <span>Lock In Your Deployment & Bonus Stack</span>
            <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight size={13} className="text-black" />
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
