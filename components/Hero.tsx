import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, ArrowRight, Sparkles, ShieldCheck, Terminal, Smartphone, Cpu, Server, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';

interface HeroProps {
  onGetStartedClick?: () => void;
}

interface FeaturedPillar {
  id: string;
  badge: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  icon: React.ReactNode;
  tags: string[];
}

const FEATURED_PILLARS: FeaturedPillar[] = [
  {
    id: 'webapps',
    badge: 'Core Specialty · 01',
    title: 'Personalized WebApps (CRM, ERP, Websites)',
    description: 'Bespoke internal operating systems, multi-tier ERPs, zero-bloat CRMs, and blazing-fast marketing platforms built on React and high-performance databases.',
    metric: '<400ms',
    metricLabel: 'P95 response time',
    icon: <Cpu className="w-4 h-4 text-[#CCFF00]" />,
    tags: ['Custom CRM', 'Multi-tenant ERP', 'Client Portals', 'PostgreSQL / MySQL']
  },
  {
    id: 'automations',
    badge: 'AI & Workflow · 02',
    title: 'Autonomous AI Automations',
    description: 'Multi-step autonomous agent workflows, instant lead qualification, automated WhatsApp & email pipelines, and 24/7 background cron synchronization.',
    metric: '100%',
    metricLabel: 'Zero silent dropped leads',
    icon: <Sparkles className="w-4 h-4 text-[#CCFF00]" />,
    tags: ['Autonomous Agents', 'WhatsApp Business API', 'n8n / Make / Python', 'Realtime Webhooks']
  },
  {
    id: 'mobile',
    badge: 'Native Mobile · 03',
    title: 'Android & iOS Mobile Apps',
    description: 'High-speed native mobile applications (Kotlin, Jetpack Compose, Swift, SwiftUI & React Native) with offline-first caching, biometric security, and app store publishing.',
    metric: '120Hz',
    metricLabel: 'Fluid frame rate',
    icon: <Smartphone className="w-4 h-4 text-[#CCFF00]" />,
    tags: ['Android (Kotlin)', 'iOS (Swift)', 'Offline-First DB', 'Push Notifications']
  },
  {
    id: 'devops',
    badge: 'Infrastructure · 04',
    title: 'Business DevOps & Cloud Architecture',
    description: 'Production server hardening, automated CI/CD pipelines, Docker containerization, VPS management (AWS, GCP, Hostinger), and 24/7 uptime monitoring.',
    metric: '99.98%',
    metricLabel: 'Production uptime SLA',
    icon: <Server className="w-4 h-4 text-[#CCFF00]" />,
    tags: ['Docker & CI/CD', 'VPS Hardening', 'Zero-Downtime Deploy', 'Automated Backups']
  }
];

