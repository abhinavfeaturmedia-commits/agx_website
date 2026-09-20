import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';

interface TaskEliminatorProps {
  onAuditClick?: () => void;
}

const TaskEliminator: React.FC<TaskEliminatorProps> = ({ onAuditClick }) => {
  const frictionPoints = [
    "Manual Data Entry & Document Copy-Paste",
    "Repetitive Customer & Vendor Emails",
    "Inbound Lead Qualification & Enrichment",
    "Invoice Processing & Reconciliation",
    "Calendar Scheduling & Cross-timezone Conflicts",
    "Tier-1 Customer Support Ticket Routing"
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const handleAction = () => {
    if (onAuditClick) {
      onAuditClick();
    } else {
      window.open('https://wa.me/918698324316', '_blank');
    }
  };

  return (
    <section id="task-eliminator" className="px-6 md:px-12 py-20 md:py-24 bg-transparent border-t border-white/5 overflow-hidden">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono tracking-widest uppercase backdrop-blur-sm">
            <ShieldAlert size={14} className="text-[#CCFF00]" />
            Time Leaks We Plug
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            TASKS WE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">ELIMINATE</span>
          </h2>
          
          <p className="text-white/60 max-w-xl font-light text-sm md:text-base">
            Every manual click is friction burning your payroll. We map, re-architect, and automate repetitive tasks holding your top talent back.
          </p>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full max-w-3xl"
        >
          {frictionPoints.map((point, i) => (
            <motion.div variants={item} key={i} className="flex items-center gap-4 group bg-white/[0.02] backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/[0.05] hover:border-white/15 transition-all">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 text-white/40 group-hover:bg-[#CCFF00]/10 group-hover:text-[#CCFF00] transition-colors shrink-0">
                <ShieldAlert size={18} strokeWidth={2} />
              </div>
              <span className="text-sm md:text-base font-medium text-white/70 group-hover:text-white transition-colors">
                {point}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="mt-4 w-full max-w-md flex flex-col items-center gap-3"
        >
          <button 
            onClick={handleAction}
            className="w-full relative group overflow-hidden rounded-xl liquid-glass px-8 py-4 text-xs font-bold text-white transition-all flex items-center justify-center border border-white/20 hover:border-[#CCFF00]/50 btn-press cursor-pointer bg-[#CCFF00]/5 hover:bg-[#CCFF00]/10"
          >
            <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-[#CCFF00]">
              Get A Free Process Audit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <div className="text-[11px] font-mono uppercase text-white/40 tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#CCFF00]" />
            Includes Custom Automation Blueprint
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TaskEliminator;
