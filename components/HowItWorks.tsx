import React from 'react';
import { motion } from 'motion/react';

const steps = [
  {
    number: '01',
    title: 'Process Audit',
    description: 'We analyze your current operations, identifying bottlenecks and manual tasks ripe for automation.',
    color: 'text-white/80'
  },
  {
    number: '02',
    title: 'System Architecture',
    description: 'Our team designs custom AI workflows and integrations tailored to your specific business needs.',
    color: 'text-white/60'
  },
  {
    number: '03',
    title: 'Deploy & Scale',
    description: 'We launch your new automated systems and continuously optimize them to maximize efficiency and ROI.',
    color: 'text-white/40'
  }
];

const HowItWorks: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
  };

  return (
    <section id="how-it-works" className="px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="flex flex-col gap-4 max-w-3xl">
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-normal uppercase leading-[1.05] text-white tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Our Proven <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Methodology</span>
            </h2>
            <p className="text-base md:text-lg font-light text-white/60 max-w-2xl">
              We don't just implement tools. We build scalable automated systems engineered for maximum efficiency.
            </p>
          </div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              variants={item}
              className="relative p-7 sm:p-8 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-all duration-300 group"
            >
              <div 
                className={`text-5xl font-normal opacity-20 mb-6 ${step.color} transition-opacity duration-300 group-hover:opacity-100`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.number}
              </div>
              <h3 
                className="text-3xl font-normal uppercase mb-4 text-white tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </h3>
              <p className="text-white/60 leading-relaxed font-light">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
