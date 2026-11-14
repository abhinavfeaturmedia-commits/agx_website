import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Copy, Check, CircleDot, Play, RefreshCw } from 'lucide-react';

interface LogEntry {
  type: 'meta' | 'fact' | 'how' | 'values' | 'tech';
  text: string;
}

const LOG_ENTRIES: LogEntry[] = [
  {
    type: 'meta',
    text: "The systems we build run real production companies. You can see our case studies and live demos—they are not Figma mockups."
  },
  {
    type: 'fact',
    text: "We build bespoke Personalized WebApps (CRM, ERP, Client Portals) and native Android/iOS apps that eliminate 40+ hours of weekly manual toil."
  },
  {
    type: 'how',
    text: "We start by reading the code and auditing the operational bottleneck that's already there—not by selling generic SaaS licenses."
  },
  {
    type: 'values',
    text: "We optimize for the human operator who has to run this software every day after deployment."
  },
  {
    type: 'tech',
    text: "Pure compiled engineering: React 19, TypeScript, Python, Kotlin, Swift, Docker, PostgreSQL, MySQL, and Hostinger/AWS VPS."
  },
  {
    type: 'fact',
    text: "Every build starts with the same question: What actually breaks if this service goes down, and how do we make it self-annealing?"
  },
  {
    type: 'how',
    text: "We test the network failures, duplicate webhooks, and ugly exceptions before we polish the happy path."
  },
  {
    type: 'values',
    text: "100% Client IP Ownership. You get the full Git repository, server keys, and complete documentation on day one."
  },
  {
    type: 'tech',
    text: "Business DevOps: Continuous integration, Dockerized isolated containers, automated nightly database backups, and 99.98% SLA."
  }
];

export const StudioLog: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'meta' | 'fact' | 'how' | 'values' | 'tech'>('all');
  const [timeString, setTimeString] = useState<string>('00:00:00');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEntries = filter === 'all' 
    ? LOG_ENTRIES 
    : LOG_ENTRIES.filter(item => item.type === filter);

  const getBadgeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'meta':
        return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
      case 'fact':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'how':
        return 'text-[#CCFF00] bg-[#CCFF00]/10 border-[#CCFF00]/20';
      case 'values':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'tech':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default:
        return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  const copyLog = () => {
    const text = LOG_ENTRIES.map(e => `[${e.type.toUpperCase()}] ${e.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-[#05070B] border-t border-white/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        
        {/* Header inspired by digi.ai.in */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#CCFF00] font-mono text-[11px] uppercase tracking-widest mb-3">
              <Terminal size={12} />
              <span>Studio Log · Live Telemetry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-white tracking-tight font-['Outfit']">
              Nothing to hide. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">
                Read the engineering log.
              </span>
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/60 font-light max-w-xl">
              Our engineering principles, telemetry records, and production rules. Every line in it is verified in production.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(['all', 'meta', 'fact', 'how', 'values', 'tech'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Window */}
        <div className="rounded-2xl border border-white/10 bg-[#07090E] shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
          {/* Terminal Title Bar */}
          <div className="px-4 py-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-white/50 text-xs">~/agxperience — studio.log</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE</span>
              </div>
              <span className="text-white/40 text-xs hidden sm:inline">[{timeString}]</span>
              <button
                onClick={copyLog}
                className="text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title="Copy log to clipboard"
              >
                {copied ? <Check size={13} className="text-[#CCFF00]" /> : <Copy size={13} />}
                <span className="text-[10px] uppercase hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-6 space-y-3.5 max-h-[420px] overflow-y-auto scrollbar-none">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, idx) => (
                <motion.div
                  key={`${entry.type}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 leading-relaxed hover:bg-white/[0.02] p-1.5 rounded transition-colors"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white/30 text-[11px]">[{timeString}]</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBadgeColor(entry.type)}`}>
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-white/85 text-xs sm:text-sm font-light">
                    {entry.text}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Terminal Footer Status Bar */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check size={13} /> diagnose
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check size={13} /> build
              </span>
              <span className="flex items-center gap-1.5 text-[#CCFF00]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" /> prove & scale
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#CCFF00] font-mono mt-1 sm:mt-0">
              <span className="animate-pulse">$</span>
              <span>tail -f studio.log</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

