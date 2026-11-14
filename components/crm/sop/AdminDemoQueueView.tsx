import React, { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, User, Building, Phone, AlertCircle, Plus, ExternalLink, MessageSquare } from 'lucide-react';
import { DemoBookingRequest } from '../../../types/crm';
import { toast } from '../../../lib/toastStore';

interface AdminDemoQueueViewProps {
  demoRequests: DemoBookingRequest[];
  onUpdateDemo: (id: string, updates: Partial<DemoBookingRequest>) => void;
}

export const AdminDemoQueueView: React.FC<AdminDemoQueueViewProps> = ({
  demoRequests,
  onUpdateDemo
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [editMeetingLink, setEditMeetingLink] = useState<string>('');
  const [editTechLead, setEditTechLead] = useState<string>('Abhinav (Technical Lead)');
  const [editConfirmedSlot, setEditConfirmedSlot] = useState<string>('');
  const [editDemoNotes, setEditDemoNotes] = useState<string>('');

  const filtered = demoRequests.filter(req => {
    if (statusFilter === 'ALL') return true;
    return req.status === statusFilter;
  });

  const handleStartEdit = (req: DemoBookingRequest) => {
    setActiveEditingId(req.id);
    setEditMeetingLink(req.meetingLink || '');
    setEditTechLead(req.assignedTechLead || 'Abhinav (Technical Lead)');
    setEditConfirmedSlot(req.confirmedSlot || req.slotPreference1 || '');
    setEditDemoNotes(req.demoNotes || '');
  };

  const handleSaveDemo = (id: string, newStatus?: DemoBookingRequest['status']) => {
    onUpdateDemo(id, {
      meetingLink: editMeetingLink.trim() || undefined,
      assignedTechLead: editTechLead.trim() || undefined,
      confirmedSlot: editConfirmedSlot.trim() || undefined,
      demoNotes: editDemoNotes.trim() || undefined,
      status: newStatus || undefined
    });
    setActiveEditingId(null);
    toast.success('Demo Updated', 'Demonstration details and status updated.');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl text-gray-900 tracking-tight font-['Outfit']">
              AGX Technical Demo Handoff Queue
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold border border-amber-200">
              {demoRequests.filter(d => d.status === 'Requested').length} Pending Handoff
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-xl">
            SOP Rule: Partner qualifies and books; AGX conducts the structured 30-minute demonstration. Review customer pain points, assign technical lead, and add meeting link.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-bold">
          {['ALL', 'Requested', 'Confirmed', 'Completed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === s ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Calendar size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-gray-900">No Demo Requests in this View</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              When partners qualify prospects and submit a demo request, it will appear here for AGX technical assignment.
            </p>
          </div>
        ) : (
          filtered.map(req => {
            const isEditing = activeEditingId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 font-black flex items-center justify-center border border-amber-300 shrink-0">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-gray-900">{req.clientName}</h4>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-bold text-gray-500">{req.company}</span>
                        {req.city && <span className="text-xs text-gray-400">({req.city})</span>}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        Requested by Partner: <strong className="text-gray-700">{req.partnerName}</strong> &bull; {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        req.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Confirmed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>

                    {!isEditing && (
                      <button
                        onClick={() => handleStartEdit(req)}
                        className="px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Manage / Assign
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Target Product</span>
                    <span className="font-extrabold text-gray-900 text-sm">{req.product}</span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">Current tool: {req.currentProcess}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Proposed Slots</span>
                    <span className="font-bold text-gray-800 block text-xs">Slot 1: {req.slotPreference1}</span>
                    {req.slotPreference2 && (
                      <span className="text-[11px] text-gray-500 block">Slot 2: {req.slotPreference2}</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Attendees</span>
                    <span className="font-bold text-gray-800 block text-xs">{req.attendees}</span>
                    {req.phone && (
                      <span className="text-[11px] text-emerald-600 font-mono block mt-0.5">
                        Phone: {req.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pain Points Brief */}
                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-1">
                  <span className="font-extrabold flex items-center gap-1.5 text-xs text-amber-900">
                    <AlertCircle size={13} className="text-amber-700" /> Discovered Customer Pain Points:
                  </span>
                  <p className="text-amber-900 leading-relaxed font-sans">{req.identifiedProblem}</p>
                </div>

                {/* Edit & Assignment Controls */}
                {isEditing ? (
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Assign AGX Technical Lead</label>
                        <select
                          value={editTechLead}
                          onChange={e => setEditTechLead(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                        >
                          <option value="Abhinav (Technical Lead)">Abhinav (Technical Lead)</option>
                          <option value="Rohit (Solutions Architect)">Rohit (Solutions Architect)</option>
                          <option value="Engineering Team">Engineering Team</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Confirmed Demo Slot</label>
                        <input
                          type="text"
                          value={editConfirmedSlot}
                          onChange={e => setEditConfirmedSlot(e.target.value)}
                          placeholder="e.g. 2026-11-10 at 11:30 AM"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Meeting Link (Google Meet / Zoom)</label>
                        <input
                          type="text"
                          value={editMeetingLink}
                          onChange={e => setEditMeetingLink(e.target.value)}
                          placeholder="https://meet.google.com/xyz-abc"
                          className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">30-Min Demo Notes & Customer Feedback</label>
                      <textarea
                        value={editDemoNotes}
                        onChange={e => setEditDemoNotes(e.target.value)}
                        placeholder="Log customer reactions, custom feature requests, and proposal requirements..."
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-hidden focus:border-black resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => setActiveEditingId(null)}
                        className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveDemo(req.id, 'Confirmed')}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors cursor-pointer"
                      >
                        Confirm Slot
                      </button>
                      <button
                        onClick={() => handleSaveDemo(req.id, 'Completed')}
                        className="px-4 py-1.5 rounded-xl bg-black hover:bg-gray-800 text-white font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} className="text-[#CCFF00]" /> Mark Completed
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 gap-2">
                    <div className="flex items-center gap-3">
                      <span>Tech Lead: <strong className="text-gray-900">{req.assignedTechLead || 'Unassigned'}</strong></span>
                      {req.confirmedSlot && <span>&bull; Confirmed Slot: <strong className="text-gray-900">{req.confirmedSlot}</strong></span>}
                    </div>
                    {req.meetingLink && (
                      <a
                        href={req.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        <Video size={13} />
                        <span>Join Meeting Link</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

