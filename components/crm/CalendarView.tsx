import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  Users, MapPin, CheckCircle2, AlertCircle, X, Sparkles, Trash2, Download,
  Layers, ExternalLink, Briefcase, IndianRupee, FileText, CheckCircle,
  Video, ArrowRight, Filter, Search
} from 'lucide-react';
import { CalendarEvent, CalendarEventType } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface CalendarViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const EVENT_TYPES: CalendarEventType[] = [
  'Meeting',
  'Client Follow-up',
  'Project Deadline',
  'Task Due',
  'Payment Reminder',
  'Agreement Expiry'
];

export const CalendarView: React.FC<CalendarViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const { events, addCalendarEvent, deleteCalendarEvent, clients, projects, tasks, invoices, agreements, leads } = store;

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('All');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('All');

  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState<CalendarEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    eventType: 'Meeting' as CalendarEventType,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    location: 'Google Meet',
    participants: ['Team'],
    relatedClientId: '',
    relatedProjectId: '',
    relatedLeadId: '',
    notes: ''
  });

  // Auto-aggregate operational deadlines from live database
  const aggregatedEvents: CalendarEvent[] = useMemo(() => [
    ...events,
    ...leads.filter(l => l.nextFollowUp).map(l => ({
      id: `lead-followup-${l.id}`,
      title: `Sales Follow-up: ${l.name} (${l.company || 'Direct'})`,
      eventType: 'Client Follow-up' as CalendarEventType,
      startTime: l.nextFollowUp && l.nextFollowUp.includes('T') ? l.nextFollowUp : `${l.nextFollowUp}T10:00:00Z`,
      location: l.location || 'WhatsApp / Phone Call',
      participants: [l.assignedTo || 'Sales Executive', l.name],
      relatedClientId: l.convertedClientId,
      relatedLeadId: l.id,
      relatedLeadName: l.company || l.name,
      notes: `Deal Value: ₹${(l.estimatedDealValue || 0).toLocaleString('en-IN')} • Stage: ${l.status} • Interested: ${l.interestedService}\nLast Contact: ${l.lastContacted ? new Date(l.lastContacted).toLocaleDateString('en-IN') : 'None recorded'}\nNotes: ${l.notes || 'Routine follow-up call.'}`,
      createdAt: l.createdAt || new Date().toISOString()
    })),
    ...projects.filter(p => p.dueDate).map(p => ({
      id: `proj-due-${p.id}`,
      title: `Project Delivery: ${p.name}`,
      eventType: 'Project Deadline' as CalendarEventType,
      startTime: `${p.dueDate}T18:00:00Z`,
      location: 'Production Release',
      participants: p.assignedTeam || ['PM'],
      relatedClientId: p.clientId,
      relatedProjectId: p.id,
      notes: `Target delivery date for client ${p.clientName}. Commercial value ₹${p.projectValue?.toLocaleString('en-IN')}`,
      createdAt: p.createdAt || new Date().toISOString()
    })),
    ...tasks.filter(t => t.dueDate && t.status !== 'COMPLETED').map(t => ({
      id: `task-due-${t.id}`,
      title: `Task Deadline: ${t.title}`,
      eventType: 'Task Due' as CalendarEventType,
      startTime: `${t.dueDate}T17:00:00Z`,
      location: 'Sprint Board',
      participants: [t.assignedTo || 'Developer'],
      relatedProjectId: t.projectId,
      notes: `Sprint deliverable in status ${t.status}. Estimated ${t.estimatedHours || 0} hrs.`,
      createdAt: t.createdAt || new Date().toISOString()
    })),
    ...invoices.filter(i => i.dueDate && i.status !== 'Paid').map(i => ({
      id: `inv-due-${i.id}`,
      title: `Payment Due: ${i.invoiceNumber} (${i.clientName})`,
      eventType: 'Payment Reminder' as CalendarEventType,
      startTime: `${i.dueDate}T10:00:00Z`,
      location: 'Accounts Receivable',
      participants: ['Accountant', i.clientName],
      relatedClientId: i.clientId,
      relatedProjectId: i.projectId,
      notes: `Outstanding invoice amount: ₹${((i.total || 0) - (i.paidAmount || 0)).toLocaleString('en-IN')}`,
      createdAt: i.createdAt || new Date().toISOString()
    })),
    ...agreements.filter(a => a.signedDate || a.expiryDate).map(a => ({
      id: `agr-due-${a.id}`,
      title: `Legal Contract: ${a.name}`,
      eventType: 'Agreement Expiry' as CalendarEventType,
      startTime: `${a.expiryDate || a.signedDate}T09:00:00Z`,
      location: 'Legal Repository',
      participants: [a.clientName],
      relatedClientId: a.clientId,
      notes: `Commercial agreement type ${a.agreementType} for ₹${a.commercialValue?.toLocaleString('en-IN')}`,
      createdAt: a.createdAt || new Date().toISOString()
    }))
  ], [events, leads, projects, tasks, invoices, agreements]);

  // Calendar operational KPIs
  const calendarMetrics = useMemo(() => {
    const totalItems = aggregatedEvents.length;
    const clientMeetings = aggregatedEvents.filter(e => e.eventType === 'Meeting' || e.eventType === 'Client Follow-up').length;
    const deliverables = aggregatedEvents.filter(e => e.eventType === 'Project Deadline' || e.eventType === 'Task Due').length;
    const financialDue = aggregatedEvents.filter(e => e.eventType === 'Payment Reminder' || e.eventType === 'Agreement Expiry').length;

    return {
      totalItems,
      clientMeetings,
      deliverables,
      financialDue
    };
  }, [aggregatedEvents]);

  // Dynamic clients list for filtering
  const dynamicClients = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => set.add(c.company));
    projects.forEach(p => { if (p.clientName) set.add(p.clientName); });
    return Array.from(set);
  }, [clients, projects]);

  const currentMonthLabel = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };
  const handleJumpToday = () => {
    const today = new Date();
    setCalendarDate(today);
    setSelectedDay(today.getDate());
  };

  // Month grid calculation
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return aggregatedEvents.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        e.title.toLowerCase().includes(q) ||
        (e.notes && e.notes.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        e.participants.some(p => p.toLowerCase().includes(q));

      const matchesType = selectedEventType === 'All' || e.eventType === selectedEventType;
      
      const evtClient = clients.find(c => c.id === e.relatedClientId)?.company;
      const matchesClient = selectedClientFilter === 'All' ||
        e.relatedClientId === selectedClientFilter ||
        (evtClient && evtClient === selectedClientFilter) ||
        e.title.includes(selectedClientFilter);

      // Selected day filter if in grid mode
      if (selectedDay !== null) {
        const evtDate = new Date(e.startTime);
        if (
          evtDate.getFullYear() !== currentYear ||
          evtDate.getMonth() !== currentMonth ||
          evtDate.getDate() !== selectedDay
        ) {
          return false;
        }
      }

      return matchesSearch && matchesType && matchesClient;
    });
  }, [aggregatedEvents, searchQuery, selectedEventType, selectedClientFilter, selectedDay, currentYear, currentMonth, clients]);

  // Auto-open add event modal or select specific event if navigated with entity ID
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddEventModalOpen(true);
    } else if (initialSelectedId) {
      const match = aggregatedEvents.find(e => e.id === initialSelectedId || e.id.includes(initialSelectedId));
      if (match) {
        setSelectedEventForDetails(match);
        if (match.startTime) {
          const d = new Date(match.startTime);
          if (!isNaN(d.getTime())) {
            setCalendarDate(d);
            setSelectedDay(d.getDate());
          }
        }
      }
    }
  }, [initialSelectedId, aggregatedEvents]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) {
      toast.error('Validation Error', 'Please provide an event title.');
      return;
    }
    const cl = clients.find(c => c.id === newEvent.relatedClientId);
    const pr = projects.find(p => p.id === newEvent.relatedProjectId);
    const ld = leads.find(l => l.id === newEvent.relatedLeadId);

    const participantList = [...newEvent.participants];
    if (cl && !participantList.includes(cl.company)) participantList.push(cl.company);
    if (ld && !participantList.includes(ld.company || ld.name)) participantList.push(ld.company || ld.name);

    addCalendarEvent({
      title: newEvent.title.trim(),
      eventType: newEvent.eventType,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      participants: participantList,
      relatedClientId: cl ? cl.id : undefined,
      relatedProjectId: pr ? pr.id : undefined,
      relatedLeadId: ld ? ld.id : undefined,
      relatedLeadName: ld ? (ld.company || ld.name) : undefined,
      notes: newEvent.notes
    });
    setIsAddEventModalOpen(false);
    setNewEvent({
      title: '',
      eventType: 'Meeting',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: 'Google Meet',
      participants: ['Team'],
      relatedClientId: '',
      relatedProjectId: '',
      relatedLeadId: '',
      notes: ''
    });
    toast.success('Event Scheduled', `${newEvent.title} added to operational calendar.`);
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_calendar_schedule', filteredEvents.map(e => ({
      ID: e.id,
      Title: e.title,
      Type: e.eventType,
      StartTime: e.startTime,
      EndTime: e.endTime || 'N/A',
      Location: e.location || 'Online',
      Participants: e.participants.join('; '),
      Notes: e.notes || ''
    })));
  };

  const getEventBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'Meeting': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Client Follow-up': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Project Deadline': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Task Due': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Payment Reminder': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Agreement Expiry': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventAccentBorder = (type: CalendarEventType) => {
    switch (type) {
      case 'Meeting': return 'border-l-purple-500';
      case 'Client Follow-up': return 'border-l-amber-500';
      case 'Project Deadline': return 'border-l-rose-500';
      case 'Task Due': return 'border-l-blue-500';
      case 'Payment Reminder': return 'border-l-emerald-500';
      case 'Agreement Expiry': return 'border-l-orange-500';
      default: return 'border-l-gray-400';
    }
  };

  const getEventDotColor = (type: CalendarEventType) => {
    switch (type) {
      case 'Meeting': return 'bg-purple-500';
      case 'Client Follow-up': return 'bg-amber-500';
      case 'Project Deadline': return 'bg-rose-500';
      case 'Task Due': return 'bg-blue-500';
      case 'Payment Reminder': return 'bg-emerald-500';
      case 'Agreement Expiry': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Check if a date has events in the active month
  const getEventsForDay = (day: number) => {
    return aggregatedEvents.filter(e => {
      const d = new Date(e.startTime);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
    });
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Operations & Deadline Calendar
          </h2>
          <p className="text-xs text-gray-500">
            Unified schedule for client demos, sprint deadlines, billing reminders, and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus size={15} /> Schedule Event
          </button>
        </div>
      </div>

      {/* Row 1: Operational Schedule KPIs Banner with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Scheduled</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {calendarMetrics.totalItems} Items
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CalendarIcon size={13} /> Across 5 Sub-systems
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Client Demos & Meetings</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {calendarMetrics.clientMeetings} Sessions
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Users size={13} /> Live Calls & Touchpoints
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Sprint & Project Handovers</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block tabular-nums">
                {calendarMetrics.deliverables} Deliveries
              </span>
              <span className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Briefcase size={13} /> Production Milestones
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
              <Briefcase size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commercial Deadlines</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                {calendarMetrics.financialDue} Billing
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <IndianRupee size={13} /> Invoices & Contracts
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Navigation & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Month Stepper & Mode Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Agenda Cards
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
                }`}
              >
                Month Grid
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
              <span className="font-extrabold text-gray-900 text-xs">{currentMonthLabel}</span>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Previous Month">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Next Month">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            <button
              onClick={handleJumpToday}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Today
            </button>

            {selectedDay !== null && (
              <button
                onClick={() => setSelectedDay(null)}
                className="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                Day: {selectedDay} <X size={12} />
              </button>
            )}
          </div>

          {/* Search & Dynamic Category/Client Filter */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schedule events..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 outline-none focus:border-black"
              />
            </div>

            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="All">All Operations ({aggregatedEvents.length})</option>
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-1.5 outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="All">All Clients ({dynamicClients.length})</option>
              {dynamicClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 3: Month Calendar Matrix Grid View */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Leading blank days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] p-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 opacity-40" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = isCurrentMonth && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  className={`min-h-[85px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                      : isToday
                      ? 'bg-black text-white border-black shadow-md'
                      : dayEvents.length > 0
                      ? 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-xs'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isToday ? 'text-[#CCFF00]' : isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isToday ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Micro event indicators */}
                  <div className="space-y-1 my-1">
                    {dayEvents.slice(0, 2).map(evt => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventForDetails(evt);
                        }}
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate ${
                          isToday
                            ? 'bg-white/15 text-white hover:bg-white/30'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className={`text-[8px] font-bold ${isToday ? 'text-[#CCFF00]' : 'text-indigo-600'}`}>
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Row 4: Scheduled Events Agenda Cards View */}
      {viewMode === 'agenda' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
              <CalendarIcon size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No scheduled operational events match your filters.</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEventForDetails(evt)}
                className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer card-tactile border-l-4 ${getEventAccentBorder(evt.eventType)}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getEventBadge(evt.eventType)}`}>
                      {evt.eventType}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-semibold text-gray-400">
                        {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventToDelete(evt);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Cancel Event"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-base text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{evt.notes || 'Scheduled operational check-in.'}</p>

                  <div className="space-y-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-indigo-600" />
                      <span className="font-semibold text-gray-800">{new Date(evt.startTime).toDateString()}</span>
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-rose-500" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-purple-600" />
                      <span className="truncate">Participants: {evt.participants.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono text-[10px]">Sync: Supabase</span>
                  <span className="font-bold text-gray-900 flex items-center gap-1 group-hover:text-indigo-600">
                    Inspect <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 360° Event Inspection Drawer */}
      <AnimatePresence>
        {selectedEventForDetails && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-gray-100">
                  <div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getEventBadge(selectedEventForDetails.eventType)} inline-block mb-2`}>
                      {selectedEventForDetails.eventType}
                    </span>
                    <h2 className="text-xl font-extrabold text-gray-900">{selectedEventForDetails.title}</h2>
                    <span className="text-xs text-gray-400 font-mono">ID: {selectedEventForDetails.id}</span>
                  </div>
                  <button
                    onClick={() => setSelectedEventForDetails(null)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Linkage Shortcuts */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  {selectedEventForDetails.relatedClientId && (
                    <button
                      onClick={() => {
                        const cId = selectedEventForDetails.relatedClientId;
                        setSelectedEventForDetails(null);
                        onNavigate('clients', cId);
                      }}
                      className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Users size={13} /> View Client 360°
                    </button>
                  )}
                  {selectedEventForDetails.relatedProjectId && (
                    <button
                      onClick={() => {
                        const pId = selectedEventForDetails.relatedProjectId;
                        setSelectedEventForDetails(null);
                        onNavigate('projects', pId);
                      }}
                      className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Briefcase size={13} /> View Project Hub
                    </button>
                  )}
                </div>

                {/* Event Schedule Specs */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Clock size={15} className="text-indigo-600 flex-shrink-0" />
                    <span>
                      <strong>Scheduled Start:</strong> {new Date(selectedEventForDetails.startTime).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {selectedEventForDetails.endTime && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={15} className="text-gray-400 flex-shrink-0" />
                      <span>
                        <strong>Target End:</strong> {new Date(selectedEventForDetails.endTime).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {selectedEventForDetails.location && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                      <div className="flex items-center gap-2 text-gray-800 truncate">
                        <MapPin size={15} className="text-rose-500 flex-shrink-0" />
                        <span className="truncate"><strong>Location:</strong> {selectedEventForDetails.location}</span>
                      </div>
                      {selectedEventForDetails.location.includes('http') && (
                        <a
                          href={selectedEventForDetails.location}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-black text-white font-bold rounded-lg text-[10px] flex items-center gap-1"
                        >
                          <Video size={11} /> Join
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700 pt-2 border-t border-gray-200/60">
                    <Users size={15} className="text-purple-600 flex-shrink-0" />
                    <span><strong>Participants:</strong> {selectedEventForDetails.participants.join(', ')}</span>
                  </div>
                  {selectedEventForDetails.relatedLeadName && (
                    <div className="flex items-center gap-2 text-indigo-700 pt-2 border-t border-gray-200/60 font-semibold text-xs">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span><strong>Linked Opportunity:</strong> {selectedEventForDetails.relatedLeadName}</span>
                    </div>
                  )}
                </div>

                {/* Agenda & Notes */}
                {selectedEventForDetails.notes && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                    <span className="font-bold text-gray-900 block text-xs mb-1">Agenda & Context:</span>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {selectedEventForDetails.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = selectedEventForDetails;
                      setSelectedEventForDetails(null);
                      setEventToDelete(toDelete);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Cancel Event
                  </button>

                  {selectedEventForDetails.relatedLeadId && (
                    <button
                      type="button"
                      onClick={() => {
                        const id = selectedEventForDetails.relatedLeadId;
                        setSelectedEventForDetails(null);
                        onNavigate('leads', id);
                      }}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Lead</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {selectedEventForDetails.relatedProjectId && (
                    <button
                      type="button"
                      onClick={() => {
                        const id = selectedEventForDetails.relatedProjectId;
                        setSelectedEventForDetails(null);
                        onNavigate('projects', id);
                      }}
                      className="px-3 py-2 rounded-xl bg-lime-50 hover:bg-lime-100 text-lime-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Open Project</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedEventForDetails(null)}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Event Modal */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Schedule Operational Calendar Event</h3>
              <button onClick={() => setIsAddEventModalOpen(false)} className="p-1 text-gray-400 hover:text-black cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Event Title *</label>
                <input type="text" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="e.g. Sprint Demo with Shrawello Execs" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Event Type</label>
                  <select value={newEvent.eventType} onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value as CalendarEventType })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer">
                    {EVENT_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Location / Link</label>
                  <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Google Meet / Zoom" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Time *</label>
                  <input type="datetime-local" value={newEvent.startTime.substring(0, 16)} onChange={(e) => setNewEvent({ ...newEvent, startTime: new Date(e.target.value).toISOString() })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target End Time</label>
                  <input type="datetime-local" value={newEvent.endTime.substring(0, 16)} onChange={(e) => setNewEvent({ ...newEvent, endTime: new Date(e.target.value).toISOString() })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Account Link</label>
                  <select
                    value={newEvent.relatedClientId}
                    onChange={(e) => {
                      const clientProjects = projects.filter(p => p.clientId === e.target.value);
                      setNewEvent({
                        ...newEvent,
                        relatedClientId: e.target.value,
                        relatedProjectId: clientProjects[0]?.id || '',
                        relatedLeadId: ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- No Client Account --</option>
                    {clients.map(c => (<option key={c.id} value={c.id}>{c.company}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Or Linked Lead / Opportunity</label>
                  <select
                    value={newEvent.relatedLeadId}
                    onChange={(e) => {
                      setNewEvent({
                        ...newEvent,
                        relatedLeadId: e.target.value,
                        relatedClientId: '',
                        relatedProjectId: ''
                      });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- No Lead Opportunity --</option>
                    {leads.map(l => (<option key={l.id} value={l.id}>{l.company || l.name} ({l.status})</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Agenda & Notes</label>
                <textarea rows={3} value={newEvent.notes} onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })} placeholder="Key talking points or deliverables to review..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black" />
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddEventModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer">Save Event</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Event Confirmation */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Cancel Event?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to remove <strong>{eventToDelete.title}</strong> from your schedule?
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setEventToDelete(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">Back</button>
              <button onClick={() => { deleteCalendarEvent(eventToDelete.id); setEventToDelete(null); toast.success('Event Cancelled', 'Event removed from schedule.'); }} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer">Cancel Event</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
