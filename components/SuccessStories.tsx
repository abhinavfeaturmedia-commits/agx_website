import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Quote, X, CheckCircle2, TrendingUp, Cpu, Building2, Sparkles } from 'lucide-react';

interface SuccessStoriesProps {
  onOpenConsultation?: (service?: string, notes?: string) => void;
}

interface CaseStudyDetail {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  metric: string;
  metricDesc: string;
  accent: string;
  bgAccent: string;
  borderColor: string;
  size: string;
  challenge: string;
  solution: string;
  techStack: string[];
  results: string[];
}

const testimonials: CaseStudyDetail[] = [
  {
    id: "CASE_01",
    name: "SARAH JENKINS",
    role: "CEO",
    company: "FLOWSTATE SAAS",
    quote: "The AI agent handles 80% of our tier-1 support tickets now. Our team finally has time to focus on high-value client relationships.",
    metric: "80%",
    metricDesc: "TICKETS AUTOMATED",
    accent: "text-white/90",
    bgAccent: "group-hover:bg-white/5",
    borderColor: "group-hover:border-white/30",
    size: "SCALED",
    challenge: "Support inbox flooded with 600+ repetitive tier-1 tickets daily. Average response time was 6.5 hours, hurting NPS scores.",
    solution: "Custom multi-agent triage system with real-time vector search on knowledge base and automated escalation triggers.",
    techStack: ["Claude 3.5 Sonnet", "n8n Workflow Engine", "Zendesk API", "Supabase Vector"],
    results: [
      "Response time dropped from 6.5 hours to 28 seconds",
      "80% resolved autonomously without human touch",
      "Customer satisfaction increased from 82% to 98.4%"
    ]
  },
  {
    id: "CASE_02",
    name: "MARCUS CHEN",
    role: "COO",
    company: "OMNILOG FREIGHT",
    quote: "We were drowning in manual data entry. The new automated workflow saves us over 40 hours every single week without a single missed shipment.",
    metric: "40hrs",
    metricDesc: "SAVED WEEKLY",
    accent: "text-white/80",
    bgAccent: "group-hover:bg-white/5",
    borderColor: "group-hover:border-white/30",
    size: "OPTIMIZED",
    challenge: "3 operations managers spent 14 hours each week transcribing PDFs, customs manifests, and warehouse receipts manually.",
    solution: "Autonomous document processing pipeline with OCR vision parsing and automated ERP sync.",
    techStack: ["GPT-4o Vision", "Custom Webhooks", "PostgreSQL", "DocParser"],
    results: [
      "42 hours of weekly repetitive admin completely eliminated",
      "Extraction accuracy reached 99.8% on messy scanned receipts",
      "Estimated annual payroll savings: $64,000+"
    ]
  },
  {
    id: "CASE_03",
    name: "ELENA RODRIGUEZ",
    role: "FOUNDER",
    company: "SCALELAB VENTURES",
    quote: "Our lead qualification process is now instant. The AI books qualified meetings with high-intent prospects around the clock while we sleep.",
    metric: "3x",
    metricDesc: "MEETINGS BOOKED",
    accent: "text-white/70",
    bgAccent: "group-hover:bg-white/5",
    borderColor: "group-hover:border-white/30",
    size: "EFFICIENCY",
    challenge: "Inbound leads went cold waiting hours for sales reps to manually research company revenue, tech stack, and LinkedIn profiles.",
    solution: "Sub-30-second inbound enrichment pipeline that scrapes prospect signals, generates custom pitches, and calendar links.",
    techStack: ["Make.com", "Clay.com", "Perplexity API", "Calendly API"],
    results: [
      "Leads contacted within 45 seconds of form submission",
      "Qualified calendar booking rate jumped from 11% to 34%",
      "3x pipeline generated without adding SDR headcount"
    ]
  }
];

