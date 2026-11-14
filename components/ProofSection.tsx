import React from 'react';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, CheckCircle, ShieldCheck, Zap, Activity } from 'lucide-react';

interface MetricBenchmark {
  title: string;
  category: string;
  before: string;
  after: string;
  delta: string;
  isReduction: boolean;
  notes: string;
}

const BENCHMARKS: MetricBenchmark[] = [
  {
    title: "CRM & ERP Administrative Labor",
    category: "Workflow Automation",
    before: "4.5 hrs / day",
    after: "14 mins / day",
    delta: "-94%",
    isReduction: true,
    notes: "Automated invoice generation, customer ledger sync, and zero manual spreadsheet copy-pasting."
  },
  {
    title: "WebApp & Mobile App Response P95",
    category: "Performance Engineering",
    before: "3.8s sluggish",
    after: "380ms 120Hz",
    delta: "-89%",
    isReduction: true,
    notes: "Native SQLite/Room caching, compiled queries, and edge CDN distribution."
  },
  {
    title: "Inbound Lead Qualification & Reply",
    category: "AI Autonomous Agents",
    before: "4.2 hrs delay",
    after: "12 seconds",
    delta: "-99%",
    isReduction: true,
    notes: "Instant WhatsApp Business API voice/text qualification and direct calendar booking."
  },
  {
    title: "DevOps & Webhook Failure Rate",
    category: "Business DevOps",
    before: "14% silent drops",
    after: "0 silent drops",
    delta: "99.98% SLA",
    isReduction: false,
    notes: "Idempotent queues, Dockerized self-healing daemon containers, and instant retry alerting."
  }
];

export const ProofSection: React.FC = () => {
  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#07090E] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header inspired by digi.ai.in */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/5">
          <div className="max-w-2xl">
            <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase block mb-3">
              // Proof & Engineering Benchmarks
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white tracking-tight font-['Outfit']">
              Baseline in. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">
                Delta out.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/60 font-light leading-relaxed">
              Every build starts by measuring what your business already reports on. It ends only when that measurement moves permanently.
            </p>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-xs font-mono text-white/40 uppercase block">Guarantee Standard</span>
            <span className="text-white font-mono text-sm font-semibold text-[#CCFF00]">Agreed in writing before Day 1</span>
          </div>
        </div>

        {/* 4 Proof Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENCHMARKS.map((b, idx) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-2">
                  {b.category}
                </span>
                <h3 className="text-white font-bold text-base font-['Outfit'] mb-4">
                  {b.title}
                </h3>

                {/* Delta Callout */}
                <div className="my-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-white/40 block">Delta Moved</span>
                    <span className="text-xl sm:text-2xl font-black text-[#CCFF00] font-['Outfit']">
                      {b.delta}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00]">
                    <Zap size={16} />
                  </div>
                </div>

                {/* Before / After Comparison */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs font-mono">
                  <div className="flex items-center justify-between text-white/50">
                    <span>Before:</span>
                    <span className="text-red-400/80 line-through">{b.before}</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-emerald-400 font-bold">After AGX:</span>
                    <span className="text-emerald-400 font-bold">{b.after}</span>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-xs text-white/60 font-light leading-relaxed border-t border-white/5 pt-3">
                {b.notes}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm font-['Outfit'] uppercase">
                Contractual SLA & 30-Day Risk Guarantee
              </h4>
              <p className="text-xs text-white/60 font-light">
                If the targeted operational metric does not move as specified, we continue optimizing at zero additional cost until it does.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xs font-mono text-[#CCFF00] font-semibold uppercase">
              100% Client Codebase Ownership
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

