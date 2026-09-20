import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle, CheckCircle2, Clock, Filter, Search, Plus,
  Download, ArrowRight, X, Sparkles, Edit3, Trash2, CheckSquare,
  Eye, User, MessageSquare, ExternalLink, ShieldAlert,
  ChevronRight, ArrowUpRight, Share2, Layers, Check
} from 'lucide-react';
import { useCrmStore } from '../../lib/crmStore';
import { ProjectIssue, IssueStatus, IssuePriority, IssueType } from '../../types/crm';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface IssuesViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const ISSUE_STAGES: { status: IssueStatus; label: string; badge: string }[] = [
  { status: 'REPORTED', label: 'Reported', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { status: 'IN REVIEW', label: 'In Review', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  { status: 'IN PROGRESS', label: 'In Progress', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  { status: 'RESOLVED', label: 'Resolved', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { status: 'CLOSED', label: 'Closed', badge: 'bg-gray-100 text-gray-700 border-gray-200' }
];

export const IssuesView: React.FC<IssuesViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    issues, updateIssue, updateIssueStatus, deleteIssue, convertIssueToTask,
    projects, teamMembers, currentUser, getProjectPortalUrl
  } = store;

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Detail Modal State
  const [activeIssue, setActiveIssue] = useState<ProjectIssue | null>(() => {
    if (initialSelectedId) {
      return issues.find(i => i.id === initialSelectedId || i.ticketNumber === initialSelectedId) || null;
    }
    return null;
  });

  const [resolutionInput, setResolutionInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Sync inputs when active issue opens
  const handleOpenIssue = (issue: ProjectIssue) => {
    setActiveIssue(issue);
    setResolutionInput(issue.resolutionNotes || '');
    setAdminNoteInput(issue.adminNotes || '');
    setAssigneeInput(issue.assignedTo || '');
  };

  const handleSaveResolution = () => {
    if (!activeIssue) return;
    updateIssue(activeIssue.id, {
      resolutionNotes: resolutionInput.trim() || undefined,
      adminNotes: adminNoteInput.trim() || undefined,
      assignedTo: assigneeInput || undefined
    });
    toast.success('Notes Saved', `Issue #${activeIssue.ticketNumber} updated.`);
    setActiveIssue(prev => prev ? {
      ...prev,
      resolutionNotes: resolutionInput.trim() || undefined,
      adminNotes: adminNoteInput.trim() || undefined,
      assignedTo: assigneeInput || undefined
    } : null);
  };

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchSearch =
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.projectName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (selectedProject !== 'All' && issue.projectId !== selectedProject) return false;
      if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      if (selectedType !== 'All' && issue.issueType !== selectedType) return false;

      return true;
    });
  }, [issues, searchQuery, selectedProject, selectedPriority, selectedStatus, selectedType]);

  // Metrics
  const totalIssues = issues.length;
  const reportedCount = issues.filter(i => i.status === 'REPORTED').length;
  const inProgressCount = issues.filter(i => i.status === 'IN PROGRESS' || i.status === 'IN REVIEW').length;
  const resolvedCount = issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

  // Export CSV
  const handleExportCsv = () => {
    exportService.exportToCsv('agx_client_issues', filteredIssues.map(i => ({
      TicketNumber: i.ticketNumber,
      Project: i.projectName,
      Client: i.clientName,
      Title: i.title,
      Category: i.issueType,
      Priority: i.priority,
      Status: i.status,
      Reporter: `${i.reporterName} (${i.reporterEmail})`,
      AssignedEngineer: i.assignedTo || 'Unassigned',
      ResolutionNotes: i.resolutionNotes || '',
      CreatedDate: i.createdAt,
      ResolvedDate: i.resolvedAt || ''
    })));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Client Issues & QA Operations
            </h2>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {reportedCount} Pending
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Issues uploaded directly by project owners through their secure client links. Track, triage, and convert to sprint tasks.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Header with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Logged</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">{totalIssues} Tickets</span>
              <span className="text-xs text-gray-500 mt-1 block font-medium">Across all client projects</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold shadow-xs">
              <Layers size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Reported & Under Review</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">{reportedCount} Urgent</span>
              <span className="text-xs text-amber-700 font-bold mt-1 block">Awaiting engineering triage</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">In Production Sprint</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">{inProgressCount} Active</span>
              <span className="text-xs text-purple-700 font-bold mt-1 block">Assigned to engineering</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Clock size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Resolution Velocity</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">{resolutionRate}% Solved</span>
              <span className="text-xs text-emerald-700 font-bold mt-1 block tabular-nums">{resolvedCount} Completed & verified</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by ticket #, title, project, reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 text-xs">
            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium cursor-pointer"
            >
              <option value="All">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="REPORTED">Reported</option>
              <option value="IN REVIEW">In Review</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            {(searchQuery || selectedProject !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedProject('All');
                  setSelectedPriority('All');
                  setSelectedStatus('All');
                }}
                className="text-xs text-indigo-600 font-bold hover:underline whitespace-nowrap cursor-pointer px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View 1: Kanban Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {ISSUE_STAGES.map(stage => {
            const stageIssues = filteredIssues.filter(i => i.status === stage.status);

            return (
              <div
                key={stage.status}
                className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-200/70 flex flex-col min-w-[240px]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-extrabold text-xs text-gray-800 tracking-wide">{stage.label}</span>
                  <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                    {stageIssues.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[120px]">
                  {stageIssues.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                      No issues in this stage
                    </div>
                  ) : (
                    stageIssues.map(issue => (
                      <div
                        key={issue.id}
                        onClick={() => handleOpenIssue(issue)}
                        className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-black/30 transition-all cursor-pointer group space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                            #{issue.ticketNumber}
                          </span>
                          <div className="flex items-center gap-1">
                            {(() => {
                              if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') return null;
                              const ageHours = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
                              const isBreach = (issue.priority === 'Critical' && ageHours > 4) || (issue.priority === 'High' && ageHours > 24);
                              if (isBreach) {
                                return (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200" title={`SLA Breach: ${Math.round(ageHours)}h elapsed`}>
                                    <ShieldAlert size={10} className="animate-pulse" /> SLA
                                  </span>
                                );
                              }
                              return null;
                            })()}
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                              issue.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                              issue.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                        </div>

                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {issue.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                          <span className="truncate max-w-[120px] font-medium text-gray-700">
                            {issue.projectName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {issue.assignedTo && (
                          <div className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                            <User size={11} /> {issue.assignedTo}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Table */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-3">Project & Client</th>
                  <th className="py-3 px-3">Issue Summary</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Reporter</th>
                  <th className="py-3 px-3">Assigned</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIssues.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No issues match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map(issue => (
                    <tr
                      key={issue.id}
                      onClick={() => handleOpenIssue(issue)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 flex items-center gap-2">
                        <span>#{issue.ticketNumber}</span>
                        {(() => {
                          if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') return null;
                          const ageHours = (Date.now() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60);
                          const isBreach = (issue.priority === 'Critical' && ageHours > 4) || (issue.priority === 'High' && ageHours > 24);
                          if (isBreach) {
                            return (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                <ShieldAlert size={10} className="animate-pulse" /> SLA
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="font-bold text-gray-900 block">{issue.projectName}</strong>
                        <span className="text-[11px] text-gray-500">{issue.clientName}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-900 max-w-xs truncate">
                        {issue.title}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold">
                          {issue.issueType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          issue.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                          issue.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                          issue.status === 'IN PROGRESS' ? 'bg-purple-100 text-purple-800' :
                          issue.status === 'IN REVIEW' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-700">
                        {issue.reporterName}
                      </td>
                      <td className="py-3 px-3 text-indigo-600 font-medium">
                        {issue.assignedTo || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenIssue(issue)}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-black hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Triage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Detail & Triage Drawer */}
      <AnimatePresence>
        {activeIssue && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                        #{activeIssue.ticketNumber}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        activeIssue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        activeIssue.status === 'IN PROGRESS' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {activeIssue.status}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {activeIssue.priority} Priority
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-gray-900">{activeIssue.title}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Project: <strong className="text-gray-800">{activeIssue.projectName}</strong> • Client: {activeIssue.clientName}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveIssue(null)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black cursor-pointer transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Fast Status Action Bar */}
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="font-bold text-gray-600">Quick Stage Workflow:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ISSUE_STAGES.map(s => (
                      <button
                        key={s.status}
                        onClick={() => {
                          updateIssueStatus(activeIssue.id, s.status);
                          setActiveIssue(prev => prev ? { ...prev, status: s.status } : null);
                        }}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          activeIssue.status === s.status
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reporter & Contact Details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Reporter Name</span>
                    <strong className="text-gray-900 block font-extrabold">{activeIssue.reporterName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Reporter Email</span>
                    <a href={`mailto:${activeIssue.reporterEmail}`} className="text-indigo-600 font-semibold hover:underline block truncate">
                      {activeIssue.reporterEmail}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Date Logged</span>
                    <span className="text-gray-700 block">
                      {new Date(activeIssue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Description Body */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Client Description & Reproduction Steps</span>
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {activeIssue.description}
                  </div>
                </div>

                {/* Screenshots */}
                {activeIssue.attachments && activeIssue.attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Client Uploaded Attachments ({activeIssue.attachments.length})</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      {activeIssue.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveScreenshot(att)}
                          className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                        >
                          <img src={att} alt="attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Triage & Developer Assignment Form */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">Engineering Assignment & Resolution</span>
                    <button
                      onClick={() => convertIssueToTask(activeIssue.id, assigneeInput)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckSquare size={14} /> Push to Sprints & Tasks
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-500 font-bold mb-1 text-[11px]">Assigned Engineer</label>
                      <select
                        value={assigneeInput}
                        onChange={(e) => setAssigneeInput(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(tm => (
                          <option key={tm.id} value={tm.fullName}>{tm.fullName} ({tm.role})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 font-bold mb-1 text-[11px]">Issue Priority</label>
                      <select
                        value={activeIssue.priority}
                        onChange={(e) => {
                          const p = e.target.value as IssuePriority;
                          updateIssue(activeIssue.id, { priority: p });
                          setActiveIssue(prev => prev ? { ...prev, priority: p } : null);
                        }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1 text-[11px]">
                      Client-Facing Resolution Notes (Visible to Client on Portal Link)
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionInput}
                      onChange={(e) => setResolutionInput(e.target.value)}
                      placeholder="e.g. Fixed in latest release v1.4. Root cause was an unhandled promise on reconnect..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-black resize-y"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1 text-[11px]">
                      Internal Engineering Notes (Private to Team)
                    </label>
                    <textarea
                      rows={2}
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      placeholder="Internal architectural notes, PR links, deployment commit SHA..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-black resize-y"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        if (confirm(`Delete issue ticket #${activeIssue.ticketNumber}?`)) {
                          deleteIssue(activeIssue.id);
                          setActiveIssue(null);
                        }
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete
                    </button>

                    <button
                      onClick={handleSaveResolution}
                      className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={14} /> Save Triage Updates
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {activeScreenshot && (
          <div
            onClick={() => setActiveScreenshot(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20">
              <img src={activeScreenshot} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={() => setActiveScreenshot(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
