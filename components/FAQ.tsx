import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "How long does it take until our first automation goes live?",
    answer: "Your first high-leverage automation is deployed and actively functioning within 7 business days of your discovery call. Full multi-system operational handoff is achieved in 14 business days. We engineer for speed and immediate payroll payback."
  },
  {
    question: "What is your 30-Day Zero-Risk Performance Guarantee?",
    answer: "We operate on an institutional performance-first standard: If our automated systems do not save your business at least 10 hours per week within 30 days of launch, we continue engineering and optimizing completely free of charge until you hit your target. You take zero financial risk."
  },
  {
    question: "How much time will this require from me or my team?",
    answer: "Less than 2 hours total across the entire 14-day sprint. We do 100% of the heavy lifting. We only need a 30-minute discovery diagnostic, initial API access provisioning, and a 30-minute milestone review before production rollout."
  },
  {
    question: "What happens if an external API or software updates and breaks?",
    answer: "Every custom deployment includes our 60-Day VIP Error Monitoring & Self-Healing Webhook Warranty. Our automated monitors catch and flag payload anomalies immediately, and our engineers resolve them within 4 business hours at zero additional cost."
  },
  {
    question: "Do we own the workflows, code, and intellectual property?",
    answer: "Yes, 100%. Unlike software platforms that trap you on proprietary ecosystems, every workflow, custom script, and database model we build is handed over directly to your organization. You own all IP from day one with zero vendor lock-in."
  },
  {
    question: "How do you ensure our sensitive business data is secure?",
    answer: "We enforce strict zero-data-retention and zero-model-training policies across OpenAI and Anthropic Claude APIs. Your proprietary business documents, customer chats, and financial records are never used to train public AI models and are stored in AES-256 encrypted vaults."
  },
  {
    question: "How is this different from just buying more SaaS tools?",
    answer: "SaaS tools are passive software that still require expensive human salaries to operate. AGX builds autonomous agents and deterministic pipelines that actively do the work for you—eliminating manual clicks and scaling your volume without adding headcount."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-24 px-6 md:px-12 bg-transparent relative border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-mono uppercase tracking-widest mb-4">
            <HelpCircle size={13} className="text-[#CCFF00]" /> Clear Answers
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase text-white tracking-tight leading-[1.08] font-['Outfit']">
            FREQUENTLY ASKED <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-[#CCFF00]">QUESTIONS</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto font-light mt-3">
            Everything you need to know about our engineering standards, guarantees, and deployment velocity.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`double-bezel-outer transition-all duration-300 ${isOpen ? 'border-[#CCFF00]/30' : 'hover:border-white/20'}`}
              >
                <div className="double-bezel-inner p-0 overflow-hidden bg-[#0A0D13]">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-base sm:text-lg font-bold text-white pr-6 font-['Outfit']">{faq.question}</span>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-[#CCFF00] text-black rotate-180' : 'text-white bg-white/5'}`}>
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-white/70 text-xs sm:text-sm font-light leading-relaxed border-t border-white/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
