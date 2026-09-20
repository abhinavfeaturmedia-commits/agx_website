import React from 'react';
import { motion } from 'motion/react';
import { PhoneCall, ClipboardCheck, Zap, Rocket, BarChart } from 'lucide-react';

const timelineSteps = [
  {
    day: "Day 1",
    title: "Discovery Call",
    description: "We dive deep into your current workflows, identify bottlenecks, and map out your automation potential.",
    icon: <PhoneCall className="w-5 h-5 text-white" />
  },
  {
    day: "Day 3",
    title: "Audit & Plan Delivered",
    description: "You receive a comprehensive automation roadmap detailing exactly what we'll build and the expected ROI.",
    icon: <ClipboardCheck className="w-5 h-5 text-white" />
  },
  {
    day: "Day 7",
    title: "First Automation Live",
    description: "We deploy your first high-impact automation so you can start seeing time savings immediately.",
    icon: <Zap className="w-5 h-5 text-white" />
  },
  {
    day: "Day 14",
    title: "Full System Deployed",
    description: "Your complete automation ecosystem is built, tested, and integrated seamlessly into your business.",
    icon: <Rocket className="w-5 h-5 text-white" />
  },
  {
    day: "Day 30",
    title: "Review & Optimize",
    description: "We analyze the performance, gather your feedback, and fine-tune the systems for maximum efficiency.",
    icon: <BarChart className="w-5 h-5 text-white" />
  }
];

const OnboardingTimeline: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium tracking-wide uppercase mb-4 backdrop-blur-sm">
            Onboarding Timeline
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            WHAT HAPPENS <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">NEXT.</span>
          </h2>
          <p className="text-sm md:text-base text-white/60 mt-4 max-w-xl font-light">
            No guesswork. No anxiety. Just a clear, predictable path from signing up to seeing your first automated results.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent md:-translate-x-1/2"></div>

          <div className="flex flex-col gap-12 md:gap-8">
            {timelineSteps.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`relative flex justify-end md:justify-between items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-[28px] md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--background))] border-2 border-white/10 z-10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>

                  {/* Empty space for the other side on desktop */}
                  <div className="hidden md:block w-[45%]"></div>

                  {/* Content Box */}
                  <div className={`w-full md:w-[45%] pl-20 md:pl-0 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="p-8 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors duration-300 relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                      
                      <div className={`inline-flex px-3 py-1 rounded-md bg-white/10 text-white text-sm font-medium tracking-wider uppercase mb-4 ${isEven ? 'md:ml-auto' : ''}`}>
                        {step.day}
                      </div>
                      <h3 className="text-2xl font-normal text-white mb-3 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                        {step.title}
                      </h3>
                      <p className="text-white/60 font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default OnboardingTimeline;
