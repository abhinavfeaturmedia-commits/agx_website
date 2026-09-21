import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Users, Briefcase, IndianRupee, CheckSquare, ChevronRight,
  Plus, Calendar as CalendarIcon, Clock, Sparkles, ArrowUpRight,
  FileText, Shield, ArrowRight, RefreshCw, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';

interface DashboardViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  onOpenQuickCreate: (type: 'lead' | 'client' | 'project' | 'task' | 'invoice' | 'event') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ store, onNavigate, onOpenQuickCreate }) => {
  const {
    currentUser, leads, clients, projects, tasks, invoices, payments, expenses, events,
    totalRevenue, totalExpenses, netProfit, profitMargin, conversionRate, pipelineValue,
    taskCompletionRate, outstandingInvoicesTotal, isSupabaseConnected, isSyncing, refreshFromCloud
  } = store;

  const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filtered entity sets for top KPIs
  const activeLeads = useMemo(() => leads.filter(l => l.status !== 'LOST' && l.status !== 'WON'), [leads]);
  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'COMPLETED'), [projects]);
  const highPriorityLeadsCount = useMemo(() => leads.filter(l => l.priority === 'High' || l.priority === 'Urgent').length, [leads]);
  const totalMilestones = useMemo(() => projects.reduce((acc, p) => acc + (p.milestones?.length || 0), 0), [projects]);

  // Quick top cards data
  const topMetrics = [
    {
      title: 'Sales Pipeline',
      subtitle: `${activeLeads.length} Active Leads (₹${pipelineValue.toLocaleString('en-IN')})`,
      rate: (Math.min(5, 3.5 + conversionRate / 50)).toFixed(1),
      rateType: `${conversionRate}% Win Rate`,
      type: 'Conversion',
      category: `${highPriorityLeadsCount} High Priority`,
      iconBg: 'bg-rose-50 text-rose-500 border border-rose-100',
      route: 'leads'
    },
    {
      title: 'Active Projects',
      subtitle: `${activeProjects.length} in Production (${projects.length} Total)`,
      rate: (Math.min(5, 3.8 + taskCompletionRate / 80)).toFixed(1),
      rateType: `${taskCompletionRate}% Delivery Health`,
      type: 'Engineering',
      category: `${totalMilestones} Milestones`,
      iconBg: 'bg-lime-50 text-lime-700 border border-lime-200',
      route: 'projects'
    },
    {
      title: 'Net Revenue',
      subtitle: `₹${totalRevenue.toLocaleString('en-IN')} Collected`,
      rate: profitMargin !== '0' && Number(profitMargin) > 0 ? (Math.min(5, 3.6 + Number(profitMargin) / 40)).toFixed(1) : '4.5',
      rateType: `${profitMargin}% Margin (₹${netProfit.toLocaleString('en-IN')})`,
      type: 'Financials',
      category: `₹${outstandingInvoicesTotal.toLocaleString('en-IN')} Pending`,
      iconBg: 'bg-blue-50 text-blue-500 border border-blue-100',
      route: 'finance'
    }
  ];

  // Output Shipped (Tasks & Deliverables Closed)
  const completedTasksList = useMemo(() => tasks.filter(t => t.status === 'COMPLETED'), [tasks]);
  const completedTasksCount = completedTasksList.length;
  const totalTasksCount = tasks.length;
  // Dynamic Sprint Completion Rate: live calculation
  const sprintCompletionRate = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 100;

  // On-time delivery calculation based on completion / due dates
  const onTimeDeliveryRate = useMemo(() => {
    if (completedTasksList.length === 0) return 100;
    const onTimeCount = completedTasksList.filter(t => {
      if (!t.dueDate) return true;
      const due = new Date(t.dueDate).getTime();
      const updated = new Date(t.updatedAt || t.createdAt).getTime();
      return updated <= due || due >= Date.now();
    }).length;
    return Math.min(100, Math.round((onTimeCount / completedTasksList.length) * 100));
  }, [completedTasksList]);

  // Dynamic Chart Data based on timeRange (Output Shipped / Deliverables)
  const chartData = useMemo(() => {
    if (timeRange === 'Weekly') {
      const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const todayDayIdx = new Date().getDay();
      
      // Calculate real task completions per day of week
      const realDailyCounts = [0, 0, 0, 0, 0, 0, 0];
      completedTasksList.forEach(t => {
        const d = new Date(t.updatedAt || t.dueDate || t.createdAt);
        if (!isNaN(d.getTime())) {
          realDailyCounts[d.getDay()] += 1;
        }
      });

      const maxVal = Math.max(...realDailyCounts, 5);

      return daysOfWeek.map((day, idx) => {
        const isToday = idx === todayDayIdx;
        const count = realDailyCounts[idx];
        const heightPct = count > 0 ? Math.min(100, Math.max(18, Math.round((count / maxVal) * 100))) : 8;
        return {
          label: day,
          height: `${heightPct}%`,
          value: `${count} Deliverables`,
          count,
          active: isToday,
          info: isToday ? `${count} Deliverables Shipped • Today` : `${count} Shipped • ${day}`
        };
      });
    }

    if (timeRange === 'Monthly') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const currentWeekIdx = Math.min(3, Math.floor(new Date().getDate() / 7));
      
      const realWeeklyCounts = [0, 0, 0, 0];
      completedTasksList.forEach(t => {
        const d = new Date(t.updatedAt || t.dueDate || t.createdAt);
        if (!isNaN(d.getTime())) {
          const wIdx = Math.min(3, Math.floor(d.getDate() / 7));
          realWeeklyCounts[wIdx] += 1;
        }
      });

      const maxWeekly = Math.max(...realWeeklyCounts, 5);

      return weeks.map((week, idx) => {
        const isCurrent = idx === currentWeekIdx;
        const count = realWeeklyCounts[idx];
        const heightPct = count > 0 ? Math.min(100, Math.max(18, Math.round((count / maxWeekly) * 100))) : 8;
        return {
          label: week,
          height: `${heightPct}%`,
          value: `${count} Tasks`,
          count,
          active: isCurrent,
          info: isCurrent ? `${count} Deliverables Shipped • Current Sprint` : `${count} Tasks Shipped • ${week}`
        };
      });
    }

    // Yearly
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();

    const realMonthlyCounts = Array(12).fill(0);
    completedTasksList.forEach(t => {
      const d = new Date(t.updatedAt || t.dueDate || t.createdAt);
      if (!isNaN(d.getTime())) {
        realMonthlyCounts[d.getMonth()] += 1;
      }
    });

    const maxMonthly = Math.max(...realMonthlyCounts, 10);

    return months.map((month, idx) => {
      const isCurrent = idx === currentMonthIdx;
      const isPastOrCurrent = idx <= currentMonthIdx;
      const count = realMonthlyCounts[idx];
      const heightPct = count > 0 ? Math.min(100, Math.max(15, Math.round((count / maxMonthly) * 100))) : 8;
      return {
        label: month,
        height: `${heightPct}%`,
        value: isPastOrCurrent ? `${count} Tasks` : 'Planned',
        count,
        active: isCurrent,
        info: isCurrent ? `${count} Deliverables Shipped • Active Month` : (isPastOrCurrent ? `${count} Deliverables Shipped` : 'Sprint Planned')
      };
    });
  }, [timeRange, completedTasksList]);

  const activeTooltipData = useMemo(() => {
    if (hoveredBarIndex !== null && chartData[hoveredBarIndex]) {
      return chartData[hoveredBarIndex];
    }
    return chartData.find(b => b.active) || chartData[0];
  }, [hoveredBarIndex, chartData]);

  const totalShippedDisplay = useMemo(() => {
    if (timeRange === 'Weekly') return chartData.reduce((acc, b) => acc + (b.count || 0), 0);
    if (timeRange === 'Monthly') return chartData.reduce((acc, b) => acc + (b.count || 0), 0);
    return chartData.filter(b => b.count > 0).reduce((acc, b) => acc + (b.count || 0), 0);
  }, [chartData, timeRange]);

  // Dynamic Daily Schedule derived from live tasks and events with real deep-linking
  const scheduleItems = useMemo(() => {
    const combined: Array<{
      id: string;
      title: string;
      tag: string;
      bgColor: string;
      icon: any;
      route: string;
      status?: string;
    }> = [];

    // Add immediate tasks
    tasks.slice(0, 3).forEach((t, idx) => {
      combined.push({
        id: t.id,
        title: t.title,
        tag: `Task · Due ${t.dueDate || 'Sprint End'} (${t.assignedTo})`,
        bgColor: idx === 0 ? 'bg-indigo-100/80 text-indigo-700' : (idx === 1 ? 'bg-rose-100/80 text-rose-700' : 'bg-lime-100/90 text-lime-800'),
        icon: CheckSquare,
        route: 'tasks',
        status: t.status
      });
    });

    // Add upcoming events
    events.slice(0, 2).forEach((ev) => {
      combined.push({
        id: ev.id,
        title: ev.title,
        tag: `${ev.eventType} · ${ev.startTime ? new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'}`,
        bgColor: 'bg-amber-100/80 text-amber-800',
        icon: CalendarIcon,
        route: 'calendar',
        status: ev.eventType
      });
    });

    return combined.slice(0, 4);
  }, [tasks, events]);

  // Month navigation & days calculation
  const currentYear = calendarDate.getFullYear();
  const currentMonthIdx = calendarDate.getMonth();
  const monthName = calendarDate.toLocaleString('default', { month: 'long' });
  const daysInCurrentMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIdx, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  // Identify which days in the currently viewed month have tasks/deadlines
  const daysWithDeadlines = useMemo(() => {
    const daySet = new Set<number>();
    tasks.forEach(t => {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx) {
          daySet.add(d.getDate());
        }
      }
    });
    events.forEach(ev => {
      if (ev.startTime) {
        const d = new Date(ev.startTime);
        if (d.getFullYear() === currentYear && d.getMonth() === currentMonthIdx) {
          daySet.add(d.getDate());
        }
      }
    });
    return daySet;
  }, [tasks, events, currentYear, currentMonthIdx]);

  // Exact date matching for active tasks / events on the selected day
  const tasksForSelectedDay = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonthIdx &&
        d.getDate() === selectedDay
      );
    });
  }, [tasks, currentYear, currentMonthIdx, selectedDay]);

  const fallbackTasks = useMemo(() => {
    if (tasksForSelectedDay.length > 0) return tasksForSelectedDay;
    return tasks.filter(t => t.status !== 'COMPLETED').slice(0, 3);
  }, [tasksForSelectedDay, tasks]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              {greeting}, {(currentUser?.fullName || 'Admin').split(' ')[0]} 👋
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black text-[#CCFF00] uppercase tracking-wider">
              {currentUser?.role || 'Super Admin'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Here is what's happening across AGX operations, revenue, and client deliverables today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickCreate('lead')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} className="text-[#CCFF00]" /> Add Lead
          </button>
          <button
            onClick={() => onOpenQuickCreate('project')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#CCFF00] text-black text-xs font-bold hover:bg-[#b8e600] transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {/* Row 1: 3 Top Cards + 1 Dark OS Promo Card with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((card, idx) => (
          <div
            key={idx}
            onClick={() => onNavigate(card.route)}
            className="double-bezel-outer card-tactile cursor-pointer group"
          >
            <div className="double-bezel-inner p-5 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${card.iconBg}`}>
                    {idx === 0 ? <TrendingUp size={20} /> : idx === 1 ? <Briefcase size={20} /> : <IndianRupee size={20} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-black transition-colors">{card.title}</h3>
                    <p className="text-xs text-gray-500 font-medium tabular-nums">{card.subtitle}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-50 group-hover:bg-black flex items-center justify-center transition-colors">
                  <ArrowUpRight size={14} className="text-gray-400 group-hover:text-[#CCFF00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Health</span>
                  <span className="font-extrabold text-gray-900 flex items-center gap-1 tabular-nums">
                    ★ {card.rate} <span className="text-gray-400 font-normal text-[11px]">· {card.rateType}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Category</span>
                  <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-lg text-[10px]">{card.category}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* AGX Business OS Dark Card with Double-Bezel */}
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner bg-gradient-to-br from-[#0E131F] to-[#080B12] text-white p-5 h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#CCFF00]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black italic tracking-tighter text-white">
                  AG<span className="text-[#CCFF00]">X</span> OS
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-[#CCFF00] animate-pulse shadow-[0_0_6px_#CCFF00]' : 'bg-amber-400'}`} />
                  {isSupabaseConnected ? 'Live Cloud' : 'Cache Mode'}
                </span>
              </div>
              <h4 className="font-extrabold text-base text-white">Automate AGX</h4>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Connect Supabase, WhatsApp triggers & AI agent pipelines.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onNavigate('analytics')}
                className="flex-1 py-2 px-3 rounded-xl bg-[#CCFF00] text-black font-extrabold text-xs hover:bg-[#b8e600] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md btn-press"
              >
                <Sparkles size={13} /> Full Analytics
              </button>
              <button
                onClick={() => refreshFromCloud(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors cursor-pointer btn-press"
                title="Sync latest database records"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin text-[#CCFF00]' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Hours Activity + Daily Schedule + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hours / Output Activity (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">{timeRange} Output</h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-0.5 tabular-nums">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>{sprintCompletionRate}% Sprint Completion</span>
                </div>
              </div>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            {/* Dynamic Bar Chart with interactive hover state */}
            <div className="mt-8 mb-4 h-44 flex items-end justify-between px-1 relative">
              {/* Dynamic Interactive Tooltip that tracks active or hovered bar */}
              <div
                style={{
                  left: hoveredBarIndex !== null
                    ? `${Math.max(15, Math.min(85, ((hoveredBarIndex + 0.5) / chartData.length) * 100))}%`
                    : '50%'
                }}
                className="absolute top-1 -translate-x-1/2 bg-[#0B0E14] text-white text-[10px] font-medium py-1 px-2.5 rounded-lg shadow-xl flex items-center gap-1.5 z-10 transition-all duration-200 whitespace-nowrap pointer-events-none"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] shadow-[0_0_6px_#CCFF00]" />
                <span className="tabular-nums">{activeTooltipData.info || `${activeTooltipData.value} • High Output`}</span>
              </div>

              {chartData.map((bar, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="flex flex-col items-center gap-2 group cursor-pointer flex-1 px-0.5"
                >
                  <div className="w-full max-w-[28px] bg-gray-100 rounded-full h-32 flex items-end p-0.5 relative">
                    <div
                      style={{ height: bar.height }}
                      className={`w-full rounded-full transition-all duration-300 group-hover:opacity-95 ${
                        bar.active || hoveredBarIndex === idx
                          ? 'bg-[#CCFF00] shadow-md shadow-[#CCFF00]/40'
                          : 'bg-gray-800 group-hover:bg-gray-700'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-semibold transition-colors tabular-nums ${
                    bar.active || hoveredBarIndex === idx ? 'text-gray-900 font-extrabold' : 'text-gray-400'
                  }`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 tabular-nums">
            <span>Total Shipped: <strong className="text-gray-900 font-extrabold">{totalShippedDisplay} Tasks</strong></span>
            <span className="text-emerald-600 font-extrabold">{onTimeDeliveryRate}% On-Time Delivery</span>
          </div>
        </div>

        {/* Daily Schedule (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Daily Schedule</h3>
                <p className="text-[11px] text-gray-400">Live operational deliverables & meetings</p>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                View all <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {scheduleItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  <CalendarIcon size={24} className="mx-auto mb-2 opacity-40" />
                  <p>No events scheduled for today.</p>
                </div>
              ) : (
                scheduleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onNavigate(item.route, item.id)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/70 hover:bg-gray-100/90 border border-gray-100 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${item.bgColor}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-black transition-colors truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-medium truncate block">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onOpenQuickCreate('event')}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} className="text-[#CCFF00] bg-black rounded-full p-0.5" /> Schedule New Event
          </button>
        </div>

        {/* Mini Calendar & Active Tasks Due (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-900">{monthName}, {currentYear}</span>
              <div className="flex items-center gap-1 text-gray-400">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  title="Previous Month"
                >
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400 mb-1">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] mb-4 font-medium">
              {/* Offset empty days for start of month */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <span key={`pad-${i}`} className="text-gray-200 py-1">·</span>
              ))}
              {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => {
                const isSelected = d === selectedDay;
                const hasDeadlines = daysWithDeadlines.has(d);

                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`py-1 rounded-full transition-all text-[11px] cursor-pointer relative flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-[#CCFF00] text-black font-black shadow-xs'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{d}</span>
                    {hasDeadlines && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-indigo-600 -mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Assignments / Tasks Below Calendar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-900">
                  Deadlines ({monthName.substring(0, 3)} {selectedDay})
                </h4>
                <button
                  onClick={() => onOpenQuickCreate('task')}
                  className="text-gray-400 hover:text-black cursor-pointer p-0.5 rounded hover:bg-gray-100"
                  title="Add Task for this date"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {fallbackTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onNavigate('tasks', task.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-gray-100/90 border border-gray-100 text-xs transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 text-[11px] truncate group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium">
                        {task.dueDate || 'Sprint backlog'} • {task.assignedTo}
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'IN PROGRESS' ? 'bg-indigo-100 text-indigo-700' :
                      task.status === 'IN REVIEW' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}

                {tasksForSelectedDay.length === 0 && (
                  <p className="text-[10px] text-gray-400 text-center py-2">
                    Showing upcoming priority deliverables.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Active Projects with Circular Progress Rings */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Projects You're Managing</h3>
            <p className="text-xs text-gray-400">Live development deliverables, milestones & team tracking</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-700">
              Active ({activeProjects.length})
            </span>
            <button
              onClick={() => onOpenQuickCreate('project')}
              className="w-8 h-8 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black flex items-center justify-center shadow-sm cursor-pointer transition-colors"
              title="Create New Project"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {projects.map((proj) => {
            // SVG circular progress math
            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (proj.progress / 100) * circumference;

            return (
              <div
                key={proj.id}
                onClick={() => onNavigate('projects', proj.id)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gray-50/60 hover:bg-gray-100/90 border border-gray-100 transition-all cursor-pointer group gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                    {proj.serviceType === 'Custom AI Agent' ? '🤖' : proj.serviceType === 'Workflow Automation' ? '⚡' : '🚀'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-black transition-colors truncate">
                      {proj.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                      <span className="font-semibold text-gray-700">{proj.clientName}</span>
                      <span>•</span>
                      <span>PM: {proj.projectManager}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-10">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Commercials</span>
                    <span className="text-xs font-bold text-gray-900">
                      ₹{proj.receivedAmount.toLocaleString('en-IN')} <span className="text-gray-400 font-normal">/ ₹{proj.projectValue.toLocaleString('en-IN')}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Target Due</span>
                    <span className="text-xs font-bold text-gray-800">{proj.dueDate || 'Sprint Backlog'}</span>
                  </div>

                  {/* Circular Progress Ring */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          fill="transparent"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r={radius}
                          stroke="#CCFF00"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-extrabold text-gray-900">{proj.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
