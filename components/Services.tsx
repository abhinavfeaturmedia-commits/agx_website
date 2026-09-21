import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Bot, Workflow, Database, Megaphone, TrendingUp, Code, Layout, ShoppingCart, X, CheckCircle2, Clock } from 'lucide-react';

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
}

interface ServicesProps {
  onSelectService?: (serviceName: string) => void;
}

const services: ServiceItem[] = [
  {
    id: "01",
    title: "Autonomous Front-Office",
    category: "AI Voice & Text",
    replacesPains: "Replaces Tier-1 support overhead & 4-hour lead delays",
    shortDesc: "Autonomous AI agents handling customer inquiries, qualifying inbound leads, and booking appointments 24/7 with zero lag.",
    icon: <Bot className="w-5 h-5" />,
    deliverables: [
      "24/7 WhatsApp, Email & Webchat voice/text agents",
      "Instant calendar booking & qualified CRM sync",
      "Deterministic escalation to human staff when needed",
      "Custom knowledge base trained on your company SOPs"
    ],
    timeline: "7–10 Days",
    stack: ["OpenAI", "Claude 3.5", "WhatsApp API", "n8n"]
  },
  {
    id: "02",
    title: "Android App Development",
    category: "Mobile Engineering",
    replacesPains: "Eliminates slow web wrappers & device fragmentation bugs",
    shortDesc: "Bespoke Android applications built with Kotlin and Jetpack Compose or React Native. Engineered for offline-first speed, push triggers, and smooth 120Hz performance.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003 0-.5516.4482-1.0002.9993-1.0002.5516 0 .9997.4486.9997 1.0002 0 .5517-.4481 1.0003-.9997 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003 0-.5516.4482-1.0002.9993-1.0002.5516 0 .9997.4486.9997 1.0002 0 .5517-.4481 1.0003-.9997 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4128 13.8533 8.125 12 8.125s-3.5902.2878-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
      </svg>
    ),
    deliverables: [
      "Native architecture with Kotlin, Jetpack Compose or React Native",
      "Offline-first local cache & real-time sync (Room/SQLite)",
      "Background services, FCM push notifications & deep linking",
      "Google Play Console deployment, signing & production launch"
    ],
    timeline: "14–21 Days",
    stack: ["Kotlin", "Jetpack Compose", "React Native", "Firebase", "Android SDK"]
  },
  {
    id: "03",
    title: "iOS App Development",
    category: "Apple Ecosystem",
    replacesPains: "Eliminates App Store rejections & unoptimized iOS UI lag",
    shortDesc: "Premium iOS applications engineered with Swift and SwiftUI or React Native. Fully compliant with Apple Human Interface Guidelines, biometrics, and App Store distribution.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.86 2.75 1 .08 2.01-.5 2.56-1.25z"/>
      </svg>
    ),
    deliverables: [
      "Native Swift / SwiftUI or high-performance React Native build",
      "FaceID/TouchID biometric authentication & Keychain security",
      "Apple HIG compliant spatial UI with smooth 120Hz ProMotion",
      "TestFlight distribution setup & full App Store review readiness"
    ],
    timeline: "14–21 Days",
    stack: ["Swift", "SwiftUI", "React Native", "Apple HIG", "TestFlight"]
  },
  {
    id: "04",
    title: "Outbound Automation",
    category: "Pipeline Engine",
    replacesPains: "Replaces manual SDR prospecting & cold outreach burnout",
    shortDesc: "Data-driven prospect research, automated lead enrichment, and hyper-personalized multi-channel sequences that book meetings.",
    icon: <Megaphone className="w-5 h-5" />,
    deliverables: [
      "Automated lead scraping & firmographic enrichment",
      "Personalized multi-channel outbound email/LinkedIn flows",
      "Real-time intent data tracking & calendar routing",
      "Live conversion attribution & pipeline tracking"
    ],
    timeline: "14 Days",
    stack: ["Clay", "Apollo", "Instantly", "Perplexity API"]
  },
  {
    id: "05",
    title: "Scaling Architecture",
    category: "Operations Advisory",
    replacesPains: "Eliminates operational bottlenecks preventing scale",
    shortDesc: "Complete operational architecture audit to restructure company SOPs into autonomous software pipelines ready for 5x throughput.",
    icon: <TrendingUp className="w-5 h-5" />,
    deliverables: [
      "Comprehensive friction & time-leak audit",
      "Delegation matrix & autonomous software blueprint",
      "Team operational training portal with recorded SOPs",
      "SLA compliance & automated task escalation rules"
    ],
    timeline: "14–21 Days",
    stack: ["Notion", "ClickUp", "Slack", "Custom Architecture"]
  },
  {
    id: "06",
    title: "Bespoke Client Portals",
    category: "Full-Stack Engineering",
    replacesPains: "Replaces fragile generic No-Code apps",
    shortDesc: "High-performance bespoke client portals, customer ticketing systems, and internal SaaS tools built with React and enterprise security.",
    icon: <Code className="w-5 h-5" />,
    deliverables: [
      "Ultra-fast React / Next.js builds with enterprise architecture",
      "Passwordless encrypted client issue portals",
      "Row-level security database design & audit logging",
      "Integrated payment gateways (Stripe, Razorpay)"
    ],
    timeline: "14–21 Days",
    stack: ["React", "TypeScript", "TailwindCSS", "Supabase"]
  },
  {
    id: "07",
    title: "High-Converting UI/UX",
    category: "Interface Design",
    replacesPains: "Eliminates low-converting templates & clunky flows",
    shortDesc: "Award-caliber digital interfaces engineered with Apple-tier spatial micro-interactions, high-contrast typography, and frictionless UX.",
    icon: <Layout className="w-5 h-5" />,
    deliverables: [
      "Conversion-optimized wireframing & journey mapping",
      "Interactive high-fidelity Figma prototypes",
      "Comprehensive typography, token, and component specs",
      "Mobile-first responsive UX execution"
    ],
    timeline: "7–12 Days",
    stack: ["Figma", "Design Systems", "Prototyping", "WCAG AAA"]
  },
  {
    id: "08",
    title: "Commerce Recapture",
    category: "Revenue Automation",
    replacesPains: "Recaptures 18–24% of lost checkout revenue",
    shortDesc: "Autonomous abandoned checkout recapture flows, predictive reorder reminders, and real-time inventory synchronization across channels.",
    icon: <ShoppingCart className="w-5 h-5" />,
    deliverables: [
      "WhatsApp & SMS abandoned checkout recovery flows",
      "Predictive reorder prompts based on past buying cycles",
      "Multi-warehouse inventory syncing (Shopify, ERP)",
      "Automated customer review sentiment & ticket routing"
    ],
    timeline: "10–14 Days",
    stack: ["Shopify", "WooCommerce", "Klaviyo", "OpenAI"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
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
    <section id="services" className="px-6 md:px-12 lg:px-20 py-20 md:py-24 bg-transparent border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        {/* Minimalist Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5"
        >
          <div className="max-w-2xl">
            <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase block mb-3">
              // Turnkey Automation Systems
            </span>
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl font-normal uppercase text-white tracking-tight leading-[1.05]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Autonomous <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50">
                Workforces
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base font-light text-white/60 leading-relaxed">
              We design, engineer, and deploy turnkey operational software and AI agents guaranteed to eliminate repetitive payroll waste.
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-white/50">
            <div>
              <span className="block text-white/30 text-[10px] uppercase">Sprint Velocity</span>
              <span className="text-white font-medium text-sm">7–14 Days Live</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <span className="block text-white/30 text-[10px] uppercase">Architecture</span>
              <span className="text-white font-medium text-sm">100% Client IP</span>
            </div>
          </div>
        </motion.div>

        {/* Minimalist Uniform 4-Column Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {services.map((s) => (
            <motion.div 
              key={s.id} 
              variants={itemVariants}
              onClick={() => handleOpenDetail(s)}
              className="group relative p-6 sm:p-7 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Top: Index + Category + Icon */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-white/60 font-semibold">{s.id}</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/40 uppercase text-[10px] tracking-wider">{s.category}</span>
                  </div>
                  <div className="text-white/40 group-hover:text-[#CCFF00] transition-colors">
                    {s.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-lg sm:text-xl font-normal uppercase text-white group-hover:text-[#CCFF00] transition-colors mb-2.5 tracking-tight leading-snug"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {s.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm font-light text-white/60 leading-relaxed line-clamp-3 mb-5">
                  {s.shortDesc}
                </p>
              </div>

              <div>
                {/* Understated Pain Relief / Value Pill */}
                <div className="mb-4 py-1.5 px-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] font-mono text-white/60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]/80 shrink-0" />
                  <span className="truncate">{s.replacesPains}</span>
                </div>

                {/* Bottom Row */}
                <div className="pt-3.5 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/50 group-hover:text-white flex items-center gap-1.5 transition-colors">
                    Scope & Stack <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#CCFF00]" />
                  </span>
                  <span className="font-mono text-[10px] text-white/40">
                    {s.timeline}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Clean Minimalist Modal */}
      <AnimatePresence>
        {activeModalService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="max-w-xl w-full text-white bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00]">
                    {activeModalService.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/40 tracking-wider uppercase block">
                      {activeModalService.id} / {activeModalService.category}
                    </span>
                    <h3 
                      className="text-xl font-normal uppercase tracking-tight text-white"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {activeModalService.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModalService(null)}
                  className="p-2 text-white/50 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-xl text-white/80 text-xs font-mono flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] shrink-0" />
                  <span>{activeModalService.replacesPains}</span>
                </div>

                <p className="text-sm text-white/70 leading-relaxed font-light">
                  {activeModalService.shortDesc}
                </p>

                {/* Deliverables List */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-3">
                    Deliverables Included
                  </h4>
                  <div className="space-y-2">
                    {activeModalService.deliverables.map((d, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                        <CheckCircle2 size={14} className="text-[#CCFF00] shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Timeline</span>
                    <span className="text-xs font-medium text-white flex items-center gap-1.5 mt-1">
                      <Clock size={12} className="text-[#CCFF00]" /> {activeModalService.timeline}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider block">Tech Stack</span>
                    <span className="text-xs font-medium text-white/80 mt-1 truncate block font-mono">
                      {activeModalService.stack.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10px] text-white/40 font-mono">100% Client IP Ownership</span>
                <button
                  onClick={() => handleBookService(activeModalService)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#CCFF00]/15"
                >
                  <span>Request Proposal</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Services;

