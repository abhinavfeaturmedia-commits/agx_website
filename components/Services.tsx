import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Bot, Workflow, Database, Megaphone, TrendingUp, Code, Layout, ShoppingCart, X, CheckCircle2, Clock, Zap, ShieldCheck } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  replacesPains: string;
  shortDesc: string;
  icon: React.ReactNode;
  deliverables: string[];
  timeline: string;
  stack: string[];
  isFeatured?: boolean;
}

interface ServicesProps {
  onSelectService?: (serviceName: string) => void;
}

const services: ServiceItem[] = [
  {
    id: "SYSTEM_01",
    title: "24/7 AUTONOMOUS FRONT-OFFICE",
    category: "AI VOICE & TEXT AGENTS",
    replacesPains: "Replaces $4,500/mo Tier-1 support overhead & 4-hour lead delays",
    shortDesc: "Autonomous AI agents handling customer inquiries, qualifying inbound leads, and booking appointments around the clock with zero human lag.",
    icon: <Bot className="w-6 h-6" />,
    isFeatured: true,
    deliverables: [
      "24/7 WhatsApp, Email & Webchat voice/text agents",
      "Instant calendar booking & qualified CRM sync",
      "Deterministic escalation to human staff when needed",
      "Custom knowledge base trained on your company SOPs"
    ],
    timeline: "7–10 Business Days",
    stack: ["OpenAI", "Claude 3.5", "WhatsApp Business API", "n8n", "Make"]
  },
  {
    id: "SYSTEM_02",
    title: "ZERO-TOUCH MULTI-APP SYNC",
    category: "OPERATIONAL WORKFLOW ENGINES",
    replacesPains: "Eliminates 15+ hrs/wk manual copy-pasting between CRM, Sheets & Stripe",
    shortDesc: "End-to-end event-driven architecture connecting your billing, CRM, ERP, and communication channels. Flawless data synchronization with zero manual touch.",
    icon: <Workflow className="w-6 h-6" />,
    isFeatured: true,
    deliverables: [
      "Full cross-platform syncing (Stripe, HubSpot/Airtable, Slack, Sheets)",
      "Automated proposal & GST invoice generation upon deal closed",
      "Automated client onboarding triggers & email sequences",
      "Self-healing error monitoring webhooks with auto-retry logic"
    ],
    timeline: "10–14 Business Days",
    stack: ["n8n", "Make.com", "Webhooks", "PostgreSQL", "Supabase"]
  },
  {
    id: "SYSTEM_03",
    title: "PREDICTIVE DATA & REPORTING",
    category: "OPERATIONAL INTELLIGENCE",
    replacesPains: "Eliminates messy multi-spreadsheet chaos & blind decision-making",
    shortDesc: "Transform siloed company data into automated executive dashboards and proactive Slack digests that predict revenue leaks before they happen.",
    icon: <Database className="w-6 h-6" />,
    deliverables: [
      "Real-time KPI & revenue dashboard generation",
      "Automated Monday morning executive digest to Slack/WhatsApp",
      "Single source of truth data modeling (Supabase / BigQuery)",
      "Cohort churn and customer LTV prediction models"
    ],
    timeline: "10–14 Business Days",
    stack: ["Supabase", "Airtable", "PostgreSQL", "Google BigQuery"]
  },
  {
    id: "SYSTEM_04",
    title: "DIGITAL OUTBOUND AUTOMATION",
    category: "PIPELINE ENGINE",
    replacesPains: "Replaces manual SDR prospecting & cold outreach burnout",
    shortDesc: "Data-driven prospect research, automated lead enrichment, and hyper-personalized multi-channel outreach sequences that book qualified meetings.",
    icon: <Megaphone className="w-6 h-6" />,
    deliverables: [
      "Automated lead scraping & firmographic enrichment",
      "Personalized multi-channel outbound email/LinkedIn flows",
      "Real-time intent data tracking & calendar routing",
      "Live conversion attribution & pipeline velocity tracking"
    ],
    timeline: "14 Business Days",
    stack: ["Clay", "Apollo", "Instantly", "Perplexity API"]
  },
  {
    id: "SYSTEM_05",
    title: "BUSINESS SCALING BLUEPRINTS",
    category: "OPERATIONS ADVISORY",
    replacesPains: "Eliminates operational bottlenecks preventing rapid expansion",
    shortDesc: "Complete operational architecture audit to restructure company SOPs into autonomous software pipelines ready for 5x customer throughput.",
    icon: <TrendingUp className="w-6 h-6" />,
    deliverables: [
      "Comprehensive company friction & time-leak audit",
      "Delegation matrix & autonomous software blueprint",
      "Team operational training portal with recorded SOPs",
      "SLA compliance & automated task escalation rules"
    ],
    timeline: "14–21 Business Days",
    stack: ["Notion", "ClickUp", "Slack", "Custom Architecture"]
  },
  {
    id: "SYSTEM_06",
    title: "BESPOKE CLIENT PORTALS & SAAS",
    category: "FULL-STACK ENGINEERING",
    replacesPains: "Replaces fragile generic No-Code apps with enterprise-grade software",
    shortDesc: "High-performance bespoke client portals, customer ticketing systems, and internal SaaS tools engineered with React, TypeScript, and enterprise security.",
    icon: <Code className="w-6 h-6" />,
    deliverables: [
      "Ultra-fast React / Next.js builds with enterprise architecture",
      "Passwordless encrypted client issue portals with direct links",
      "Row-level security database design & audit logging",
      "Integrated payment gateways (Stripe, Razorpay, PayPal)"
    ],
    timeline: "14–21 Business Days",
    stack: ["React", "TypeScript", "TailwindCSS", "Node.js", "Supabase"]
  },
  {
    id: "SYSTEM_07",
    title: "HIGH-CONVERTING UI/UX SYSTEMS",
    category: "INTERFACE DESIGN",
    replacesPains: "Eliminates low-converting ugly templates and confusing user flows",
    shortDesc: "Award-caliber digital interfaces engineered with Apple-tier spatial micro-interactions, high-contrast typography, and frictionless UX journeys.",
    icon: <Layout className="w-6 h-6" />,
    deliverables: [
      "Conversion-optimized wireframing & friction-elimination mapping",
      "Interactive high-fidelity Figma prototypes with design systems",
      "Comprehensive typography, color token, and component specs",
      "Mobile-first responsive UX execution ready for developers"
    ],
    timeline: "7–12 Business Days",
    stack: ["Figma", "Design Systems", "Prototyping", "WCAG AAA"]
  },
  {
    id: "SYSTEM_08",
    title: "ECOMMERCE REVENUE RECAPTURE",
    category: "COMMERCE AUTOMATION",
    replacesPains: "Recaptures 18-24% of lost checkout revenue from abandoned carts",
    shortDesc: "Autonomous abandoned checkout recapture flows, predictive reorder reminders, and real-time inventory synchronization across all sales channels.",
    icon: <ShoppingCart className="w-6 h-6" />,
    deliverables: [
      "WhatsApp & SMS abandoned checkout recovery flows",
      "Predictive reorder prompts based on past customer buying cycles",
      "Multi-warehouse inventory syncing (Shopify, WooCommerce, ERP)",
      "Automated customer review sentiment & ticket routing"
    ],
    timeline: "10–14 Business Days",
    stack: ["Shopify", "WooCommerce", "Klaviyo", "OpenAI"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const }
  }
};