const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activePillarIndex, setActivePillarIndex] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Auto-rotate pill tabs every 6 seconds if user is idle
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePillarIndex((prev) => (prev + 1) % FEATURED_PILLARS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scrollToServices = () => {
    const elem = document.getElementById('services');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentPillar = FEATURED_PILLARS[activePillarIndex];

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-20">
      {/* Background Video with Dark Fallback Gradient */}
      <div className="absolute inset-0 bg-[#07090E] z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-80"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/70 via-[#07090E]/30 to-[#07090E]/95 pointer-events-none" />
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#CCFF00]/10 blur-[150px] rounded-full pointer-events-none z-1" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto">
        {/* Studio Identity Badge inspired by digi.ai.in */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/90 text-[11px] font-mono tracking-wider uppercase mb-6 backdrop-blur-md shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
          <span>AGXperience (AGX) · AI Engineering Studio</span>
          <span className="text-white/30">|</span>
          <span className="text-[#CCFF00] font-semibold">WebApps · Automations · Mobile · DevOps</span>
        </motion.div>

        {/* Clear, Definitive Headline */}
        <h1 
          className="text-white font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.06] tracking-tight max-w-5xl uppercase font-['Outfit'] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
        >
          SOFTWARE THAT RUNS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[#CCFF00]">
            YOUR ENTIRE BUSINESS.
          </span>
        </h1>

        {/* Unambiguous What-We-Do Statement */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-white/85 max-w-2xl font-light leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          At <strong className="font-semibold text-white">AGX (AGXperience)</strong>, we engineer bespoke <strong className="font-semibold text-white">Personalized WebApps (CRM, ERP, Websites)</strong>, <strong className="font-semibold text-white">Intelligent Automations</strong>, native <strong className="font-semibold text-white">Android & iOS Apps</strong>, and bulletproof <strong className="font-semibold text-white">Business DevOps</strong>. Built to work on day one.
        </p>

        {/* Interactive Capability Switcher / Live Showcase Pill (digi.ai.in inspired) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 w-full max-w-3xl bg-[#0B0E14]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-left shadow-2xl"
        >
          {/* Top Pill Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-3 border-b border-white/5">
            {FEATURED_PILLARS.map((pillar, idx) => {
              const isActive = idx === activePillarIndex;
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillarIndex(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>0{idx + 1}</span>
                  <span className="hidden sm:inline">{pillar.title.split(' ')[0]} {pillar.title.split(' ')[1]}</span>
                  <span className="sm:hidden">{pillar.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Card Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPillar.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="pt-3 sm:pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#CCFF00] tracking-wider uppercase">
                    {currentPillar.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Production Ready
                  </span>
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg tracking-tight font-['Outfit']">
                  {currentPillar.title}
                </h3>
                <p className="text-white/70 text-xs sm:text-sm font-light leading-relaxed">
                  {currentPillar.description}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentPillar.tags.map(t => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metric Box */}
              <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5">
                <div className="text-left md:text-right">
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] block leading-none">
                    {currentPillar.metric}
                  </span>
                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block mt-1">
                    {currentPillar.metricLabel}
                  </span>
                </div>
                <button
                  onClick={scrollToServices}
                  className="text-xs font-mono text-[#CCFF00] hover:underline flex items-center gap-1 mt-2 cursor-pointer"
                >
                  <span>Specs</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
          {onGetStartedClick ? (
            <button
              type="button"
              onClick={onGetStartedClick}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/25 cursor-pointer btn-press"
            >
              <span>Claim Free Operations Audit</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} className="text-black" />
              </span>
            </button>
          ) : (
            <a 
              href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20discuss%20a%20project%20(WebApps,%20Automations,%20Mobile,%20or%20DevOps)." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/25 cursor-pointer btn-press"
            >
              <span>Claim Free Operations Audit</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} className="text-black" />
              </span>
            </a>
          )}

          <a
            href="https://wa.me/918698324316?text=Hi%20AGX,%20I'd%20like%20to%20discuss%20a%20project%20(WebApps,%20Automations,%20Mobile,%20or%20DevOps)."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer btn-press rounded-full border border-white/10 hover:border-white/20 bg-white/5"
          >
            <MessageSquare size={14} className="text-[#CCFF00]" />
            <span>WhatsApp Us Directly</span>
          </a>

          <button
            onClick={scrollToServices}
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer btn-press rounded-full border border-white/10 hover:border-white/20 bg-white/[0.02]"
          >
            <span>Explore Core Services</span>
            <ArrowDown size={14} className="text-[#CCFF00]" />
          </button>
        </div>

        {/* Risk-Reversal Callout */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-6 flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-wider flex-wrap justify-center"
        >
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck size={15} /> 30-Day Zero-Risk Guarantee:
          </span>
          <span>Save 10+ hours/week or we work for free until you do.</span>
        </motion.div>

        {/* Under-Hero Credibility Strip (digi.ai.in inspired) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-10 pt-6 border-t border-white/10 w-full max-w-4xl flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
            Production Standards · Zero Fragile No-Code Lock-In
          </span>
          <div className="flex items-center justify-center gap-6 md:gap-10 opacity-75 hover:opacity-100 transition-all flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 99.98% SLA
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" /> 14-Day Delivery Sprint
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> 100% Client IP Ownership
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> No Monthly Software Tax
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;