import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NativeModal } from './ui/NativeModal';
import { 
  ArrowRight, 
  Bot, 
  Workflow, 
  Database, 
  Megaphone, 
  TrendingUp, 
  Code, 
  Layout, 
  ShoppingCart, 
  X, 
  CheckCircle2, 
  Clock, 
  Smartphone, 
  Server, 
  Layers, 
  ShieldCheck, 
  Cpu, 
  FileCode,
  Zap
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  replacesPains: string;
  shortDesc: string;
  icon: React.ReactNode;
  deliverables: string[];
  timeline: string;
  stack: string[];
  isHighlighted?: boolean;
}

interface ServicesProps {
  onSelectService?: (serviceName: string) => void;
}

const services: ServiceItem[] = [
  {
    id: "01",
    title: "Personalized WebApps (CRM, ERP, Websites)",
    category: "Core Engineering",
    replacesPains: "Replaces fragmented spreadsheets, sluggish off-the-shelf software, and monthly SaaS seat taxes",
    shortDesc: "Bespoke internal operating systems, custom CRMs tailored to your exact sales pipelines, multi-tenant ERPs with inventory controls, and blazing-fast marketing platforms.",
    icon: <Cpu className="w-5 h-5" />,
    deliverables: [
      "Custom CRM with role-based access control (RBAC) & passwordless client ticket portals",
      "Multi-tier ERP with automated invoicing, inventory ledgers & multi-branch tracking",
      "High-converting web platforms with sub-second page loads (<400ms) and AEO/SEO readiness",
      "100% full source code ownership—zero monthly per-seat software licensing fees"
    ],
    timeline: "10–14 Days",
    stack: ["React 19", "TypeScript", "PostgreSQL", "MySQL", "TailwindCSS", "Vite"],
    isHighlighted: true
  },
  {
    id: "02",
    title: "Intelligent Automations",
    category: "AI & Workflow Pipelines",
    replacesPains: "Replaces manual copy-pasting, forgotten lead follow-ups, and 4-hour customer response delays",
    shortDesc: "Multi-step autonomous agent workflows, instant WhatsApp & email lead qualification, automated CRM record syncing, and 24/7 background cron pipelines.",
    icon: <Workflow className="w-5 h-5" />,
    deliverables: [
      "24/7 WhatsApp Business API & Webchat autonomous qualification agents",
      "Automated PDF invoice generation, payment confirmation, and accounting reconciliation",
      "Idempotent webhook queues with automatic failure retries and zero silent drops",
      "Deterministic routing to human staff for VIP transactions or complex inquiries"
    ],
    timeline: "7–10 Days",
    stack: ["Python", "OpenAI", "Claude 3.5", "n8n", "WhatsApp API", "Webhooks"]
  },
  {
    id: "03",
    title: "Android App Development",
    category: "Mobile Engineering",
    replacesPains: "Eliminates sluggish web wrappers, device fragmentation crashes, and offline data loss",
    shortDesc: "High-performance native Android applications engineered with Kotlin & Jetpack Compose or React Native. Built for smooth 120Hz scrolling, offline-first SQLite/Room storage, and reliable push notifications.",
    icon: <Smartphone className="w-5 h-5" />,
    deliverables: [
      "Native Android architecture with Kotlin, Jetpack Compose or React Native",
      "Offline-first local database caching (Room / SQLite) with real-time cloud sync",
      "FCM push notifications, background services & deep linking",
      "Google Play Console deployment, signing, and production release"
    ],
    timeline: "14–21 Days",
    stack: ["Kotlin", "Jetpack Compose", "React Native", "SQLite / Room", "Firebase"]
  },
  {
    id: "04",
    title: "iOS App Development",
    category: "Apple Ecosystem",
    replacesPains: "Eliminates App Store rejections, non-native UI lag, and broken iOS permissions",
    shortDesc: "Premium iOS applications engineered with Swift, SwiftUI, or React Native. Fully compliant with Apple Human Interface Guidelines, FaceID biometric security, and TestFlight distribution.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.86 2.75 1 .08 2.01-.5 2.56-1.25z"/>
      </svg>
    ),
    deliverables: [
      "Native Swift / SwiftUI or high-performance React Native architecture",
      "FaceID/TouchID biometric authentication & Keychain encrypted storage",
      "Apple HIG compliant spatial interface with fluid 120Hz ProMotion animations",
      "TestFlight beta management & full App Store review approval"
    ],
    timeline: "14–21 Days",
    stack: ["Swift", "SwiftUI", "React Native", "Apple HIG", "TestFlight"]
  },
  {
    id: "05",
    title: "Business DevOps & Cloud Architecture",
    category: "Infrastructure & Security",
    replacesPains: "Eliminates unexpected server crashes, unmonitored silent job drops, and catastrophic data loss",
    shortDesc: "Production server provisioning, Docker containerization, automated CI/CD deployment pipelines, automated nightly database backups, and 24/7 uptime monitoring for zero-downtime operations.",
    icon: <Server className="w-5 h-5" />,
    deliverables: [
      "Dockerized isolated services with automated health-check restart policies",
      "Automated CI/CD pipelines (GitHub Actions / GitLab) with zero-downtime deployments",
      "Cloud VPS setup & server hardening (AWS, GCP, Hostinger VPS, Ubuntu Linux)",
      "Automated encrypted database backups, SSL enforcement & 99.98% uptime SLA"
    ],
    timeline: "5–7 Days",
    stack: ["Docker", "Linux / Nginx", "Hostinger VPS", "AWS / GCP", "GitHub Actions"]
  },
  {
    id: "06",
    title: "Custom API & System Integrations",
    category: "System Connectivity",
    replacesPains: "Eliminates isolated software silos, double-entry bookkeeping, and payment reconciliation chaos",
    shortDesc: "Connecting your disparate tools—payment gateways, legacy accounting software, WhatsApp bots, and third-party APIs—into one cohesive, synchronized nervous system.",
    icon: <Layers className="w-5 h-5" />,
    deliverables: [
      "Payment gateway integrations (Razorpay, Stripe) with automated tax receipt dispatch",
      "Bidirectional webhooks connecting internal databases to external SaaS tools",
      "WhatsApp Business & Slack alerting bots for high-priority operational triggers",
      "Rate-limit resilient background workers and dead-letter queue monitoring"
    ],
    timeline: "7–10 Days",
    stack: ["Node.js", "Express", "REST / GraphQL", "Stripe", "Razorpay", "Webhooks"]
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
    <section id="services" className="px-6 md:px-12 lg:px-20 py-20 md:py-28 bg-[#07090E] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header inspired by digi.ai.in */}
        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5"
        >
          <div className="max-w-3xl">
            <span className="text-xs font-mono tracking-widest text-[#CCFF00] uppercase block mb-3">
              // Core Engineering Capabilities
            </span>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase text-white tracking-tight leading-[1.05] font-['Outfit']"
            >
              What We Build. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-[#CCFF00]">
                Clearly Stated. Zero Fluff.
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base font-light text-white/70 leading-relaxed">
              We design, code, and deploy turnkey software systems that replace manual chaos with permanent, automated operating leverage.
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-white/50">
            <div>
              <span className="block text-white/30 text-[10px] uppercase">Sprint Velocity</span>
              <span className="text-white font-medium text-sm">7–14 Days Live</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div>
              <span className="block text-white/30 text-[10px] uppercase">IP Handover</span>
              <span className="text-white font-medium text-sm">100% Client Code</span>
            </div>
          </div>
        </motion.div>

        {/* 6 High-Clarity Capability Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((s) => (
            <motion.div 
              key={s.id} 
              variants={itemVariants}
              onClick={() => handleOpenDetail(s)}
              className={`group relative p-6 sm:p-7 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden min-w-0 ${
                s.isHighlighted 
                  ? 'border-[#CCFF00]/40 shadow-[0_0_30px_rgba(204,255,0,0.06)]' 
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {s.isHighlighted && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
              )}

              <div>
                {/* Header: Index + Category + Icon */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#CCFF00]">
                      {s.id}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                      {s.category}
                    </span>
                    {s.isHighlighted && (
                      <span className="px-2 py-0.5 rounded-full bg-[#CCFF00] text-black text-[9px] font-mono font-bold uppercase tracking-wider ml-1">
                        Most Requested
                      </span>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#CCFF00] group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                </div>

                {/* Title with standardized minimum height */}
                <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit'] mb-3 group-hover:text-[#CCFF00] transition-colors min-h-[3.25rem] flex items-center leading-snug">
                  {s.title}
                </h3>

                {/* What it replaces / Pain Elimination Box (Strictly bounded & wrapped) */}
                <div className="mb-4 w-full min-w-0 flex items-start gap-2 p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-300 text-xs font-mono leading-relaxed min-h-[3.5rem]">
                  <Zap size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="break-words line-clamp-2">{s.replacesPains}</span>
                </div>

                {/* Description with standardized height */}
                <p className="text-xs sm:text-sm text-white/65 font-light leading-relaxed mb-4 min-h-[4.5rem]">
                  {s.shortDesc}
                </p>

                {/* Deliverables Snippet */}
                <div className="space-y-2 py-3 border-t border-white/5">
                  {s.deliverables.slice(0, 2).map((del, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-white/80">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom: Stack & Action */}
              <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                  <Clock size={12} className="text-[#CCFF00]" />
                  <span>{s.timeline}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#CCFF00] group-hover:translate-x-1 transition-transform">
                  <span>View Architecture</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Detail Modal / Drawer with Native Top-Layer Dialog */}
        <NativeModal
          isOpen={Boolean(activeModalService)}
          onClose={() => setActiveModalService(null)}
          titleId="service-modal-title"
        >
          {activeModalService && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0B0E14] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                aria-label="Close service details"
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                  {activeModalService.icon}
                </div>
                <div>
                  <span className="text-xs font-mono text-[#CCFF00] tracking-wider uppercase block">
                    {activeModalService.id} · {activeModalService.category}
                  </span>
                  <h3 id="service-modal-title" className="text-2xl font-bold text-white font-['Outfit']">
                    {activeModalService.title}
                  </h3>
                </div>
              </div>

                <div className="my-4 p-3 rounded-xl bg-rose-500/[0.08] border border-rose-500/20 text-rose-300 text-xs font-mono flex items-start gap-2.5 leading-relaxed">
                  <Zap size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="break-words">{activeModalService.replacesPains}</span>
                </div>

                <p className="text-sm text-white/75 font-light leading-relaxed mb-6">
                  {activeModalService.shortDesc}
                </p>

                {/* Deliverables List */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/40">
                    Production Deliverables & Architecture:
                  </h4>
                  {activeModalService.deliverables.map((del, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/90">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Pills */}
                <div className="mb-6 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-2">
                    Engineered With:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalService.stack.map(tech => (
                      <span key={tech} className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/5 text-white/70 border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div className="text-xs font-mono text-white/50">
                    <span>Delivery Sprint: </span>
                    <strong className="text-white">{activeModalService.timeline}</strong>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleBookService(activeModalService)}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#CCFF00]/20"
                    >
                      <span>Claim Architecture Proposal</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </NativeModal>

      </div>
    </section>
  );
};

export default Services;
