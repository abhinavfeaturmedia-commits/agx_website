import React, { useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Clock, DollarSign, Activity, Rocket } from 'lucide-react';

const AnimatedNumber = ({ value, suffix = "", prefix = "" }: { value: number, suffix?: string, prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1600;
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = value / steps;
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const statsData = [
  {
    icon: <Clock size={16} className="text-[#CCFF00]" />,
    value: 250,
    prefix: "",
    suffix: "+",
    label: "Hours Saved Monthly",
    sublabel: "Per Client Engineering Team",
    borderGlow: "hover:border-[#CCFF00]/40"
  },
  {
    icon: <DollarSign size={16} className="text-emerald-400" />,
    value: 140,
    prefix: "$",
    suffix: "k+",
    label: "Annual Payroll Preserved",
    sublabel: "Eliminating Overhead Bloat",
    borderGlow: "hover:border-emerald-500/40"
  },
  {
    icon: <Activity size={16} className="text-blue-400" />,
    value: 99.9,
    prefix: "",
    suffix: "%",
    label: "Execution Uptime SLA",
    sublabel: "Deterministic Error Fallbacks",
    borderGlow: "hover:border-blue-500/40",
    isDecimal: true
  },
  {
    icon: <Rocket size={16} className="text-purple-400" />,
    value: 14,
    prefix: "",
    suffix: " Days",
    label: "Discovery to Production",
    sublabel: "Turnkey Done-For-You Delivery",
    borderGlow: "hover:border-purple-500/40"
  }
];

const Stats: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 22 } }
  };

  return (
    <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16 bg-transparent relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-[#CCFF00]/5 blur-[140px] rounded-full pointer-events-none"></div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto relative z-10"
      >
        {statsData.map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={item}
            className="double-bezel-outer group"
          >
            <div className="double-bezel-inner p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {stat.icon}
                </span>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                  Metric 0{idx + 1}
                </span>
              </div>

              <div>
                <div 
                  className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none font-['Outfit']"
                >
                  {stat.isDecimal ? (
                    <span>99.9%</span>
                  ) : (
                    <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/90 mt-3">
                  {stat.label}
                </div>
                <div className="text-[11px] font-mono text-white/40 mt-1">
                  {stat.sublabel}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Stats;
