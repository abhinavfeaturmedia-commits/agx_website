import React, { useState } from 'react';
import { Copy, Check, MessageSquare, PhoneCall, ShieldAlert, BookOpen, Send, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Partner, AGX_PRODUCT_CATEGORIES } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';

interface SopToolkitViewProps {
  partner: Partner;
  referralUrl: string;
}

export const SopToolkitView: React.FC<SopToolkitViewProps> = ({
  partner,
  referralUrl
}) => {
  const [activeCategory, setActiveCategory] = useState<'scripts' | 'objections' | 'followup' | 'products'>('scripts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to Clipboard', 'Ready to use on call or WhatsApp.');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const partnerName = partner.name || '[Partner Name]';

  const scripts = [
    {
      id: 'general',
      title: 'A. Opening Script — General',
      target: 'Initial cold call to business owners',
      lang: 'Conversational Hinglish',
      text: `"Namaste Sir/Ma'am, main ${partnerName} bol raha hoon. Main AGXPERIENCE ke saath businesses ke liye customized CRM aur management software solutions par kaam karta hoon.

Hum different businesses ke liye systems develop karte hain, jisse unke customer records, operations, follow-ups aur reporting ko manage karna easier ho sake.

Main aapse ek chhota sa question poochna chahta tha — aap currently apna business management aur daily operations kaise manage karte hain?"`
    },
    {
      id: 'car-dealer',
      title: 'B. Pre-owned Car Dealer Script',
      target: 'Used-car dealers & vehicle resellers',
      lang: 'Conversational Hinglish',
      text: `"Sir, aapka used-car business dekha. Main aapse ye samajhna chahta tha ki aap currently vehicle inventory, customer enquiries, follow-ups aur sales records kaise manage karte hain?

Humne pre-owned car businesses ke liye CRM solution develop kiya hai. Ismein aapke dealership workflow ke according vehicle records, enquiries aur sales-related processes manage karne ka system seamlessly fit ho jata hai.

Agar aapko relevant lage, toh main aapko hamari technical team ke saath ek 20-minute short demo arrange karke dikha sakta hoon."`
    },
    {
      id: 'car-rental',
      title: 'C. Car Rental Operator Script (GaadiDesk)',
      target: 'Rental operators & fleet owners',
      lang: 'Conversational Hinglish',
      text: `"Sir, aap car rental business operate karte hain, isliye ek question tha — aap currently vehicle availability, bookings, trips aur driver records kaise manage karte hain?

AGX ka GaadiDesk solution car rental operators ke liye banaya gaya hai. Hum aapke existing workflow ko samajhkar live system demonstrate kar sakte hain jisse double-bookings aur payment leaks band ho sakein.

Kya aap 20–30 minutes ka demonstration dekhna pasand karenge?"`
    },
    {
      id: 'recruitment',
      title: 'D. Recruitment & Manpower Agency Script',
      target: 'Staffing firms & HR consultants',
      lang: 'Conversational Hinglish',
      text: `"Sir, aap recruitment/manpower business mein hain. Main ye samajhna chahta tha ki aap candidate database, client requirements, employee deployment aur billing process kaise track karte hain?

AGX ne recruitment aur HR management ke liye specialized CRM solution develop kiya hai jismein candidate CVs aur client requirements easily match ho jaate hain.

Agar aap interested hain toh hum hamari technical team ke saath ek short demo schedule kar sakte hain."`
    },
    {
      id: 'travel',
      title: 'E. Travel & Tour Operator Script',
      target: 'Tour operators & holiday planners',
      lang: 'Conversational Hinglish',
      text: `"Sir, aap travel business mein kaam karte hain. Aap currently customer tour enquiries, quotations, itineraries, bookings aur customer follow-ups kaise manage karte hain?

Hum travel businesses ke liye automated CRM solution provide karte hain, jisse quick quotations aur itinerary generation possible ho sake.

Kya main aapko iska 20-minute demonstration arrange karke dikha sakta hoon?"`
    },
    {
      id: 'manufacturing',
      title: 'F. Manufacturing & Project Business Script',
      target: 'Industrial units & project-based businesses',
      lang: 'Conversational Hinglish',
      text: `"Sir, aapke business mein multiple projects aur fabrication operations manage hote honge. Main samajhna chahta tha ki aap currently project progress, task allocation, team responsibilities aur daily reporting kaise track karte hain?

AGX manufacturing aur project-based businesses ke liye tailored project management CRM deploy karta hai. Pehle hum aapka process samjhenge, phir exact relevant solution demonstrate karenge."`
    },
    {
      id: 'send-details',
      title: 'G. When Prospect says: "Send details on WhatsApp"',
      target: 'Turning brochure brush-offs into qualification',
      lang: 'Conversational Hinglish',
      text: `"Bilkul Sir. Main aapko relevant information bhej deta hoon. Bas ek cheez confirm karna chahta hoon — aap currently apna business Excel, WhatsApp ya kisi existing software se manage karte hain?

[Wait for their response]

Understood Sir. Main aapko usi ke according exact relevant details bhejunga. Agar suitable lage toh hum ek short 20-minute demo schedule kar lenge."`
    }
  ];

  const objections = [
    {
      id: 'price-high',
      objection: '"Price is too high."',
      framework: 'Understand investment vs value. Never discount independently.',
      response: `"Understood Sir. Is the concern mainly the total upfront investment, or are you unsure whether the system will deliver enough operational time and cost savings for your business?

If you'd like, we can arrange a workflow-specific demo showing the exact ROI, and our leadership team can evaluate suitable payment milestones."`
    },
    {
      id: 'excel',
      objection: '"We already use Excel / Google Sheets."',
      framework: 'Acknowledge Excel. Uncover follow-up and tracking leaks.',
      response: `"That's completely fine Sir. Most successful businesses start with Excel. May I ask whether your current process is working 100% smoothly, or do you still face issues with missed customer follow-ups, staff coordination, or generating instant reports?"`
    },
    {
      id: 'have-software',
      objection: '"We already have software."',
      framework: 'Do not criticize their software. Ask about gaps.',
      response: `"Understood Sir. Are you completely satisfied with your existing software, or are there specific workflows that it cannot handle properly and your team still ends up doing manually on WhatsApp or paper?"`
    },
    {
      id: 'think',
      objection: '"I need to think about it."',
      framework: 'Identify the specific hesitation.',
      response: `"Of course Sir. May I ask what specific part you would like to evaluate further — the pricing, specific features, implementation timeline, or whether your team will adopt it easily?

That way I can share only the most relevant clarifications."`
    },
    {
      id: 'partner',
      objection: '"I need to discuss it with my business partner."',
      framework: 'Include decision makers in the next demo.',
      response: `"Absolutely Sir. It would be much better if we could include them in a quick 20-minute discussion so both of you can see the live workflow together and ask technical questions directly. Would tomorrow or day after suit both of you?"`
    },
    {
      id: 'brochure',
      objection: '"Send me a brochure first."',
      framework: 'Agree and anchor next action date.',
      response: `"Certainly Sir. I will share our product overview right away on WhatsApp. Would it be okay if I follow up on [Day after tomorrow] after you have reviewed it, so we can clarify any questions?"`
    },
    {
      id: 'not-now',
      objection: '"We do not need software right now."',
      framework: 'Distinguish timing from disinterest; set nurture date.',
      response: `"Understood Sir. Is it because your current workflow is running smoothly, or is software upgrade something you plan to implement in the coming quarter? 

I'll make a note and reconnect at the right time."`
    }
  ];

  const followups = [
    {
      day: 'Day 0',
      timing: 'Immediately after first conversation',
      title: 'Intro WhatsApp with Product Context',
      text: `Namaste Sir,

Thank you for taking the time to speak with me today.

As discussed, AGXPERIENCE develops tailored CRM and business management systems for growing companies.

Based on our conversation regarding your current operations, I believe our solution can eliminate manual bottlenecks and give you complete control.

Here is our overview: ${referralUrl}

Would you be open for a short 20-minute demonstration this week?

Regards,
${partnerName}
AGXPERIENCE Partner`
    },
    {
      day: 'Day 1',
      timing: '24 hours post-intro',
      title: 'Receipt Check',
      text: `Namaste Sir, hope you are doing well! Just wanted to confirm if you received the information I shared yesterday regarding the management system? Let me know if you had any questions.`
    },
    {
      day: 'Day 3',
      timing: '3 days after contact',
      title: 'Relevance & Pain Point Check',
      text: `Namaste Sir, following up on our discussion regarding your workflow. Have you had a chance to consider whether a streamlined system would help your team with daily records and follow-ups? We can do a quick 15-minute walkthrough whenever convenient.`
    },
    {
      day: 'Day 5',
      timing: '5 days after contact',
      title: 'Demo Slot Offer',
      text: `Namaste Sir, we have our technical team conducting live system demonstrations this Thursday and Friday. Would you prefer a 20-minute session at 11:30 AM or 4:00 PM to see how other businesses in your industry use it?`
    },
    {
      day: 'Post-Demo',
      timing: 'Within 2 hours of completed demo',
      title: 'Post-Demo Follow-Up & Requirement Scope',
      text: `Namaste Sir, thank you for attending today's software demonstration with our team!

As discussed, AGX is reviewing your requirements to prepare the proposed scope and milestone quotation. 

If there are any specific workflows or reports you would like us to include, please send them here so our team can evaluate feasibility.

Regards,
${partnerName}`
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black text-[#CCFF00] text-[10px] font-black uppercase tracking-wider">
              SOP Sales Enablement
            </span>
            <span className="text-xs text-gray-400">Battle-tested scripts & objection playbooks</span>
          </div>
          <h3 className="font-extrabold text-xl text-gray-900 tracking-tight mt-1 font-['Outfit']">
            Partner Growth & Field Playbook
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl">
            Derived directly from the AGXPERIENCE Partner SOP. Every script is crafted in natural Hinglish/English to diagnose customer problems rather than pitch feature lists.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl shrink-0">
          {[
            { id: 'scripts', label: 'Call Scripts', icon: PhoneCall },
            { id: 'objections', label: '7 Objections', icon: ShieldAlert },
            { id: 'followup', label: 'Follow-ups', icon: Send },
            { id: 'products', label: 'Product Rules', icon: BookOpen }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-xs font-extrabold'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-black' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: CALL SCRIPTS */}
      {activeCategory === 'scripts' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center gap-2.5">
            <Sparkles size={16} className="text-amber-700 shrink-0" />
            <span>
              <strong>Rule from SOP Section 6:</strong> Do not sound like you are reading a script. Pause after the opening question and let the business owner explain their operations.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-sm text-gray-900">{s.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {s.lang}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mt-1.5 mb-2.5">
                    Target: {s.target}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {s.text}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(s.id, s.text)}
                  className="w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-press"
                >
                  {copiedId === s.id ? (
                    <>
                      <Check size={14} className="text-[#CCFF00]" />
                      <span className="text-[#CCFF00]">Copied Script!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Script</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: 7 OBJECTIONS */}
      {activeCategory === 'objections' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-blue-900 flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-blue-700 shrink-0" />
            <span>
              <strong>SOP Section 11:</strong> Understand the objection before responding. Never argue, and never independently offer discounts to save a deal.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {objections.map(obj => (
              <div
                key={obj.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-sm text-red-600 font-mono">
                      {obj.objection}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 block">
                    Strategic Principle: {obj.framework}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {obj.response}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(obj.id, obj.response)}
                  className="w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-press"
                >
                  {copiedId === obj.id ? (
                    <>
                      <Check size={14} className="text-[#CCFF00]" />
                      <span className="text-[#CCFF00]">Copied Battlecard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Counter-Script</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: FOLLOW-UP CADENCE */}
      {activeCategory === 'followup' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-center gap-2.5">
            <Send size={16} className="text-emerald-700 shrink-0" />
            <span>
              <strong>SOP Section 12 Cadence:</strong> Day 0 &bull; Day 1 &bull; Day 3 &bull; Day 5 &bull; Day 7 &bull; Day 10 &bull; Day 14. Stop promotional messages if the prospect requests.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {followups.map(f => (
              <div
                key={f.day}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <span className="font-extrabold text-sm text-gray-900">{f.title}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                      {f.day}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 block">
                    Timing: {f.timing}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {f.text}
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(f.day, f.text)}
                  className="w-full py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs btn-press"
                >
                  {copiedId === f.day ? (
                    <>
                      <Check size={14} className="text-[#CCFF00]" />
                      <span className="text-[#CCFF00]">Copied WhatsApp Template!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy WhatsApp Template</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: PRODUCT RULES & FEATURE SCOPING */}
      {activeCategory === 'products' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 text-xs text-red-950 space-y-1.5">
            <span className="font-extrabold flex items-center gap-2 text-sm text-red-900">
              <ShieldAlert size={16} /> Non-Negotiable SOP Scoping Rules
            </span>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-red-900/90">
              <li>Partners cannot independently change product pricing or promise custom development.</li>
              <li>Always demonstrate existing capabilities first. Never claim a feature is ready if it is in development.</li>
              <li>Customer payments must be made directly to authorized AGX bank/UPI channels. Never to personal accounts.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGX_PRODUCT_CATEGORIES.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border inline-block ${prod.badgeColor}`}>
                    {prod.id}
                  </span>
                  <h4 className="font-black text-sm text-gray-900">{prod.name}</h4>
                  <p className="text-[11px] text-gray-500 leading-snug">{prod.tagline}</p>

                  <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px]">
                    <div className="text-gray-700">
                      <strong>Target:</strong> {prod.targetAudience}
                    </div>
                    <div className="text-gray-500">
                      <strong>Pain Points:</strong> {prod.problemsToInvestigate}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Pricing Model</span>
                  <span className="font-bold text-xs text-gray-900">{prod.priceAnchor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
