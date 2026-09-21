import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onGetStartedClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStartedClick }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const scrollToServices = () => {
    const elem = document.getElementById('services');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-6 pt-24 pb-14 md:pt-28 md:pb-16">
      {/* Background Video with Dark Fallback Gradient */}
      <div className="absolute inset-0 bg-[#07090E] z-0 pointer-events-none overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover opacity-85"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/60 via-[#07090E]/20 to-[#07090E]/90 pointer-events-none" />
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#CCFF00]/10 blur-[140px] rounded-full pointer-events-none z-1" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto">
        {/* Value Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono tracking-wider uppercase mb-6 backdrop-blur-md"
        >
          <Sparkles size={12} className="text-[#CCFF00]" />
          <span>Custom CRM • Android Apps • AI Automations</span>
        </motion.div>

        {/* High-Impact Outcome Headline (Hormozi Option 2) */}
        <h1 
          className="text-white font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.08] tracking-tight max-w-5xl animate-fade-rise uppercase font-['Outfit'] drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]"
        >
          SCALE YOUR OPERATIONS.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#CCFF00]">
            WITHOUT HIRING MORE HEADCOUNT.
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-white/85 max-w-xl font-light leading-relaxed animate-fade-rise-delay drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          We build custom CRMs, mobile Android apps, and AI automations that reclaim 40+ hours every week. <strong className="font-semibold text-white">100% Done-For-You — live in 14 days.</strong>
        </p>

        {/* Action Controls with Button-in-Button */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto animate-fade-rise-delay-2">
          {onGetStartedClick ? (
            <button
              type="button"
              onClick={onGetStartedClick}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/20 cursor-pointer btn-press"
            >
              <span>Claim Free Operations Audit</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} className="text-black" />
              </span>
            </button>
          ) : (
            <a 
              href="https://wa.me/918698324316" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] shadow-xl shadow-[#CCFF00]/20 cursor-pointer btn-press"
            >
              <span>Claim Free Operations Audit</span>
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight size={13} className="text-black" />
              </span>
            </a>
          )}

          <button
            onClick={scrollToServices}
            className="w-full sm:w-auto px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer btn-press rounded-full border border-white/10 hover:border-white/20 bg-white/5"
          >
            <span>Explore Turnkey Systems</span>
            <ArrowDown size={14} className="animate-bounce text-[#CCFF00]" />
          </button>
        </div>

        {/* Grand Slam Risk-Reversal Callout */}
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

        {/* Under-Hero Credibility Trust Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-10 pt-6 border-t border-white/10 w-full max-w-4xl flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.25em]">
            Engineered for founders & operators processing 50,000+ operations monthly
          </span>
          <div className="flex items-center justify-center gap-8 md:gap-12 opacity-70 hover:opacity-100 transition-all flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 99.9% Production SLA
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#CCFF00]" /> 14-Day Delivery Sprint
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> 100% Client IP Ownership
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
