import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cpu,
  Workflow,
  Smartphone,
  Server,
  Layers,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  X,
  Building2,
  TrendingUp,
  Rocket,
  MapPin,
  Phone,
  Menu,
} from 'lucide-react';
import { AgxPetalyxBrand, PETALYX_ASSETS } from './ui/CherryBlossomBackdrop';
import { NativeModal } from './ui/NativeModal';

export interface ServiceDetail {
  id: string;
  title: string;
  category: string;
  timeline: string;
  icon: React.ReactNode;
  shortDesc: string;
  deliverables: string[];
  stack: string[];
  replacesPains: string;
  isPopular?: boolean;
}

const AGX_SERVICES: ServiceDetail[] = [
  {
    id: '01',
    title: 'Custom CRM & ERP WebApps',
    category: 'Core Focus • Internal OS',
    timeline: '21–30 Days',
    icon: <Cpu className="w-5 h-5" />,
    shortDesc:
      'Personalized CRM pipelines and multi-tenant ERP systems engineered around your exact operations—replacing scattered spreadsheets with real-time sales, inventory, and team accountability.',
    replacesPains:
      'Eliminates manual spreadsheet chasing, fragmented team updates, and $200/mo per-user SaaS license fees.',
    deliverables: [
      'Custom CRM with Role-Based Access Control (RBAC), pipeline tracking & client portals',
      'Multi-tenant ERP with automated GST/invoice generation & real-time inventory ledgers',
      'Executive KPI dashboards so Owners & Directors see daily numbers in 10 seconds',
      '100% full source code ownership — zero recurring per-seat licensing fees',
    ],
    stack: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL / MySQL', 'TailwindCSS', 'Vite'],
    isPopular: true,
  },
  {
    id: '02',
    title: 'Personalized WebApps & Portals',
    category: 'Core Focus • Web Engineering',
    timeline: '14–30 Days',
    icon: <Layers className="w-5 h-5" />,
    shortDesc:
      'Custom-built client portals, vendor dashboards, booking engines, and company websites built to work on day one—saving founders and directors 2–3 hours of manual coordination daily.',
    replacesPains:
      'Eliminates copy-pasting between tabs, slow generic templates, and disconnected customer touchpoints.',
    deliverables: [
      'Sub-400ms fast web application UI designed specifically for your internal team workflows',
      'Dedicated client & partner self-service portals eliminating manual status emails',
      'Seamless REST/GraphQL API connections with payment gateways & accounting tools',
      'Full private repository & infrastructure ownership upon day-one launch',
    ],
    stack: ['React 19', 'Next.js / Vite', 'TypeScript', 'REST / GraphQL', 'Razorpay / Stripe'],
  },
  {
    id: '03',
    title: 'Native Android App Development',
    category: 'Core Focus • Mobile Apps',
    timeline: '21–30 Days',
    icon: <Smartphone className="w-5 h-5" />,
    shortDesc:
      'High-performance native Android apps built for your field staff, distributors, or customers—featuring offline-first local storage and real-time sync directly into your CRM or ERP.',
    replacesPains:
      'Eliminates messy WhatsApp field reporting, sluggish web wrappers, and offline data loss.',
    deliverables: [
      'Native Android architecture engineered with Kotlin, Jetpack Compose, or React Native',
      'Offline-first local SQLite / Room storage syncing seamlessly when back online',
      'Real-time push notifications (FCM), location workflows, and role-based security',
      'Production APK/AAB builds & Google Play Console release deployment',
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'React Native', 'SQLite / Room', 'Firebase'],
    isPopular: true,
  },
  {
    id: '04',
    title: 'Native iOS App Development',
    category: 'Apple Ecosystem',
    timeline: '21–30 Days',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.86 2.75 1 .08 2.01-.5 2.56-1.25z" />
      </svg>
    ),
    shortDesc:
      'Polished native iOS applications for executives and customers—compliant with Apple Human Interface Guidelines, FaceID security, and synced seamlessly with your backend systems.',
    replacesPains:
      'Eliminates App Store review rejections, choppy web-view UX, and insecure local data.',
    deliverables: [
      'Clean Swift / SwiftUI or cross-platform React Native engineering',
      'FaceID / TouchID biometric sign-in and Keychain encrypted session security',
      'Fluid 120Hz ProMotion performance matching Apple HIG design standards',
      'TestFlight team staging distribution & production App Store deployment',
    ],
    stack: ['Swift', 'SwiftUI', 'React Native', 'Apple HIG', 'TestFlight'],
  },
  {
    id: '05',
    title: 'Intelligent Automations',
    category: 'Systemized Workflows',
    timeline: '14–30 Days',
    icon: <Workflow className="w-5 h-5" />,
    shortDesc:
      'Automated WhatsApp Business lead capture, instant invoice & payment reconciliation, approval routing, and background data pipelines—removing repetitive manual work from your team.',
    replacesPains:
      'Eliminates daily 2–3 hour manual copy-pasting, forgotten follow-ups, and slow inquiry response times.',
    deliverables: [
      'Instant WhatsApp Business API & web lead capture synced directly to your CRM',
      'Automated PDF invoice dispatch, payment verification & status notifications',
      'Resilient bidirectional webhooks with automatic retries so zero leads are dropped',
      'Custom reporting digests delivered daily to Owners & Directors automatically',
    ],
    stack: ['Python', 'Node.js', 'WhatsApp Cloud API', 'Webhooks', 'Redis Queue'],
  },
  {
    id: '06',
    title: 'Bulletproof Business DevOps',
    category: 'Infrastructure & Reliability',
    timeline: 'Within 30 Days',
    icon: <Server className="w-5 h-5" />,
    shortDesc:
      'Production server hardening, Docker containerization, automated CI/CD pipelines, encrypted nightly database backups, and continuous health monitoring—built to work reliably on day one.',
    replacesPains:
      'Eliminates unexpected server outages, manual risky deployments, and catastrophic data loss.',
    deliverables: [
      'Dockerized services with automatic health-check restarts and zero-downtime updates',
      'Hardened Cloud VPS / AWS / GCP architecture with SSL and strict firewall rules',
      'Automated encrypted daily database backups verified for fast recovery',
      'Real-time uptime & error alerting so issues are caught before staff notice',
    ],
    stack: ['Docker', 'Linux / Nginx', 'AWS / GCP', 'Hostinger VPS', 'GitHub Actions'],
  },
];

const HERO_GLASS_COORDS: [number, number][] = [
  [3, 64],
  [3, 71],
  [6.5, 71],
  [10, 71],
  [3, 78],
  [-1, 70],
  [45.5, 76],
  [49, 80],
  [49, 76],
  [52.5, 76],
  [86, 58],
  [86, 67],
  [82, 76],
  [89.5, 76],
  [86, 84],
];