const SuccessStories: React.FC<SuccessStoriesProps> = ({ onOpenConsultation }) => {
  const [selectedCase, setSelectedCase] = useState<CaseStudyDetail | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 200, damping: 20 } }
  };

  const handleOpenStudy = (study: CaseStudyDetail) => {
    setSelectedCase(study);
  };

  return (
    <section id="case-studies" className="px-6 md:px-12 py-20 md:py-24 bg-transparent text-white border-t border-white/5 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-12 md:gap-14 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-white/10 pb-8"
        >
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="bg-white/5 text-[#CCFF00] border border-[#CCFF00]/20 text-[10px] font-mono uppercase px-3 py-1 tracking-widest rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Proven Client Impact
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal uppercase tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
              REAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">RESULTS</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base font-light max-w-xl mt-3">
              We don't sell AI hype or theoretical concepts. We deliver hard operational hours saved and quantifiable revenue growth.
            </p>
          </div>
          
          <div className="flex items-center gap-8 self-end md:self-auto">
            <div className="flex flex-col items-end">
              <div className="text-3xl md:text-4xl font-normal text-white" style={{ fontFamily: "var(--font-display)" }}>99.9%</div>
              <div className="text-[10px] font-mono uppercase text-white/40 tracking-[0.2em]">Execution Uptime</div>
            </div>
            <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col items-end">
              <div className="text-3xl md:text-4xl font-normal text-[#CCFF00]" style={{ fontFamily: "var(--font-display)" }}>40+ hrs</div>
              <div className="text-[10px] font-mono uppercase text-white/40 tracking-[0.2em]">Avg Saved / Client / Wk</div>
            </div>
          </div>
        </motion.div>

        {/* Testimonial Cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((t) => (
            <motion.div 
              variants={item} 
              key={t.id} 
              onClick={() => handleOpenStudy(t)}
              className={`group relative bg-white/[0.02] backdrop-blur-sm border border-white/10 hover:bg-white/[0.05] rounded-2xl flex flex-col transition-all duration-300 hover:-translate-y-2 ${t.borderColor} overflow-hidden cursor-pointer shadow-lg`}
            >
              {/* Hover Background Reveal */}
              <div className={`absolute inset-0 ${t.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0`}></div>
              
              {/* Card Content */}
              <div className="relative z-20 flex flex-col h-full p-8">
                
                {/* Header Metadata */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{t.company}</span>
                    <span className="text-xs font-mono font-bold text-white/70">{t.id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                    {t.size}
                  </span>
                </div>

                {/* Massive Metric */}
                <div className="mb-5">
                  <div className={`text-4xl md:text-5xl font-normal leading-none ${t.accent} tracking-tighter`} style={{ fontFamily: "var(--font-display)" }}>
                    {t.metric}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#CCFF00]/80 mt-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {t.metricDesc}
                  </div>
                </div>

                {/* Quote */}
                <div className="relative flex-grow mb-6">
                  <Quote size={20} className="text-white/10 absolute -top-2 -left-2" />
                  <blockquote className="text-sm font-light leading-relaxed text-white/70 relative z-10 pl-4 border-l-2 border-white/10">
                    "{t.quote}"
                  </blockquote>
                </div>

                {/* Footer User Data */}
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase tracking-wide">{t.name}</span>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-0.5">{t.role}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/60 group-hover:text-white transition-colors">
                    Case Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4"
        >
          <button 
            onClick={() => handleOpenStudy(testimonials[0])}
            className="liquid-glass text-white px-8 py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-3 group border border-white/15 hover:border-white/30 btn-press"
          >
            <span>Explore Case Study Architectures</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#CCFF00]" />
          </button>
          
          {onOpenConsultation && (
            <button
              onClick={() => onOpenConsultation("Case Study Architecture Consultation", "Interested in seeing similar architecture tailored for our company")}
              className="text-white/60 hover:text-white text-xs font-mono uppercase tracking-widest px-6 py-4 transition-colors"
            >
              Request Custom Case Study For Your Industry →
            </button>
          )}
        </motion.div>

      </div>

      {/* Case Study Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0d1117] border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-10 text-white max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-white/10 flex items-start justify-between bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60 uppercase tracking-widest">
                      {selectedCase.id}
                    </span>
                    <span className="text-[10px] font-mono text-[#CCFF00] tracking-widest uppercase">
                      {selectedCase.company}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-normal text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {selectedCase.name} • {selectedCase.role}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm">
                {/* Metric Highlight */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Key Outcome</div>
                    <div className="text-4xl font-normal text-[#CCFF00] mt-1" style={{ fontFamily: "var(--font-display)" }}>
                      {selectedCase.metric}
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono uppercase tracking-widest text-white/70 max-w-[160px]">
                    {selectedCase.metricDesc}
                  </div>
                </div>

                {/* Challenge */}
                <div>
                  <div className="text-xs font-bold font-mono uppercase text-white/40 tracking-wider mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-red-400/80" /> The Bottleneck
                  </div>
                  <p className="text-white/70 leading-relaxed font-light">
                    {selectedCase.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div>
                  <div className="text-xs font-bold font-mono uppercase text-white/40 tracking-wider mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#CCFF00]" /> The AGX Architecture
                  </div>
                  <p className="text-white/70 leading-relaxed font-light">
                    {selectedCase.solution}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="text-xs font-bold font-mono uppercase text-white/40 tracking-wider mb-2">
                    Integrated Stack
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.techStack.map((tech, idx) => (
                      <span key={idx} className="text-[11px] font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quantified Results */}
                <div>
                  <div className="text-xs font-bold font-mono uppercase text-white/40 tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Measured Business Impact
                  </div>
                  <div className="space-y-2">
                    {selectedCase.results.map((res, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-white/80">
                        <span className="text-[#CCFF00] font-bold text-xs mt-0.5">✦</span>
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-white/50 font-light">
                  Ready to achieve identical or superior efficiency?
                </div>
                <button
                  onClick={() => {
                    const caseInfo = selectedCase;
                    setSelectedCase(null);
                    onOpenConsultation?.(
                      `Custom Implementation: ${caseInfo.company}`,
                      `Interested in reproducing results achieved in ${caseInfo.id} (${caseInfo.metric} ${caseInfo.metricDesc})`
                    );
                  }}
                  className="w-full sm:w-auto bg-[#CCFF00] text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-[#b8e600] transition-colors flex items-center justify-center gap-2 btn-press cursor-pointer"
                >
                  <span>Build This For My Team</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SuccessStories;
