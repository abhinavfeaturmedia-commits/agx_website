import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Users, IndianRupee, Briefcase,
  CheckCircle2, ArrowUpRight, Filter, Download, Sparkles, Target, Layers,
  DollarSign, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface AnalyticsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ store, onNavigate }) => {
  const {
    leads, clients, projects, tasks, invoices, payments, expenses,
    currentUser
  } = store;

  const currentYear = new Date().getFullYear();
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const [dateRange, setDateRange] = useState<string>(`This Year (${currentYear})`);

  // Normalization helper for service types to prevent duplicate bucket creation
  const normalizeServiceType = (service?: string): string => {
    if (!service) return 'Custom AI Agent Systems';
    const s = service.toLowerCase().trim();
    if (s.includes('voice') || s.includes('agent') || s.includes('rag') || s.includes('llm')) {
      return 'Custom AI Agent Systems';
    }
    if (s.includes('workflow') || s.includes('n8n') || s.includes('make') || s.includes('automation')) {
      return 'Workflow Automation (n8n/Make)';
    }
    if (s.includes('platform') || s.includes('full-stack') || s.includes('web') || s.includes('app')) {
      return 'Full-Stack Platform Delivery';
    }
    if (s.includes('retainer') || s.includes('sla') || s.includes('maintenance')) {
      return 'Enterprise Retainers & SLA';
    }
    return service;
  };

  // Filter entities by date range
  const filteredData = useMemo(() => {
    const now = new Date();
    const isMonth = dateRange === 'This Month';
    const isQuarter = dateRange.startsWith('This Quarter');
    const isYear = dateRange.startsWith('This Year');

    const filterDate = (dateStr?: string) => {
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (isMonth) {
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }
      if (isQuarter) {
        const diffMs = now.getTime() - d.getTime();
        return diffMs >= 0 && diffMs <= 90 * 24 * 60 * 60 * 1000;
      }
      if (isYear) {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    };

    const fLeads = leads.filter(l => filterDate(l.createdAt));
    const fPayments = payments.filter(p => filterDate(p.paymentDate || p.createdAt));
    const fExpenses = expenses.filter(e => filterDate(e.expenseDate || e.createdAt));
    const fProjects = projects.filter(p => filterDate(p.startDate || p.createdAt));
    const fTasks = tasks.filter(t => filterDate(t.createdAt));
    const fInvoices = invoices.filter(i => filterDate(i.issueDate || i.createdAt));

    const totalRev = fPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalExp = fExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const netProf = totalRev - totalExp;
    const margin = totalRev > 0 ? Math.round((netProf / totalRev) * 100) : 0;
    
    const wonCount = fLeads.filter(l => l.status === 'WON').length;
    const convRate = fLeads.length > 0 ? Math.round((wonCount / fLeads.length) * 100) : 0;
    
    const pipeVal = fLeads
      .filter(l => ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION'].includes(l.status))
      .reduce((acc, l) => acc + (l.estimatedDealValue || 0), 0);
      
    const completedT = fTasks.filter(t => t.status === 'COMPLETED').length;
    const taskRate = fTasks.length > 0 ? Math.round((completedT / fTasks.length) * 100) : 0;

    const avgDealSize = wonCount > 0 ? Math.round(totalRev / wonCount) : (totalRev > 0 ? totalRev : 0);
    const outstandingInvoices = fInvoices
      .filter(i => i.status !== 'Paid')
      .reduce((s, i) => s + ((i.total || 0) - (i.paidAmount || 0)), 0);

    return {
      fLeads,
      fPayments,
      fExpenses,
      fProjects,
      fTasks,
      fInvoices,
      totalRev,
      totalExp,
      netProf,
      margin,
      convRate,
      wonCount,
      pipeVal,
      taskRate,
      avgDealSize,
      outstandingInvoices
    };
  }, [leads, payments, expenses, projects, tasks, invoices, dateRange]);

  // Clean Normalized Service Line Profitability
  const serviceLines = useMemo(() => {
    const map: { [key: string]: { revenue: number; cost: number; projectCount: number } } = {};

    // Standard service buckets
    const standardServices = [
      'Custom AI Agent Systems',
      'Workflow Automation (n8n/Make)',
      'Full-Stack Platform Delivery',
      'Enterprise Retainers & SLA'
    ];

    standardServices.forEach(srv => {
      map[srv] = { revenue: 0, cost: 0, projectCount: 0 };
    });

    // Populate from projects
    filteredData.fProjects.forEach(proj => {
      const srvName = normalizeServiceType(proj.serviceType);
      if (!map[srvName]) map[srvName] = { revenue: 0, cost: 0, projectCount: 0 };
      
      // Calculate revenue from payments or project received amount
      const projPayments = filteredData.fPayments.filter(p => p.projectId === proj.id || p.projectName === proj.name);
      const projRev = projPayments.reduce((s, p) => s + (p.amount || 0), 0) || proj.receivedAmount || 0;
      
      map[srvName].revenue += projRev;
      map[srvName].projectCount += 1;
    });

    // Populate direct costs from expenses assigned to a project
    let unassignedOverhead = 0;
    filteredData.fExpenses.forEach(exp => {
      if (exp.projectId) {
        const parentProject = filteredData.fProjects.find(p => p.id === exp.projectId);
        if (parentProject) {
          const srvName = normalizeServiceType(parentProject.serviceType);
          if (map[srvName]) map[srvName].cost += exp.amount || 0;
        }
      } else {
        unassignedOverhead += (exp.amount || 0);
      }
    });

    // Distribute unassigned overhead proportionally across service lines based on their revenue share
    if (unassignedOverhead > 0) {
      const totalDirectRevenue = Object.values(map).reduce((sum, item) => sum + item.revenue, 0);
      const activeServices = Object.keys(map).filter(k => map[k].revenue > 0 || map[k].projectCount > 0);

      if (totalDirectRevenue > 0) {
        Object.keys(map).forEach(srvName => {
          const share = map[srvName].revenue / totalDirectRevenue;
          map[srvName].cost += Math.round(unassignedOverhead * share);
        });
      } else if (activeServices.length > 0) {
        const equalShare = Math.round(unassignedOverhead / activeServices.length);
        activeServices.forEach(srvName => {
          map[srvName].cost += equalShare;
        });
      } else {
        const equalShare = Math.round(unassignedOverhead / standardServices.length);
        standardServices.forEach(srvName => {
          map[srvName].cost += equalShare;
        });
      }
    }

    return Object.entries(map).map(([name, data]) => {
      const profit = data.revenue - data.cost;
      const margin = data.revenue > 0 ? `${Math.round((profit / data.revenue) * 100)}%` : (data.projectCount > 0 ? '0%' : '100%');
      return {
        name,
        revenue: data.revenue,
        cost: data.cost,
        profit,
        margin,
        projects: data.projectCount
      };
    });
  }, [filteredData]);

  // Lead Conversion Funnel
  const funnelStages = useMemo(() => {
    const totalLeads = filteredData.fLeads.length || 1;
    const contacted = filteredData.fLeads.filter(l => ['CONTACTED', 'QUALIFIED', 'PROPOSAL SENT', 'NEGOTIATION', 'WON'].includes(l.status)).length;
    const inProp = filteredData.fLeads.filter(l => ['PROPOSAL SENT', 'NEGOTIATION', 'WON'].includes(l.status)).length;
    const won = filteredData.fLeads.filter(l => l.status === 'WON').length;

    return [
      { stage: 'New Leads', count: filteredData.fLeads.length, pct: '100%' },
      { stage: 'Contacted & Qualified', count: contacted, pct: `${Math.round((contacted / totalLeads) * 100)}%` },
      { stage: 'Proposals & Negotiation', count: inProp, pct: `${Math.round((inProp / totalLeads) * 100)}%` },
      { stage: 'Closed Won Deals', count: won, pct: `${Math.round((won / totalLeads) * 100)}%` }
    ];
  }, [filteredData]);

  // Lead Acquisition Source Attribution
  const sourceAttribution = useMemo(() => {
    const map: { [key: string]: { leads: number; won: number; value: number } } = {};
    const sources = ['Website Inbound', 'Referral', 'LinkedIn Outreach', 'Event / Demo', 'Cold Email'];

    sources.forEach(s => {
      map[s] = { leads: 0, won: 0, value: 0 };
    });

    filteredData.fLeads.forEach(l => {
      const src = l.source || 'Website Inbound';
      if (!map[src]) map[src] = { leads: 0, won: 0, value: 0 };
      map[src].leads += 1;
      if (l.status === 'WON') {
        map[src].won += 1;
        map[src].value += (l.estimatedDealValue || 0);
      }
    });

    return Object.entries(map).map(([source, data]) => ({
      source,
      leads: data.leads,
      won: data.won,
      convRate: data.leads > 0 ? `${Math.round((data.won / data.leads) * 100)}%` : '0%',
      pipelineValue: data.value
    }));
  }, [filteredData]);

  const handleExportReport = () => {
    exportService.exportToCsv(`agx_executive_intelligence_${dateRange.replace(/\s+/g, '_').toLowerCase()}`, [
      ...serviceLines.map(srv => ({
        Type: 'Service Line',
        Name: srv.name,
        Projects: srv.projects,
        RevenueINR: srv.revenue,
        CostINR: srv.cost,
        ProfitINR: srv.profit,
        Margin: srv.margin
      })),
      ...sourceAttribution.map(src => ({
        Type: 'Lead Channel',
        Name: src.source,
        Projects: src.leads,
        RevenueINR: src.pipelineValue,
        CostINR: 0,
        ProfitINR: src.pipelineValue,
        Margin: src.convRate
      }))
    ]);
    toast.success('Report Exported', 'Executive intelligence statement downloaded as CSV.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Executive Analytics & Intelligence
          </h2>
          <p className="text-xs text-gray-500">
            Actionable insights into revenue velocity, conversion efficiency, and operational profitability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3.5 py-2 outline-none shadow-xs cursor-pointer hover:border-gray-300"
          >
            <option value="This Month">This Month</option>
            <option value={`This Quarter (Q${currentQuarter} ${currentYear})`}>This Quarter (Q{currentQuarter} {currentYear})</option>
            <option value={`This Year (${currentYear})`}>This Year ({currentYear})</option>
            <option value="All Time">All Time</option>
          </select>
          <button
            onClick={handleExportReport}
            className="px-3.5 py-2 rounded-xl bg-black text-white font-bold text-xs shadow-md hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Row 1: Top 4 KPI Metrics with Double-Bezel Architecture & SVG Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lead Conversion Rate</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">{filteredData.convRate}%</span>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1 tabular-nums">
                <TrendingUp size={13} /> {filteredData.wonCount} Closed Deals
              </span>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                <Target size={18} />
              </div>
              <svg className="w-16 h-6 text-emerald-500/70 mt-2 overflow-visible" viewBox="0 0 64 24">
                <path d="M0,20 Q16,18 32,10 T64,4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Pipeline Value</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block tabular-nums">₹{filteredData.pipeVal.toLocaleString('en-IN')}</span>
              <span className="text-xs text-indigo-700 font-bold mt-1 block">In proposal & negotiation</span>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
                <Zap size={18} />
              </div>
              <svg className="w-16 h-6 text-indigo-500/70 mt-2 overflow-visible" viewBox="0 0 64 24">
                <path d="M0,22 Q20,16 38,12 T64,2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Net Operating Profit</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">₹{filteredData.netProf.toLocaleString('en-IN')}</span>
              <span className="text-xs text-emerald-700 font-bold mt-1 block tabular-nums">{filteredData.margin}% Net Margin</span>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
                <IndianRupee size={18} />
              </div>
              <svg className="w-16 h-6 text-emerald-500/70 mt-2 overflow-visible" viewBox="0 0 64 24">
                <path d="M0,18 Q18,22 36,12 T64,3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Team Delivery Score</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">{filteredData.taskRate}%</span>
              <span className="text-xs text-purple-700 font-bold mt-1 block">On-time sprint milestones</span>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
                <CheckCircle2 size={18} />
              </div>
              <svg className="w-16 h-6 text-purple-500/70 mt-2 overflow-visible" viewBox="0 0 64 24">
                <path d="M0,16 Q20,10 40,8 T64,2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales Funnel & Lead Source Attribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Conversion Funnel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-base text-gray-900">Sales Conversion Funnel</h3>
              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-0.5 cursor-pointer btn-press"
              >
                Inspect Leads <ArrowRight size={12} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-5">Pipeline stage drop-off and progression</p>

            <div className="space-y-3">
              {funnelStages.map((stage, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 flex items-center justify-between card-tactile hover:bg-white hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-2xs ${
                      idx === 3 ? 'bg-emerald-100 text-emerald-800' :
                      idx === 2 ? 'bg-[#CCFF00] text-black' :
                      idx === 1 ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      0{idx + 1}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-xs block">{stage.stage}</span>
                      <span className="text-[10px] text-gray-400">Step {idx + 1} of 4</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 text-xs tabular-nums block">{stage.count} Deals</span>
                    <span className={`text-[10px] font-bold tabular-nums ${
                      idx === 3 ? 'text-emerald-600' : 'text-indigo-600'
                    }`}>{stage.pct} conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>Filtered Period: <strong>{dateRange}</strong></span>
            <span className="text-emerald-600 font-bold">Active Velocity</span>
          </div>
        </div>

        {/* Lead Source Acquisition Attribution (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Acquisition Channel Attribution</h3>
              <p className="text-xs text-gray-400">Lead volume, won rate, and pipeline value by source</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3">Acquisition Channel</th>
                  <th className="py-3 px-3">Total Leads</th>
                  <th className="py-3 px-3">Deals Won</th>
                  <th className="py-3 px-3">Win Rate</th>
                  <th className="py-3 px-3 text-right">Value Won</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {sourceAttribution.map((src, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-gray-900">{src.source}</td>
                    <td className="py-3 px-3 font-semibold text-gray-600">{src.leads}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">{src.won}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                        {src.convRate}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-gray-900 text-right">
                      ₹{src.pipelineValue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Normalized Service Line Profitability */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Service Line & Engineering Profitability</h3>
            <p className="text-xs text-gray-400">Dynamic revenue realization, direct project expenditure, and operating margins</p>
          </div>
          <button
            onClick={() => onNavigate('projects')}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Briefcase size={13} /> View Projects Hub
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Service Offering</th>
                <th className="py-3 px-3">Engagements</th>
                <th className="py-3 px-3">Realized Revenue</th>
                <th className="py-3 px-3">Direct Operating Cost</th>
                <th className="py-3 px-3">Net Profit</th>
                <th className="py-3 px-4 text-right">Operating Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {serviceLines.map((srv, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{srv.name}</td>
                  <td className="py-3.5 px-3 font-semibold text-gray-600">{srv.projects} Projects</td>
                  <td className="py-3.5 px-3 font-extrabold text-emerald-600">₹{srv.revenue.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-semibold text-rose-600">-₹{srv.cost.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-3 font-extrabold text-gray-900">₹{srv.profit.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10px]">
                      {srv.margin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Financial Velocity & Quick Navigation Footprint */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Realized Inflows</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">₹{filteredData.totalRev.toLocaleString('en-IN')}</span>
          <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-2 group-hover:underline">
            Manage Invoices & Ledger <ArrowRight size={12} />
          </span>
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Sprint Deliverables</span>
          <span className="text-xl font-black text-purple-600 mt-1 block">{filteredData.fTasks.length} Active Tasks</span>
          <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-2 group-hover:underline">
            Sprint Board & Velocity <ArrowRight size={12} />
          </span>
        </div>

        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending Collections</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">₹{filteredData.outstandingInvoices.toLocaleString('en-IN')}</span>
          <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-2 group-hover:underline">
            Accounts Receivable <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  );
};