const STATS_CARDS = [
  { label: 'Daily Time Saved', target: 3, dec: 0, suf: ' hrs', finalText: '2–3 hrs' },
  { label: 'Delivery Period', target: 30, dec: 0, suf: ' Days', finalText: '30 Days' },
  { label: 'Source Code Ownership', target: 100, dec: 0, suf: '%', finalText: '100%' },
  { label: 'Operational Standard', target: 1, dec: 0, suf: 'st Day', finalText: 'Day 1 Ready' },
];

const SPRINT_STEPS = [
  {
    num: '1',
    color: 'var(--olive)',
    cloud: PETALYX_ASSETS.CLOUD_B,
    pill: 'Days 1–7',
    title: 'Operations & workflow audit',
    desc: 'We audit where Owners, Directors, and staff lose 2–3 hours daily to spreadsheets and manual follow-ups—mapping a blueprint for your Custom CRM, ERP, WebApp, or Android App with zero disruption.',
    bullets: ['Operational bottleneck audit', 'Database & UI architecture'],
  },
  {
    num: '2',
    color: 'var(--green)',
    cloud: PETALYX_ASSETS.CLOUD_A,
    pill: 'Days 8–22',
    title: 'Custom build & staging checks',
    desc: 'Our engineers build your Personalized WebApps, native Android & iOS Apps, and Intelligent Automations—delivering milestone previews in staging so you verify real progress every step of the way.',
    bullets: ['Custom CRM, ERP & Android', 'Live staging milestone reviews'],
  },
  {
    num: '3',
    color: 'var(--lime)',
    cloud: PETALYX_ASSETS.CLOUD_B,
    pill: 'Days 23–30',
    title: 'DevOps & day-one launch',
    desc: 'Deployed onto hardened servers with bulletproof Business DevOps, automated backups, full staff onboarding, and 100% source code ownership—built to work cleanly on day one.',
    bullets: ['100% source code handover', 'Built to work on day one'],
  },
];

const CLIENT_ARCHETYPES = [
  {
    badge: 'Business Owners & Directors',
    title: 'Trapped in Daily Firefighting',
    icon: <Building2 className="w-5 h-5 text-[var(--olive)]" />,
    pain: 'Losing 2–3 hours every single day to Excel sheets, chasing department updates manually, and answering avoidable operational calls.',
    solution:
      'We engineer a personalized Custom CRM & ERP WebApp that centralizes leads, billing, inventory, and team accountability in one dashboard.',
    outcomes: [
      'Save 2–3 hours every single day',
      'Live numbers without chasing staff',
      'Systemized approvals & billing',
    ],
  },
  {
    badge: 'CEOs & Executive Leadership',
    title: 'Outgrowing Disconnected SaaS',
    icon: <TrendingUp className="w-5 h-5 text-[var(--olive)]" />,
    pain: 'Paying rising per-seat SaaS subscriptions while brittle Zapier chains break silently and critical team processes still rely on manual copy-pasting.',
    solution:
      'We replace fragmented glue-tools with bespoke WebApps, Intelligent Automations, and bulletproof Business DevOps tailored around your exact workflows.',
    outcomes: [
      'Zero per-user SaaS license fees',
      'Automated nightly cloud backups',
      '100% full source code ownership',
    ],
  },
  {
    badge: 'Founders & Scaling Operations',
    title: 'Needing Web & Android Apps',
    icon: <Rocket className="w-5 h-5 text-[var(--olive)]" />,
    pain: 'Frustrated by agencies quoting 6-month delivery timelines while field staff, distributors, or customers are stuck using messy WhatsApp groups.',
    solution:
      'We design and ship production-grade WebApps and native Android & iOS Apps within a disciplined 30-day delivery period—built to work on day one.',
    outcomes: [
      'Full delivery within 30 days',
      'Offline-ready Android field apps',
      'Built to work cleanly on day one',
    ],
  },
];

const FAQS = [
  {
    q: 'What does AGXperience (AGX) actually build?',
    a: 'At AGX (AGXperience), we engineer bespoke Personalized WebApps (CRM, ERP, Websites), Intelligent Automations, native Android & iOS Apps, and bulletproof Business DevOps. Built to work on day one, our systems help Business Owners, CEOs, Founders, and Directors systemize operations and save 2–3 hours daily.',
  },
  {
    q: 'How long is your delivery period?',
    a: 'Our delivery period is 30 days. Week 1 covers your operational audit and architecture blueprint, Weeks 2–3 focus on custom engineering and milestone previews in staging, and Week 4 completes DevOps hardening, team training, and day-one production launch.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'No, we do not offer refunds. Because our senior engineers and architects dedicate focused sprint capacity specifically to designing and coding your custom software from Day 1, all engagements are non-refundable. To give you complete clarity before final launch, you review working builds in staging at key milestones within the 30-day delivery period.',
  },
  {
    q: 'How do your systems help owners and directors save 2–3 hours daily?',
    a: 'Most leaders spend hours every day chasing status updates, checking scattered Excel sheets, reconciling invoices, or manually assigning tasks. We replace that manual friction with a unified Custom CRM, ERP, WebApp, or Android app powered by Intelligent Automations—giving you instant operational control.',
  },
  {
    q: 'Do we own 100% of the source code and infrastructure?',
    a: 'Yes, 100%. Every custom WebApp, CRM/ERP database schema, Android/iOS codebase, automation script, and DevOps pipeline is handed over directly to your organization with complete intellectual property rights and zero per-seat monthly fees.',
  },
];

interface PetalyxHomeProps {
  onNavigateToLogin: () => void;
  onNavigateToPortal: () => void;
  onNavigateToPartnerPortal?: () => void;
  onOpenConsultation: (service?: string, notes?: string) => void;
  isStaffLoggedIn?: boolean;
}

