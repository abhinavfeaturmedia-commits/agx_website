
import React from 'react';
import { motion } from 'motion/react';

const Marquee: React.FC = () => {
  const text = "AI AUTOMATION • WORKFLOW OPTIMIZATION • DATA SYSTEMS • INTELLIGENT AGENTS • ";
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white/[0.02] backdrop-blur-sm border-y border-white/5 overflow-hidden py-4 select-none flex"
    >
      <div className="animate-marquee whitespace-nowrap flex items-center">
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/40">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/80">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/40">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/80">{text}</span>
      </div>
      <div className="animate-marquee whitespace-nowrap flex items-center">
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/40">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/80">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/40">{text}</span>
        <span className="text-sm font-medium uppercase tracking-widest px-4 text-white/80">{text}</span>
      </div>
    </motion.div>
  );
};

export default Marquee;
