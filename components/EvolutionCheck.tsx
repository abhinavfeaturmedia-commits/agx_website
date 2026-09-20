
import React from 'react';
import { motion } from 'motion/react';
import { LayoutTemplate, Rocket, Check, X } from 'lucide-react';

const EvolutionCheck: React.FC = () => {
  return (
    <section className="px-6 md:px-12 py-32 bg-transparent overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-7xl font-normal uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">SHIFT</span>
          </h2>
          <p className="text-white/60 font-light max-w-lg mx-auto mt-4">
            Why settle for human limitations when you can have a high-performance AI engine?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Standard Website */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white/[0.02] backdrop-blur-sm p-8 border border-white/10 rounded-2xl relative flex flex-col gap-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "var(--font-display)" }}>Hiring Staff</h3>
                <div className="text-[10px] font-mono uppercase text-white/40 mt-2 tracking-widest">The Old Way</div>
              </div>
              <div className="text-white/40"><LayoutTemplate size={32} strokeWidth={1.5} /></div>
            </div>

            <div className="flex flex-col gap-4 text-sm font-medium border-t border-white/5 pt-6">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Performance</span>
                <span className="text-white/70 flex items-center gap-2">Variable <X size={16} className="text-white/40" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Availability</span>
                <span className="text-white/70 flex items-center gap-2">40 Hours/Week <X size={16} className="text-white/40" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Accuracy</span>
                <span className="text-white/70 flex items-center gap-2">Prone to Error <X size={16} className="text-white/40" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/50">Cost Structure</span>
                <span className="text-white/70 flex items-center gap-2">Sunk Salary <X size={16} className="text-white/40" /></span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="w-full bg-white/5 text-white/40 py-3 text-center text-xs font-semibold rounded-lg uppercase tracking-wider border border-white/10">
                Status: Outdated
              </div>
            </div>
          </motion.div>

          {/* Conversion Engine */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="bg-white/[0.05] backdrop-blur-md p-8 border border-white/10 rounded-2xl relative flex flex-col gap-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            <div className="absolute -top-3 -right-3 bg-white/10 text-white/80 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md">
              The Standard
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-normal text-white" style={{ fontFamily: "var(--font-display)" }}>AI Architecture</h3>
                <div className="text-[10px] font-mono uppercase text-white/80 mt-2 tracking-widest">The New Way</div>
              </div>
              <div className="text-white/80"><Rocket size={32} strokeWidth={1.5} /></div>
            </div>

            <div className="flex flex-col gap-4 text-sm font-medium border-t border-white/5 pt-6">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">Performance</span>
                <span className="text-white flex items-center gap-2">Constant 100% <Check size={16} className="text-white/80" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">Availability</span>
                <span className="text-white flex items-center gap-2">24/7/365 <Check size={16} className="text-white/80" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">Accuracy</span>
                <span className="text-white flex items-center gap-2">Flawless <Check size={16} className="text-white/80" /></span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-white/60">Cost Structure</span>
                <span className="text-white flex items-center gap-2">Predictable ROI <Check size={16} className="text-white/80" /></span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <a href="https://wa.me/918698324316" target="_blank" rel="noopener noreferrer" className="liquid-glass w-full relative group overflow-hidden rounded-lg px-8 py-4 text-sm font-medium text-white transition-all hover:scale-[1.02] flex items-center justify-center">
                <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wider">
                  Upgrade Your Operations
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EvolutionCheck;