const SplitWords: React.FC<{ text: string; wordClass?: string }> = ({
  text,
  wordClass = 'petalyx-w',
}) => {
  const words = text.trim().split(/\s+/);
  return (
    <>
      {words.map((word, idx) => (
        <React.Fragment key={`${word}-${idx}`}>
          <span className={wordClass}>{word}</span>
          {idx < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
};

export const PetalyxHome: React.FC<PetalyxHomeProps> = ({
  onNavigateToLogin,
  onNavigateToPortal,
  onNavigateToPartnerPortal,
  onOpenConsultation,
  isStaffLoggedIn = false,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<any>(null);

  const statsGridSquares = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${((i * 7 + 3) % 29) * 48 - 10}px`,
        top: `${((i * 3 + 1) % 6) * 48 + 6}px`,
        delay: (i * 0.37) % 4,
        repeatDelay: (i * 0.53) % 3,
      })),
    []
  );

  const ctaGridSquares = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: `${((i * 9 + 1) % 28) * 48 - 10}px`,
        top: `${((i * 2 + 1) % 5) * 48 + 6}px`,
        delay: (i * 0.41) % 4,
        repeatDelay: (i * 0.61) % 3,
      })),
    []
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: `${(i * 5.7 + 3) % 99}%`,
        dx: `${((i % 7) - 3) * 24}px`,
        duration: `${9 + (i % 8) * 1.2}s`,
        delay: `-${(i * 1.1) % 14}s`,
        scale: 0.6 + (i % 5) * 0.18,
      })),
    []
  );

  const scrollToSection = (selector: string) => {
    setMobileMenuOpen(false);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { duration: 1.5 });
      return;
    }
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth <= 760;
    const gsap = (window as any).gsap;
    const ScrollTrigger = (window as any).ScrollTrigger;
    const Lenis = (window as any).Lenis;

    const updateCounters = (progress: number) => {
      const cards = document.querySelectorAll<HTMLElement>('.petalyx-ticket-card');
      cards.forEach((card) => {
        const target = parseFloat(card.dataset.to || '0');
        const decimals = parseInt(card.dataset.dec || '0', 10);
        const suffix = card.dataset.suf || '';
        const finalText = card.dataset.final;
        const valueElement = card.querySelector<HTMLElement>('.card-val');
        if (valueElement) {
          if (progress >= 0.99 && finalText) {
            valueElement.textContent = finalText;
          } else {
            valueElement.textContent = `${(target * progress).toFixed(decimals)}${suffix}`;
          }
        }
      });
    };

    if (!gsap || prefersReducedMotion) {
      setIsIntroActive(false);
      updateCounters(1);
      return;
    }

    if (ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    let lenis: any = null;
    let rafHandler: ((t: number) => void) | null = null;
    if (Lenis) {
      try {
        lenis = new Lenis({
          duration: 1.25,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
        });
        lenisRef.current = lenis;
        if (ScrollTrigger) {
          lenis.on('scroll', ScrollTrigger.update);
        }
        rafHandler = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(rafHandler);
        gsap.ticker.lagSmoothing(0);
      } catch (err) {
        console.warn('Lenis init warning:', err);
      }
    }

    const ctx = gsap.context(() => {
      // Animate pulsing grid squares & hero glass flicker
      document.querySelectorAll<HTMLElement>('.petalyx-grid-sq[data-pulse="true"]').forEach((sq) => {
        const d = parseFloat(sq.dataset.delay || '0');
        const rd = parseFloat(sq.dataset.rdelay || '1');
        gsap.fromTo(
          sq,
          { opacity: 0.08 },
          {
            opacity: 0.9,
            yoyo: true,
            repeat: -1,
            duration: 1.2,
            delay: d,
            repeatDelay: rd,
            ease: 'sine.inOut',
          }
        );
      });

      document.querySelectorAll<HTMLElement>('#heroGlass .petalyx-glass').forEach((g, idx) => {
        if (isMobile && idx % 2 === 1) {
          g.style.display = 'none';
          return;
        }
        gsap.to(g, {
          opacity: 0.15,
          duration: 0.9,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: (idx * 0.37) % 3,
          repeatDelay: 1 + ((idx * 0.53) % 3),
        });
      });

      // Reset initial counter values to 0 before scroll scrub
      updateCounters(0);

      // Intro state setup
      if (lenis) lenis.stop();
      gsap.set('#heroTitle .hero-word', { opacity: 0, y: 24, filter: 'blur(10px)' });
      gsap.set('.petalyx-nav', { opacity: 0, y: -16 });

      const setupScroll = () => {
        if (!ScrollTrigger) {
          updateCounters(1);
          return;
        }

        // Hero Parallax
        gsap.to('#heroTitle', {
          yPercent: -60,
          ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
        });
        document.querySelectorAll<HTMLElement>('#hero [data-par]').forEach((el) => {
          const p = parseFloat(el.dataset.par || '0');
          gsap.to(el, {
            y: p * 2,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
          });
        });
        gsap.to('.petalyx-hero-media', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
        });

        // Generic .reveal elements
        document.querySelectorAll<HTMLElement>('.petalyx-reveal').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 16,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 86%' },
          });
        });

        // Word blur reveals in below-the-fold headings
        document
          .querySelectorAll<HTMLElement>('#stats .petalyx-split, #loop .petalyx-split, #cta .petalyx-split')
          .forEach((heading) => {
            const words = heading.querySelectorAll('.petalyx-w');
            if (words.length) {
              gsap.from(words, {
                opacity: 0,
                y: 22,
                filter: 'blur(8px)',
                duration: 0.9,
                stagger: 0.06,
                ease: 'power3.out',
                scrollTrigger: { trigger: heading, start: 'top 82%' },
              });
            }
          });

        const mm = gsap.matchMedia();

        // Desktop: Pin #stats while counters scrub & tree rises behind cards/band
        mm.add('(min-width: 901px)', () => {
          gsap.from('.petalyx-cards .petalyx-ticket-card', {
            y: 40,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.petalyx-cards', start: 'top 72%' },
          });

          const statsTl = gsap.timeline({
            scrollTrigger: {
              trigger: '#stats',
              start: 'top top',
              end: '+=120%',
              pin: true,
              scrub: 1,
            },
          });

          const proxy = { p: 0 };
          statsTl.to(
            proxy,
            {
              p: 1,
              ease: 'none',
              onUpdate: () => updateCounters(proxy.p),
            },
            0
          );
          statsTl.fromTo('#tree', { yPercent: 75 }, { yPercent: 6, ease: 'none' }, 0);
        });

        // Tablet/Mobile: Natural flow without pin
        mm.add('(max-width: 900px)', () => {
          gsap.from('.petalyx-cards .petalyx-ticket-card', {
            y: 30,
            opacity: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.petalyx-cards', start: 'top 85%' },
          });

          const proxy = { p: 0 };
          gsap.to(proxy, {
            p: 1,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.petalyx-cards', start: 'top 82%' },
            onUpdate: () => updateCounters(proxy.p),
          });

          gsap.fromTo(
            '#tree',
            { yPercent: 40 },
            {
              yPercent: 0,
              ease: 'none',
              scrollTrigger: { trigger: '#stats', start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });

        // Hover Accordion (#loop) desktop vs mobile
        mm.add('(min-width: 761px)', () => {
          gsap.from('.petalyx-loop-panel-in', {
            y: 120,
            opacity: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: '#loop', start: 'top 62%' },
          });

          gsap.to('.petalyx-loop-cloud', {
            x: 60,
            ease: 'none',
            scrollTrigger: { trigger: '#loop', start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });

        mm.add('(max-width: 760px)', () => {
          document.querySelectorAll('.petalyx-loop-panel').forEach((panel) => {
            gsap.from(panel.children, {
              y: 40,
              opacity: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: panel, start: 'top 85%' },
            });
          });
        });

        // CTA Moonlit Scrub & Card Reveal
        gsap.fromTo(
          '#ctaImg',
          { yPercent: -12 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: { trigger: '#cta', start: 'top bottom', end: 'bottom bottom', scrub: true },
          }
        );

        gsap.from('#ctaCard', {
          y: 80,
          scale: 0.94,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: '#cta', start: 'top 62%' },
        });

        // Footer Logo 3-dots-to-AGX-brandmark animation
        gsap.set('#fRing', { strokeDashoffset: 233 });
        gsap.set('#fAgxBadge', { opacity: 0, scale: 0.45 });
        const footerTl = gsap.timeline({
          scrollTrigger: { trigger: '#footer', start: 'top 92%' },
        });
        footerTl
          .set('.fdot', { opacity: 1 })
          .to('.fdot', { y: -8, duration: 0.25, stagger: 0.08, yoyo: true, repeat: 3, ease: 'sine.inOut' })
          .to('.fdot-1, .fdot-2, .fdot-3', { cx: 40, cy: 40, duration: 0.4, ease: 'power3.inOut' })
          .to('.fdot', { opacity: 0, duration: 0.12 })
          .to('#fAgxBadge', { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2.2)' }, '-=0.05')
          .to('#fRing', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.35');

        ScrollTrigger.refresh();
      };

      const introTl = gsap.timeline({
        delay: 0.25,
        onComplete: () => {
          setIsIntroActive(false);
          if (appRef.current) {
            gsap.set(appRef.current, { clearProps: 'all' });
          }
          if (lenis) lenis.start();
          setupScroll();
        },
      });

      if (appRef.current) {
        introTl.fromTo(
          appRef.current,
          { scale: 0.9, borderRadius: 28 },
          { scale: 1, borderRadius: 0, duration: 1.4, ease: 'expo.inOut' }
        );
      }

      introTl
        .to('.petalyx-nav', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to(
          '#heroTitle .hero-word',
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: 0.07, ease: 'power3.out' },
          '-=0.7'
        )
        .fromTo('.cloud-l', { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.6, ease: 'power3.out' }, 0.4)
        .fromTo('.cloud-r', { x: 120, opacity: 0 }, { x: 0, opacity: 1, duration: 1.6, ease: 'power3.out' }, 0.4)
        .fromTo(
          '#heroGlass .petalyx-glass',
          { opacity: 0, scale: 0.6 },
          { opacity: 1, scale: 1, duration: 0.6, stagger: { each: 0.05, from: 'random' }, ease: 'back.out(2)' },
          '-=1'
        );
    }, containerRef);

    const handleLoadRefresh = () => {
      if (ScrollTrigger) ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleLoadRefresh);

    return () => {
      window.removeEventListener('load', handleLoadRefresh);
      ctx.revert();
      if (rafHandler) gsap.ticker.remove(rafHandler);
      if (lenis) lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="petalyx-theme relative w-full bg-[#e9eee0] text-[#121410] selection:bg-[#b4cd52] selection:text-[#121410] overflow-x-hidden"
    >
      {/* Fixed Intro Blurred Cherry Blossom Backdrop */}
      {isIntroActive && (
        <div
          aria-hidden="true"
          className="fixed inset-[-40px] z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${PETALYX_ASSETS.HERO_POSTER})`,
            backgroundPosition: 'center 70%',
            backgroundSize: 'cover',
            filter: 'blur(18px) saturate(1.1)',
            transform: 'scale(1.3)',
          }}
        />
      )}

      {/* Main #app Canvas Wrapper (overflow: clip so ScrollTrigger pin works) */}
      <div
        id="app"
        ref={appRef}
        className="relative z-[1] bg-white"
        style={{
          transformOrigin: '50% 50vh',
          overflow: 'clip',
          transform: isIntroActive ? 'scale(0.9)' : undefined,
          borderRadius: isIntroActive ? '28px' : undefined,
        }}
      >
        {/* =====================================================================
            4a. HERO SECTION
           ===================================================================== */}
        <section
          id="hero"
          className="petalyx-hero-section relative h-screen min-h-[620px] overflow-hidden bg-white text-[#121410]"
        >
          {/* Floating Centered Pill Nav */}
          <nav
            aria-label="Primary navigation"
            className="petalyx-nav absolute top-[16px] md:top-[22px] left-1/2 -translate-x-1/2 z-20 flex items-center justify-between gap-3 sm:gap-6 lg:gap-9 pl-3 sm:pl-4 pr-[5px] py-[5px] rounded-full bg-white/90 backdrop-blur-[8px] shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_6px_18px_rgba(0,0,0,0.06)] max-w-[calc(100vw-24px)]"
          >
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#hero');
              }}
              aria-label="AGXperience home"
              className="shrink-0 hover:opacity-85 transition-opacity"
            >
              <AgxPetalyxBrand />
            </a>

            <div className="hidden lg:flex items-center gap-5 text-[12.5px] font-medium text-[#121410]/75">
              <a
                href="#loop"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#loop');
                }}
                className="hover:text-[var(--olive)] transition-colors whitespace-nowrap"
              >
                30-Day Build
              </a>
              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#services');
                }}
                className="hover:text-[var(--olive)] transition-colors whitespace-nowrap"
              >
                Capabilities
              </a>
              <a
                href="#guarantee"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#guarantee');
                }}
                className="hover:text-[var(--olive)] transition-colors whitespace-nowrap"
              >
                Who We Serve
              </a>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#faq');
                }}
                className="hover:text-[var(--olive)] transition-colors whitespace-nowrap"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onNavigateToPortal}
                className="hidden md:inline-flex text-xs font-semibold text-[#121410]/75 hover:text-[#121410] transition-colors px-2.5 py-1.5 rounded-full hover:bg-black/5 cursor-pointer whitespace-nowrap"
              >
                Client Portal
              </button>
              {onNavigateToPartnerPortal && (
                <button
                  type="button"
                  onClick={onNavigateToPartnerPortal}
                  className="hidden sm:inline-flex text-xs font-semibold text-[#121410]/75 hover:text-[#121410] transition-colors px-2.5 py-1.5 rounded-full hover:bg-black/5 cursor-pointer whitespace-nowrap"
                >
                  Partner
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="hidden sm:inline-flex text-xs font-semibold text-[#121410]/85 hover:text-[#121410] transition-colors px-2.5 py-1.5 rounded-full hover:bg-black/5 cursor-pointer whitespace-nowrap"
              >
                {isStaffLoggedIn ? 'CRM OS' : 'Staff Login'}
              </button>
              <button
                type="button"
                onClick={() => onOpenConsultation('30-Day Operations & System Audit')}
                className="petalyx-btn text-xs sm:text-[13px]"
              >
                Book Audit
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-[#121410]/80 hover:bg-black/5 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </nav>

          {/* Compact Mobile Navigation Popover Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-[72px] left-1/2 -translate-x-1/2 z-30 w-[min(340px,calc(100vw-32px))] rounded-[22px] p-3 petalyx-card-frost">
              <div className="grid grid-cols-2 gap-1.5 text-xs font-medium mb-2">
                <a
                  href="#loop"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('#loop');
                  }}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-[#121410]"
                >
                  30-Day Build
                </a>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('#services');
                  }}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-[#121410]"
                >
                  Capabilities
                </a>
                <a
                  href="#guarantee"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('#guarantee');
                  }}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-[#121410]"
                >
                  Who We Serve
                </a>
                <a
                  href="#faq"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('#faq');
                  }}
                  className="px-3 py-2.5 rounded-xl hover:bg-white/70 text-[#121410]"
                >
                  FAQ
                </a>
              </div>
              <div className="pt-2 border-t border-[var(--line)] grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToPortal();
                  }}
                  className="py-2 px-2 rounded-xl bg-[var(--pill)] text-[#2c3a10] cursor-pointer"
                >
                  Client Portal
                </button>
                {onNavigateToPartnerPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigateToPartnerPortal();
                    }}
                    className="py-2 px-2 rounded-xl bg-[var(--pill)] text-[#2c3a10] cursor-pointer"
                  >
                    Partner
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToLogin();
                  }}
                  className="py-2 px-2 rounded-xl bg-[var(--olive)] text-[#f3f8e4] cursor-pointer"
                >
                  {isStaffLoggedIn ? 'CRM OS' : 'Staff Login'}
                </button>
              </div>
            </div>
          )}

          {/* Left & Right Drifting Clouds with Parallax */}
          <div
            className="cloud cloud-l absolute top-[-3%] left-[-5%] w-[min(44vw,640px)] max-[760px]:w-[70vw] max-[760px]:left-[-18vw] max-[760px]:top-[6%] z-[4] pointer-events-none select-none"
            data-par="-60"
          >
            <img src={PETALYX_ASSETS.CLOUD_A} alt="" className="petalyx-drift-a w-full" />
          </div>
          <div
            className="cloud cloud-r absolute top-[2%] right-[-6%] w-[min(42vw,620px)] max-[760px]:w-[66vw] max-[760px]:right-[-20vw] max-[760px]:top-[10%] z-[4] pointer-events-none select-none"
            data-par="-90"
          >
            <img src={PETALYX_ASSETS.CLOUD_B} alt="" className="petalyx-drift-b w-full" />
          </div>

          {/* Word-by-Word Blur Reveal Headline */}
          <div
            id="heroTitle"
            className="absolute z-[6] top-[20%] max-[760px]:top-[16%] inset-x-0 flex flex-col items-center text-center px-4 pointer-events-none"
          >
            <span className="hero-word petalyx-w petalyx-pill mb-3 shadow-xs">
              For Business Owners, CEOs, Founders &amp; Directors
            </span>
            <h1 className="text-[clamp(30px,4.8vw,68px)] font-normal tracking-[-0.045em] leading-[1.04] max-w-4xl">
              <SplitWords text="Save 2–3 hours daily." wordClass="hero-word petalyx-w" />
              <br />
              <em className="text-[var(--olive)] italic font-medium">
                <SplitWords text="Systemize work in 30 days." wordClass="hero-word petalyx-w" />
              </em>
            </h1>
            <p className="hero-word petalyx-w mt-4 text-xs sm:text-[13.5px] leading-relaxed text-[#121410]/85 max-w-2xl bg-white/70 backdrop-blur-[6px] rounded-2xl px-4 py-2.5 shadow-[0_4px_20px_rgba(255,255,255,0.6)]">
              At AGX (AGXperience), we engineer bespoke Personalized WebApps (CRM, ERP, Websites), Intelligent
              Automations, native Android &amp; iOS Apps, and bulletproof Business DevOps.{' '}
              <strong className="font-semibold text-[var(--olive)]">Built to work on day one.</strong>
            </p>
          </div>

          {/* Looping Cherry Blossom Valley Video */}
          <div
            className="petalyx-hero-media absolute left-0 right-0 bottom-0 h-[72%] z-[2] overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 22%)',
              maskImage: 'linear-gradient(to bottom, transparent 0, #000 22%)',
            }}
          >
            <video
              id="heroVideo"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={PETALYX_ASSETS.HERO_POSTER}
              src={PETALYX_ASSETS.HERO_VIDEO}
              className="w-full h-full object-cover object-[center_70%]"
            />
          </div>

          {/* 15 Flickering Frosted Glass Squares */}
          <div id="heroGlass" aria-hidden="true" className="absolute inset-0 z-[5] pointer-events-none">
            {HERO_GLASS_COORDS.map(([x, y], idx) => {
              const isCenter = x > 40 && x < 60;
              const size = isCenter ? 'clamp(28px, 3.4vw, 44px)' : 'clamp(36px, 5.4vw, 74px)';
              return (
                <div
                  key={idx}
                  className="petalyx-glass"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: size,
                    aspectRatio: '1',
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            4b. STATS SECTION (Pinned on Desktop + Rising Cherry Tree + Lime Tickets)
           ===================================================================== */}
        <section
          id="stats"
          className="petalyx-stats-section relative h-screen min-h-[680px] overflow-hidden bg-white text-[#121410]"
        >
          {/* Faint Pulsing Grid Squares */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[42%] z-[1] pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(#000, transparent)',
              maskImage: 'linear-gradient(#000, transparent)',
            }}
          >
            {statsGridSquares.map((sq) => (
              <div
                key={sq.id}
                className="petalyx-grid-sq"
                data-pulse="true"
                data-delay={sq.delay}
                data-rdelay={sq.repeatDelay}
                style={{ left: sq.left, top: sq.top }}
              />
            ))}
          </div>

          {/* Rising Cherry Blossom Tree */}
          <div className="petalyx-tree-wrap absolute z-[2] left-1/2 -translate-x-1/2 bottom-[-2%] w-[min(340px,58vw)] pointer-events-none select-none">
            <img id="tree" src={PETALYX_ASSETS.TREE} alt="Cherry blossom trees" className="w-full" />
          </div>

          <div className="relative z-[3] h-full flex flex-col justify-center items-center gap-[22px] px-4 max-w-5xl mx-auto">
            <span className="petalyx-pill petalyx-reveal">Built for Owners, CEOs, Founders &amp; Directors</span>

            <h2 className="petalyx-h2 petalyx-split mb-[18px]">
              <SplitWords text="Built to work on day one." />
              <br />
              <SplitWords text="Engineered to run without you." />
            </h2>

            {/* 4 Lime Ticket-Notched Cards */}
            <div className="petalyx-cards">
              {STATS_CARDS.map((card, i) => (
                <div
                  key={i}
                  data-to={card.target}
                  data-dec={card.dec}
                  data-suf={card.suf}
                  data-final={card.finalText}
                  className="petalyx-ticket-card"
                >
                  <span className="text-[10.5px] font-medium text-[#2a3410] tracking-[0.02em] uppercase">
                    {card.label}
                  </span>
                  <b className="card-val text-[clamp(26px,3vw,38px)] font-semibold tracking-[-0.04em] text-[#151a08] tabular-nums leading-none">
                    {card.finalText}
                  </b>
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="w-[min(820px,94%)] h-[10px] -mt-[18px] rounded-[50%] z-[3]"
              style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,.08), transparent)' }}
            />

            {/* Frosted Glass Band + Partner Integrations Strip */}
            <div className="relative w-[min(860px,100%)] flex justify-center items-center">
              <div
                id="band"
                aria-hidden="true"
                className="petalyx-band absolute z-[5] left-1/2 -translate-x-1/2 -top-[6px] w-[min(340px,58vw)] h-[64px] backdrop-blur-[14px] bg-white/[0.12] pointer-events-none"
                style={{
                  WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)',
                  maskImage: 'linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)',
                }}
              />
              <div className="relative z-[6] flex flex-wrap md:flex-nowrap justify-center md:justify-between items-center gap-x-[26px] gap-y-[14px] md:gap-6 w-full px-2.5 py-1.5 text-[#151515]">
                <div className="inline-flex items-center gap-1.5 text-[17px] md:text-[21px] font-bold tracking-[-0.03em] whitespace-nowrap">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" />
                  </svg>
                  slack
                </div>
                <div className="inline-flex items-center text-[17px] md:text-[21px] font-normal tracking-[-0.03em] whitespace-nowrap">
                  zapier
                </div>
                <div className="inline-flex items-center gap-1.5 text-[17px] md:text-[21px] font-bold tracking-[-0.03em] whitespace-nowrap">
                  <svg viewBox="0 0 24 24" width="20" height="18" fill="currentColor" aria-hidden="true">
                    <path d="M6 2L0 6l6 4 6-4-6-4zm12 0l-6 4 6 4 6-4-6-4zM0 14l6 4 6-4-6-4-6 4zm18-4l-6 4 6 4 6-4-6-4zM6 19.5l6 4 6-4-6-4-6 4z" />
                  </svg>
                  Dropbox
                </div>
                <div className="inline-flex items-center text-[17px] md:text-[21px] font-bold tracking-[-0.03em] whitespace-nowrap">
                  HubSpot
                </div>
                <div className="inline-flex items-center gap-1.5 text-[15px] font-medium tracking-[-0.03em] whitespace-nowrap">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-15zM7.5 7v10h2V11.2l4.8 5.8h2.2V7h-2v5.8L9.7 7H7.5z" />
                  </svg>
                  Notion
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4c. HUMAN-IN-THE-LOOP 3-PANEL HOVER ACCORDION (#loop)
           ===================================================================== */}
        <section id="loop" className="petalyx-loop-section border-t border-[var(--line)]">
          {/* Drifting Cloud with 3 Frosted Glass Squares */}
          <div
            aria-hidden="true"
            className="petalyx-loop-cloud absolute z-[3] top-[4vh] max-[760px]:top-[2vh] left-[-4vw] max-[760px]:left-[-14vw] w-[min(36vw,520px)] max-[760px]:w-[62vw] max-[760px]:opacity-90 pointer-events-none select-none"
            data-par="-50"
          >
            <div className="relative">
              <img src={PETALYX_ASSETS.CLOUD_A} alt="" loading="lazy" className="petalyx-drift-a w-full" />
              <div className="petalyx-glass" style={{ left: '6%', top: '30%', width: '15%', aspectRatio: '1' }} />
              <div className="petalyx-glass" style={{ left: '23%', top: '58%', width: '13%', aspectRatio: '1' }} />
              <div className="petalyx-glass" style={{ left: '38%', top: '24%', width: '13%', aspectRatio: '1' }} />
            </div>
          </div>

          <div className="petalyx-loop-head absolute z-[4] top-[9vh] w-full flex flex-col items-center gap-4 px-4 text-center pointer-events-none">
            <span className="petalyx-pill petalyx-reveal">30-day delivery roadmap</span>
            <h2 className="petalyx-h2 petalyx-split">
              <SplitWords text="From operational chaos to" />
              <br />
              <SplitWords text="day-one readiness in 30 days." />
            </h2>
          </div>

          <div className="petalyx-loop-track" id="track">
            {SPRINT_STEPS.map((item, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={item.num}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isActive}
                  aria-label={`Step ${item.num}: ${item.title}`}
                  onMouseEnter={() => setActiveStep(idx)}
                  onFocus={() => setActiveStep(idx)}
                  onClick={() => setActiveStep(idx)}
                  className={`petalyx-loop-panel ${isActive ? 'is-active' : ''}`}
                >
                  <div className="petalyx-loop-panel-in">
                    <span className="petalyx-loop-num" style={{ color: item.color }}>
                      {item.num}
                    </span>
                    <div className="petalyx-loop-step">
                      <img src={item.cloud} alt="" loading="lazy" className="petalyx-mini-cloud" />
                      <span className="petalyx-pill mb-3">{item.pill}</span>
                      <h3 className="text-[clamp(20px,1.7vw,26px)] font-normal tracking-[-0.03em] mb-3 text-[#121410]">
                        {item.title}
                      </h3>
                      <p className="text-[14px] leading-[1.45] text-[#2b2e27] mb-4">{item.desc}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.bullets.map((b) => (
                          <span
                            key={b}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#f5f8ef] border border-[var(--line)] text-[#2c3a10]"
                          >
                            <CheckCircle2 size={11} className="text-[var(--olive)]" />
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            5. AGXPERIENCE CAPABILITIES SHOWCASE (#services)
           ===================================================================== */}
        <section id="services" className="relative py-24 sm:py-28 px-4 sm:px-8 bg-white border-t border-[var(--line)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="petalyx-pill mb-3 petalyx-reveal">Core engineering capabilities</span>
              <h2 className="petalyx-h2 mb-4">
                Your operations, systemized.
                <br />
                Built to work on day one.
              </h2>
              <p className="text-sm text-[#121410]/70 leading-relaxed">
                At AGX (AGXperience), we engineer bespoke Personalized WebApps (CRM, ERP, Websites), Intelligent
                Automations, native Android &amp; iOS Apps, and bulletproof Business DevOps—with 100% full source code
                ownership.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AGX_SERVICES.map((srv) => (
                <button
                  type="button"
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`group relative text-left rounded-[22px] p-6 sm:p-7 bg-white border transition-all duration-300 hover:shadow-[0_18px_40px_rgba(40,60,15,0.08)] hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                    srv.isPopular
                      ? 'border-[var(--olive)]/45 bg-gradient-to-b from-[#f9fbf5] to-white'
                      : 'border-[var(--line)] hover:border-[var(--olive)]/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-[var(--pill)] text-[var(--olive)] flex items-center justify-center">
                        {srv.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {srv.isPopular && (
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--olive)] text-[#f3f8e4]">
                            Most Requested
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[#121410]/55 flex items-center gap-1">
                          <Clock size={11} /> {srv.timeline}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium tracking-[-0.02em] text-[#121410] mb-2 group-hover:text-[var(--olive)] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-[#121410]/65 leading-relaxed mb-5">{srv.shortDesc}</p>

                    <div className="space-y-2 mb-6">
                      {srv.deliverables.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[11.5px] text-[#121410]/80">
                          <CheckCircle2 size={13} className="text-[var(--olive)] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] w-full flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {srv.stack.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#f3f6ec] text-[#121410]/70 font-mono"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--olive)] group-hover:translate-x-0.5 transition-transform shrink-0">
                      Scope <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-10 p-6 sm:p-8 rounded-[24px] bg-[var(--pill)]/80 border border-[var(--lime)]/60 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--olive)]">
                  Bespoke System Architecture
                </span>
                <h3 className="text-xl font-normal tracking-[-0.02em] text-[#121410] mt-1">
                  Running multi-branch operations or still chasing Excel sheets?
                </h3>
                <p className="text-xs text-[#121410]/70 mt-1 max-w-xl">
                  We engineer personalized Custom CRMs, ERPs, WebApps, and Android Apps tailored to how your team works—so
                  you reclaim 2–3 hours every single day.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenConsultation('30-Day Custom Architecture Audit')}
                className="petalyx-btn px-6 h-10 text-xs shrink-0"
              >
                Book Architecture Audit
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            6. WHO WE SERVE & DAY-ONE ENGINEERING STANDARD (#guarantee)
           ===================================================================== */}
        <section id="guarantee" className="py-24 px-4 sm:px-8 bg-[#fbfdf9] border-t border-[var(--line)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="petalyx-pill mb-3">Who we engineer for</span>
              <h2 className="petalyx-h2">
                Built for Business Owners, CEOs,
                <br />
                Founders &amp; Directors.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {CLIENT_ARCHETYPES.map((arch) => (
                <div
                  key={arch.title}
                  className="p-7 rounded-[22px] bg-white border border-[var(--line)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-[var(--pill)] flex items-center justify-center">
                        {arch.icon}
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--olive)] uppercase tracking-wider">
                        {arch.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-[#121410] mb-3">{arch.title}</h3>
                    <div className="mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-700 block mb-1">
                        The Bottleneck
                      </span>
                      <p className="text-xs text-[#121410]/70 leading-relaxed">{arch.pain}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--olive)] block mb-1">
                        Our Bespoke Fix
                      </span>
                      <p className="text-xs text-[#121410]/85 leading-relaxed">{arch.solution}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[var(--line)] space-y-1.5">
                    {arch.outcomes.map((out) => (
                      <div key={out} className="flex items-center gap-2 text-[11.5px] text-[#121410]/80">
                        <CheckCircle2 size={12} className="text-[var(--olive)] shrink-0" />
                        <span>{out}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Day-One Readiness & Milestone Standard Card */}
            <div className="p-8 sm:p-12 rounded-[26px] bg-gradient-to-br from-[var(--pill)] via-white to-[var(--pill)] border border-[var(--lime)] text-center max-w-3xl mx-auto shadow-[0_20px_50px_rgba(40,60,15,0.08)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--olive)] text-[#f3f8e4] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <span className="petalyx-pill mb-3">Transparent 30-day delivery standard</span>
              <h3 className="text-2xl sm:text-3xl font-normal tracking-[-0.03em] text-[#121410] my-2">
                Built to Work on Day One. Zero Lock-In.
              </h3>
              <p className="text-sm text-[#121410]/80 max-w-xl mx-auto leading-relaxed mt-3">
                We dedicate senior engineering capacity from day one, so all engagements are non-refundable. Instead, we
                protect your build through live staging reviews at every milestone, pre-launch operational testing, and{' '}
                <strong>100% full source code ownership</strong> delivered in 30 days.
              </p>
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() => onOpenConsultation('30-Day Operations & System Audit')}
                  className="petalyx-btn h-10 px-6 text-xs"
                >
                  Book Your Operations Audit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            7. FAQ SECTION (Native <details> Exclusive Accordion)
           ===================================================================== */}
        <section id="faq" className="petalyx-faq py-24 px-4 sm:px-8 bg-white border-t border-[var(--line)]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="petalyx-pill mb-3">Frequently asked questions</span>
              <h2 className="petalyx-h2">Everything you need to know</h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
                <details key={faq.q} name="agx-faq" open={idx === 0}>
                  <summary>{faq.q}</summary>
                  <div className="px-[22px] pb-5 pt-2 text-[13px] text-[#121410]/75 leading-relaxed border-t border-[var(--line)]">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================================
            4d. CTA SECTION (Moonlit Cherry Blossom Valley & Falling Petals)
           ===================================================================== */}
        <section
          id="cta"
          className="petalyx-cta-section relative h-[110vh] min-h-[720px] overflow-hidden bg-white text-[#121410]"
        >
          {/* Faint Pulsing Grid Squares */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[42%] z-[1] pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(#000, transparent)',
              maskImage: 'linear-gradient(#000, transparent)',
            }}
          >
            {ctaGridSquares.map((sq) => (
              <div
                key={sq.id}
                className="petalyx-grid-sq"
                data-pulse="true"
                data-delay={sq.delay}
                data-rdelay={sq.repeatDelay}
                style={{ left: sq.left, top: sq.top }}
              />
            ))}
          </div>

          {/* Moonlit Valley Image */}
          <div
            className="petalyx-cta-img absolute left-0 right-0 bottom-0 h-[78%] pointer-events-none overflow-hidden"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 24%)',
              maskImage: 'linear-gradient(to bottom, transparent 0, #000 24%)',
            }}
          >
            <img
              id="ctaImg"
              src={PETALYX_ASSETS.NIGHT}
              loading="lazy"
              alt="Moonlit cherry blossom valley"
              className="w-full h-[118%] object-cover object-[center_60%]"
            />
          </div>

          {/* 18 Falling Pink Sakura Petals */}
          <div id="petals" aria-hidden="true" className="absolute inset-0 z-[3] pointer-events-none overflow-hidden">
            {petals.map((petal) => (
              <span
                key={petal.id}
                className="petalyx-petal"
                style={{
                  left: petal.left,
                  ['--dx' as any]: petal.dx,
                  animationDuration: petal.duration,
                  animationDelay: petal.delay,
                  transform: `scale(${petal.scale})`,
                }}
              />
            ))}
          </div>

          {/* Frosted White-to-Clear CTA Card */}
          <div
            id="ctaCard"
            className="petalyx-cta-card absolute z-[4] left-1/2 top-[30%] -translate-x-1/2 w-[min(680px,calc(100%-32px))] p-[46px_28px_54px] text-center rounded-[26px] border border-white/70 backdrop-blur-[16px] backdrop-saturate-[1.1] shadow-[0_30px_60px_rgba(10,20,60,0.18)]"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,255,255,.96) 0%, rgba(255,255,255,.75) 35%, rgba(255,255,255,.12) 100%)',
            }}
          >
            <span className="petalyx-pill">Built to work on day one</span>
            <h2
              className="petalyx-h2 petalyx-split text-[#121410]"
              style={{ margin: '16px 0 10px', fontSize: 'clamp(24px, 2.8vw, 38px)' }}
            >
              <SplitWords text="Reclaim 2–3 hours every single day." />
            </h2>
            <p className="petalyx-reveal text-[14px] text-[#1d2230] max-w-md mx-auto mb-5">
              Book a focused 30-minute audit with our Pune engineering team to map your Custom CRM, ERP, WebApp, or
              Android App for a 30-day delivery.
            </p>
            <button
              type="button"
              onClick={() => onOpenConsultation('30-Day Operations & System Audit')}
              className="petalyx-btn petalyx-reveal px-6"
            >
              Book Operations Audit
            </button>
          </div>
        </section>

        {/* =====================================================================
            4e. LIME FOOTER WITH ANIMATED SVG MARK (#footer)
           ===================================================================== */}
        <footer
          id="footer"
          className="relative z-10 bg-[var(--lime)] px-[4vw] pt-[34px] pb-[22px] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-y-[22px] text-[#1d240c]"
        >
          {/* Animated Ring + Official AGX Brandmark */}
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="relative w-[72px] h-[72px] shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 80 80" className="w-[72px] h-[72px] overflow-visible text-[#111]" aria-hidden="true">
                <circle
                  id="fRing"
                  cx="40"
                  cy="40"
                  r="37"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeDasharray="233"
                  strokeDashoffset="0"
                  transform="rotate(-90 40 40)"
                />
                <circle className="fdot fdot-1" cx="22" cy="40" r="4.5" fill="currentColor" opacity="0" />
                <circle className="fdot fdot-2" cx="40" cy="40" r="4.5" fill="currentColor" opacity="0" />
                <circle className="fdot fdot-3" cx="58" cy="40" r="4.5" fill="currentColor" opacity="0" />
              </svg>
              <img
                id="fAgxBadge"
                src="/agx-brandmark.svg"
                alt="AGXperience logo"
                width={46}
                height={46}
                className="absolute w-[46px] h-[46px] rounded-[12px] shadow-md object-cover"
              />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-[-0.03em] block leading-none text-[#121410]">
                AG<span className="font-bold">X</span>
                <span className="font-normal">perience</span>
              </span>
              <span className="text-[11px] text-[#2a330f] opacity-85 mt-1 block">Pune, Maharashtra • India</span>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center items-center gap-5 sm:gap-6 text-[13px] text-[#1d240c]">
            <a
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#services');
              }}
              className="hover:underline"
            >
              Capabilities
            </a>
            <a
              href="#loop"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#loop');
              }}
              className="hover:underline"
            >
              30-Day Build
            </a>
            <button
              type="button"
              onClick={onNavigateToPortal}
              className="hover:underline bg-transparent border-0 p-0 text-inherit cursor-pointer"
            >
              Client Portal
            </button>
            {onNavigateToPartnerPortal && (
              <button
                type="button"
                onClick={onNavigateToPartnerPortal}
                className="hover:underline bg-transparent border-0 p-0 text-inherit cursor-pointer"
              >
                Partner Portal
              </button>
            )}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="hover:underline bg-transparent border-0 p-0 text-inherit cursor-pointer font-semibold"
            >
              Staff Gateway
            </button>
          </nav>

          <div className="flex items-center justify-center md:justify-end gap-4 md:justify-self-end text-[12px] text-[#1d240c]">
            <a
              href="tel:+918698324316"
              aria-label="Call AGXperience"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <Phone size={14} />
              <span>+91-8698324316</span>
            </a>
            <span className="hidden sm:inline-flex items-center gap-1 opacity-80">
              <MapPin size={14} />
              <span>Pune</span>
            </span>
          </div>

          <div className="col-span-full text-center text-[11px] text-[#2a330f]">
            © {new Date().getFullYear()} AGXperience Inc. (AGX). All rights reserved.
          </div>
        </footer>
      </div>

      {/* =====================================================================
          NATIVE <dialog> SERVICE SCOPE MODAL
         ===================================================================== */}
      <NativeModal
        isOpen={Boolean(selectedService)}
        onClose={() => setSelectedService(null)}
        titleId="service-scope-title"
      >
        {selectedService && (
          <div className="petalyx-theme relative w-full max-w-xl rounded-[28px] p-2 petalyx-card-frost text-[#121410]">
            <div className="rounded-[22px] bg-white/95 p-6 sm:p-8 border border-white/80 relative">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                aria-label="Close service scope dialog"
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 text-[#121410]/60 hover:text-[#121410] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="petalyx-pill">{selectedService.category}</span>
                <span className="text-xs font-mono text-[#121410]/55 flex items-center gap-1">
                  <Clock size={12} /> {selectedService.timeline}
                </span>
              </div>

              <h3 id="service-scope-title" className="text-2xl font-medium text-[#121410] tracking-[-0.02em] mb-2">
                {selectedService.title}
              </h3>
              <p className="text-xs text-[#121410]/70 mb-5 leading-relaxed">{selectedService.shortDesc}</p>

              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/70 text-xs text-rose-900">
                <span className="font-semibold block mb-0.5">Bottleneck Eliminated:</span>
                {selectedService.replacesPains}
              </div>

              <div className="mb-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#121410]/70 block mb-2.5">
                  Included Deliverables
                </span>
                <div className="space-y-2">
                  {selectedService.deliverables.map((del) => (
                    <div key={del} className="flex items-start gap-2.5 text-xs text-[#121410]/85">
                      <CheckCircle2 size={14} className="text-[var(--olive)] mt-0.5 shrink-0" />
                      <span>{del}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#121410]/60 block mb-2">
                  Engineered With
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedService.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#eef0ea] text-[#121410] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="text-xs font-semibold text-[#121410]/70 hover:text-[#121410] px-4 py-2 rounded-full hover:bg-black/5 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const srv = selectedService;
                    setSelectedService(null);
                    onOpenConsultation(srv.title, `Inbound request for ${srv.title}`);
                  }}
                  className="petalyx-btn h-10 px-5 text-xs"
                >
                  Request Diagnostic for this System
                </button>
              </div>
            </div>
          </div>
        )}
      </NativeModal>
    </div>
  );
};

export default PetalyxHome;
