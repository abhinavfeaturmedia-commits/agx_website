import React, { useState } from 'react';
import { FileText, CheckCircle2, MessageSquare, TrendingUp, Calendar, Clock, User, AlertCircle, Send } from 'lucide-react';
import { PartnerEodReport } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';

interface AdminEodReviewHubProps {
  reports: PartnerEodReport[];
  onReviewReport: (id: string, feedback: string, adminName: string) => void;
  adminName: string;
}

export const AdminEodReviewHub: React.FC<AdminEodReviewHubProps> = ({
  reports,
  onReviewReport,
  adminName
}) => {
  const [feedbackInputs, setFeedbackInputs] = useState<{ [id: string]: string }>({});

  const handleFeedbackChange = (id: string, val: string) => {
    setFeedbackInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleSaveFeedback = (id: string) => {
    const feedback = feedbackInputs[id] || '';
    if (!feedback.trim()) {
      toast.warning('Feedback Required', 'Please enter coaching or review feedback for the partner.');
      return;
    }
    onReviewReport(id, feedback.trim(), adminName);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl text-gray-900 tracking-tight font-['Outfit']">
              Partner Daily EOD Prospecting Submissions
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
              {reports.length} Total Reports
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            SOP Section 14 Review Hub. Audit daily activity numbers against SOP targets and provide strategic coaching to help partners overcome objections.
          </p>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <FileText size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-gray-900">No Partner EOD Reports Submitted Yet</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When partners log their end-of-day prospecting numbers and observations, they will appear here for management review.
            </p>
          </div>
        ) : (
          reports.map(r => {
            const hasFeedback = Boolean(r.adminFeedback);
            const currentInput = feedbackInputs[r.id] ?? r.adminFeedback ?? '';

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black text-[#CCFF00] font-black flex items-center justify-center shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-gray-900">{r.partnerName}</h4>
                        <span className="font-mono text-xs text-gray-400">&bull; {r.date}</span>
                        {r.city && <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-lg">City: {r.city}</span>}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Primary Focus: <strong className="text-gray-700">{r.primaryCategory}</strong>
                        {r.secondaryCategory && <span> &bull; Secondary: {r.secondaryCategory}</span>}
                      </span>
                    </div>
                  </div>

                  <div>
                    {r.reviewedByAdmin ? (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Reviewed by {r.reviewedBy || adminName}
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                        Pending Leadership Review
                      </span>
                    )}
                  </div>
                </div>

                {/* KPI Metrics Scorecard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Researched</span>
                    <span className="font-mono font-black text-sm text-gray-900">{r.metrics.researched}</span>
                    <span className="text-[9px] text-gray-400 block">Target: 25-30</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Contacts</span>
                    <span className="font-mono font-black text-sm text-gray-900">{r.metrics.contactAttempts}</span>
                    <span className="text-[9px] text-gray-400 block">Target: 25</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Convos</span>
                    <span className="font-mono font-black text-sm text-gray-900">{r.metrics.meaningfulConversations}</span>
                    <span className="text-[9px] text-gray-400 block">Target: 5</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Qualified</span>
                    <span className="font-mono font-black text-sm text-purple-700">{r.metrics.qualifiedProspects}</span>
                    <span className="text-[9px] text-purple-400 block">Target: 2</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Demos Booked</span>
                    <span className="font-mono font-black text-sm text-amber-600">{r.metrics.demosBooked}</span>
                    <span className="text-[9px] text-amber-400 block">Target: 1</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">Cash Collected</span>
                    <span className="font-mono font-black text-sm text-emerald-600">₹{(r.metrics.cashCollected || 0).toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-emerald-500 block">Verified advance</span>
                  </div>
                </div>

                {/* 5 Qualitative Observations */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                  {r.observations.bestIndustry && (
                    <div>
                      <strong className="text-gray-900">1. Best Responding Industry:</strong>{' '}
                      <span className="text-gray-700">{r.observations.bestIndustry}</span>
                    </div>
                  )}
                  {r.observations.commonObjections && (
                    <div>
                      <strong className="text-gray-900">2. Common Objections:</strong>{' '}
                      <span className="text-gray-700">{r.observations.commonObjections}</span>
                    </div>
                  )}
                  {r.observations.supportNeeded && (
                    <div>
                      <strong className="text-gray-900">3. AGX Support Needed:</strong>{' '}
                      <span className="text-gray-700">{r.observations.supportNeeded}</span>
                    </div>
                  )}
                  {r.observations.blockers && (
                    <div>
                      <strong className="text-gray-900">4. Blockers:</strong>{' '}
                      <span className="text-gray-700">{r.observations.blockers}</span>
                    </div>
                  )}
                  <div>
                    <strong className="text-gray-900">5. Tomorrow's Priority:</strong>{' '}
                    <span className="text-gray-700">{r.observations.tomorrowPriority}</span>
                  </div>
                </div>

                {/* Coaching Feedback Input */}
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-gray-500 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-indigo-600" />
                      Leadership Coaching Feedback (Visible in Partner Portal)
                    </label>
                    {r.reviewedAt && (
                      <span className="text-[10px] text-gray-400">
                        Last reviewed on {new Date(r.reviewedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={e => handleFeedbackChange(r.id, e.target.value)}
                      placeholder="e.g. Great connection rate on used-car dealers! Use objection script B on Excel concerns..."
                      className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black"
                    />
                    <button
                      onClick={() => handleSaveFeedback(r.id)}
                      className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Send size={12} className="text-[#CCFF00]" />
                      <span>{r.reviewedByAdmin ? 'Update Feedback' : 'Send Feedback'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

