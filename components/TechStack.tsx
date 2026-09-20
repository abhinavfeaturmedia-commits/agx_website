import React from 'react';
import { motion } from 'motion/react';
import { Terminal } from 'lucide-react';

const OpenAILogo = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A6.0651 6.0651 0 0 0 19.0192 19.818a5.9847 5.9847 0 0 0 3.9977-2.9 6.0462 6.0462 0 0 0-.735-7.0969zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5987 8.3829 14.6188 7.2144a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.3927-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
  </svg>
);

const AntigravityLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M12 2L3 20H21L12 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 10L8 17H16L12 10Z" fill="white"/>
  </svg>
);

const OpenClawLogo = () => (
  <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M7.5 3C6 3 4.5 9 6 21C6.5 21 7 15 8.5 9C9 7 8.5 3 7.5 3Z" />
    <path d="M12.5 2C11 2 9.5 10 11 22C11.5 22 12 16 13.5 10C14 8 13.5 2 12.5 2Z" />
    <path d="M17.5 3C16 3 14.5 9 16 21C16.5 21 17 15 18.5 9C19 7 18.5 3 17.5 3Z" />
  </svg>
);

const tools = [
  { name: "n8n", category: "Automation", icon: <img src="https://cdn.simpleicons.org/n8n/white" alt="n8n" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Make", category: "Automation", icon: <img src="https://cdn.simpleicons.org/make/white" alt="Make" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Zapier", category: "Automation", icon: <img src="https://cdn.simpleicons.org/zapier/white" alt="Zapier" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "OpenAI", category: "AI Models", icon: <OpenAILogo /> },
  { name: "Claude", category: "AI Models", icon: <img src="https://cdn.simpleicons.org/anthropic/white" alt="Claude" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Google Gemini", category: "AI Models", icon: <img src="https://cdn.simpleicons.org/googlegemini/white" alt="Google Gemini" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Airtable", category: "Database", icon: <img src="https://cdn.simpleicons.org/airtable/white" alt="Airtable" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Google Sheets", category: "Data", icon: <img src="https://cdn.simpleicons.org/googlesheets/white" alt="Google Sheets" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "WhatsApp API", category: "Communication", icon: <img src="https://cdn.simpleicons.org/whatsapp/white" alt="WhatsApp" className="w-6 h-6" referrerPolicy="no-referrer" /> },
  { name: "Antigravity", category: "Development", icon: <AntigravityLogo /> },
  { name: "OpenClaw", category: "Development", icon: <OpenClawLogo /> },
  { name: "Claude Code", category: "Development", icon: <Terminal className="w-6 h-6 text-white" /> }
];

// Duplicate for infinite scroll
const duplicatedTools = [...tools, ...tools, ...tools];

const TechStack: React.FC = () => {
  return (
    <section className="py-16 md:py-20 bg-transparent border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium tracking-wide uppercase mb-4 backdrop-blur-sm">
            Tech Stack
          </div>
          <h2 className="text-3xl md:text-4xl font-normal uppercase text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            TOOLS WE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">USE.</span>
          </h2>
        </motion.div>
      </div>

      <div className="relative w-full flex overflow-x-hidden group">
        {/* Gradient Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-32 z-10 bg-gradient-to-r from-[hsl(var(--background))] to-transparent pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-32 z-10 bg-gradient-to-l from-[hsl(var(--background))] to-transparent pointer-events-none"></div>

        <motion.div 
          className="flex gap-4 whitespace-nowrap py-6 px-6"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            ease: "linear",
            duration: 30,
            repeat: Infinity,
          }}
        >
          {duplicatedTools.map((tool, idx) => (
            <div 
              key={idx} 
              className="relative group/tooltip flex items-center justify-center gap-3 px-8 py-4 bg-white/[0.02] border border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300 cursor-default"
            >
              {tool.icon}
              <span className="text-white/80 font-medium tracking-wide text-lg">{tool.name}</span>
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-20 translate-y-2 group-hover/tooltip:translate-y-0">
                <div className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                  {tool.category}
                </div>
                <div className="w-2 h-2 bg-white rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TechStack;
