import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Handshake, ArrowRight, Users, TrendingUp, DollarSign } from 'lucide-react';

interface PartnerProgramProps {
  onBecomePartnerClick?: () => void;
  onPartnerLoginClick?: () => void;
}

const PartnerProgram: React.FC<PartnerProgramProps> = ({
  onBecomePartnerClick,
  onPartnerLoginClick
}) => {
  const [referrals, setReferrals] = useState(2);
  const [projectSize, setProjectSize] = useState(8000);
  const [commissionRate, setCommissionRate] = useState(0.10);

  const monthlyEarnings = referrals * projectSize * commissionRate;
  const yearlyEarnings = monthlyEarnings * 12;

  return (
    <section className="px-6 md:px-12 py-20 md:py-24 bg-transparent border-t border-white/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium tracking-wide uppercase mb-4 backdrop-blur-sm">
            <Handshake size={14} />
            Referral Program
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal uppercase text-white tracking-tight leading-[1.08] max-w-4xl" style={{ fontFamily: "var(--font-display)" }}>
            PARTNER WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">AGX.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-2xl font-light">
            Are you a web designer, digital marketing agency, or consultant? You already have our ideal clients—they just can't automate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Value Prop */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <DollarSign className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">10–15% Referral Commission</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Earn a generous cut for every client you send our way. A single referral partner can passively send 2–3 clients per month, adding a significant new revenue stream to your business.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">You Keep the Client</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    We handle the complex AI and automation infrastructure. You continue providing your core services (design, marketing, consulting) while looking like a hero to your clients.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">Passive Scaling</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    No technical knowledge required on your end. Just make the introduction, and we take care of the scoping, building, and deployment. You get paid when they sign.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-4">
              {onBecomePartnerClick ? (
                <button 
                  onClick={onBecomePartnerClick}
                  className="liquid-glass inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 group cursor-pointer"
                >
                  <span>Become a Partner</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <a 
                  href="https://wa.me/918698324316?text=I'm%20interested%20in%20the%20AGX%20Partner%20Program" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="liquid-glass inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <span>Become a Partner</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              )}

              {onPartnerLoginClick && (
                <button
                  onClick={onPartnerLoginClick}
                  className="px-6 py-4 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                >
                  Partner Sign In →
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Side: Calculator */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl transform rotate-3 scale-105 border border-white/5"></div>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 relative z-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h3 className="text-2xl font-normal text-white mb-8" style={{ fontFamily: "var(--font-display)" }}>
                COMMISSION CALCULATOR
              </h3>
              
              <div className="flex flex-col gap-8">
                {/* Slider 1: Referrals */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-white/80">Referrals per month</label>
                    <span className="text-xl font-mono text-white">{referrals}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={referrals} 
                    onChange={(e) => setReferrals(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* Slider 2: Project Size */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-white/80">Average project size</label>
                    <span className="text-xl font-mono text-white">${projectSize.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1500" 
                    max="25000" 
                    step="500"
                    value={projectSize} 
                    onChange={(e) => setProjectSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>

                {/* Commission Rate */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-white/80">Commission Rate</label>
                    <span className="text-xl font-mono text-white">{Math.round(commissionRate * 100)}%</span>
                  </div>
                  <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg">
                    <button 
                      onClick={() => setCommissionRate(0.10)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${commissionRate === 0.10 ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      10% Standard
                    </button>
                    <button 
                      onClick={() => setCommissionRate(0.15)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${commissionRate === 0.15 ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      15% Premium
                    </button>
                  </div>
                </div>
                
                {/* Results */}
                <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60 uppercase tracking-widest font-mono">Monthly Income</span>
                    <span className="text-3xl font-normal text-emerald-400" style={{ fontFamily: "var(--font-display)" }}>
                      ${monthlyEarnings.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px w-full bg-white/10"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/60 uppercase tracking-widest font-mono">Yearly Income</span>
                    <span className="text-3xl font-normal text-white" style={{ fontFamily: "var(--font-display)" }}>
                      ${yearlyEarnings.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <p className="text-[10px] text-white/40 text-center uppercase tracking-widest mt-2">
                  * Note: 15% commission unlocks once you deliver at least 2 clients.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnerProgram;