const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeModalService, setActiveModalService] = useState<ServiceItem | null>(null);

  const handleOpenDetail = (service: ServiceItem) => {
    setActiveModalService(service);
  };

  const handleBookService = (service: ServiceItem) => {
    setActiveModalService(null);
    if (onSelectService) {
      onSelectService(service.title);
    }
  };

  return (
    <section id="services" className="px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-transparent border-t border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#CCFF00] text-xs font-mono uppercase tracking-widest mb-4 backdrop-blur-sm">
              <Zap size={13} /> Turnkey Automation Systems
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-tight leading-[1.08] font-['Outfit']">
              AUTONOMOUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">WORKFORCES.</span>
            </h2>
            <p className="mt-3 text-white/60 text-sm md:text-base max-w-xl font-light leading-relaxed">
              We do not sell generic hourly consulting. We design, engineer, and deploy turnkey operational systems guaranteed to eliminate repetitive payroll waste.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Target Deployment Velocity</span>
            <span className="text-2xl md:text-3xl font-extrabold text-[#CCFF00] font-['Outfit'] mt-1">7–14 Business Days</span>
            <span className="text-[11px] text-white/50 font-light mt-0.5">From discovery to production live</span>
          </div>
        </motion.div>

        {/* Asymmetrical Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s, idx) => {
            const isFeatured = s.isFeatured;
            return (
              <motion.div 
                key={s.id} 
                variants={itemVariants}
                onClick={() => handleOpenDetail(s)}
                className={`double-bezel-outer cursor-pointer group card-tactile ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'
                }`}
              >
                <div className="double-bezel-inner p-8 flex flex-col justify-between h-full relative overflow-hidden">
                  {/* Highlight Glow for Featured Cards */}
                  {isFeatured && (
                    <div className="absolute top-0 right-0 w-72 h-72 bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none" />
                  )}

                  <div>
                    {/* Header line */}
                    <div className="font-mono text-[10px] font-bold text-white/40 flex items-center justify-between gap-2 tracking-widest mb-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse"></span>
                        <span>{s.id}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-white/60 uppercase">{s.category}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/5 text-white/60 group-hover:text-[#CCFF00] group-hover:bg-[#CCFF00]/10 transition-colors">
                        {s.icon}
                      </div>
                    </div>

                    {/* Outcome Badge */}
                    <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase tracking-wider">
                      <ShieldCheck size={12} /> {s.replacesPains}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl sm:text-3xl font-extrabold uppercase text-white group-hover:text-[#CCFF00] transition-colors mb-3 leading-tight font-['Outfit']">
                      {s.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed mb-6 line-clamp-3">
                      {s.shortDesc}
                    </p>

                    {/* Featured deliverables preview on wide cards */}
                    {isFeatured && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 pt-4 border-t border-white/5">
                        {s.deliverables.slice(0, 2).map((d, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-xs text-white/70">
                            <span className="text-[#CCFF00] font-bold text-xs mt-0.5">✦</span>
                            <span className="line-clamp-1">{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 group-hover:text-white transition-colors flex items-center gap-1.5">
                      Scope & Architecture <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#CCFF00]" />
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/5 text-white/50 border border-white/10">
                      ⏱ {s.timeline}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Interactive Service Detail Modal */}
      <AnimatePresence>
        {activeModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="double-bezel-outer max-w-xl w-full text-white shadow-2xl overflow-hidden relative"
            >
              <div className="double-bezel-inner p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                      {activeModalService.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">{activeModalService.id} • {activeModalService.category}</span>
                      <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-['Outfit']">{activeModalService.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModalService(null)}
                    className="p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <span>{activeModalService.replacesPains}</span>
                  </div>

                  <p className="text-sm text-white/70 leading-relaxed font-light">
                    {activeModalService.shortDesc}
                  </p>

                  {/* Deliverables List */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-1.5">
                      <Zap size={13} className="text-[#CCFF00]" /> Production Deliverables Included
                    </h4>
                    <div className="space-y-2.5">
                      {activeModalService.deliverables.map((d, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                          <CheckCircle2 size={15} className="text-[#CCFF00] shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata details */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Deployment Velocity</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                        <Clock size={12} className="text-[#CCFF00]" /> {activeModalService.timeline}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Integrated Core Stack</span>
                      <span className="text-xs font-semibold text-white/80 mt-1 truncate block font-mono">
                        {activeModalService.stack.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-white/50 font-mono">100% Client IP Ownership Guaranteed</span>
                  <button
                    onClick={() => handleBookService(activeModalService)}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer btn-press shadow-lg shadow-[#CCFF00]/15"
                  >
                    <span>Request Custom System Proposal</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;
