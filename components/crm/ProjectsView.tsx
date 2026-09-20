import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, Plus, Search, Calendar, Users, IndianRupee, CheckCircle2,
  Clock, ArrowRight, X, Sparkles, Filter, ChevronRight, Edit3, Trash2,
  Download, Layers, FileText, ArrowUpRight, CheckSquare, AlertCircle,
  TrendingUp, Eye, UserCheck, ShieldCheck, PlayCircle, CheckCircle,
  Share2, Copy, MessageSquare, ExternalLink, RotateCcw, Link as LinkIcon, Check
} from 'lucide-react';
import { Project, ProjectStatus, Priority, ProjectMilestone } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface ProjectsViewProps {
  onNavigate: (route: string, entityId?: string) => void;
  store: ReturnType<typeof useCrmStore>;
  initialSelectedId?: string;
}

const WORKFLOW_STAGES: ProjectStatus[] = [
  'NOT STARTED',
  'PLANNING',
  'IN PROGRESS',
  'TESTING',
  'CLIENT REVIEW',
  'REVISION',
  'COMPLETED',
  'MAINTENANCE'
];

const KANBAN_STAGES: ProjectStatus[] = [
  'NOT STARTED',
  'PLANNING',
  'IN PROGRESS',
  'TESTING',
  'CLIENT REVIEW',
  'REVISION',
  'COMPLETED',
  'MAINTENANCE'
];

export const ProjectsView: React.FC<ProjectsViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    projects, addProject, updateProject, updateProjectStatus, deleteProject,
    addMilestone, updateMilestone, deleteMilestone, createInvoiceFromMilestone,
    addTask, clients, tasks, documents, expenses, currentUser, teamMembers,
    issues, addIssue, updateIssue, updateIssueStatus, deleteIssue, convertIssueToTask,
    isProjectOnboarded, getProjectPortalUrl, regenerateProjectPortalToken, toggleProjectPortal
  } = store;

  const [viewMode, setViewMode] = useState<'grid' | 'kanban' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedManager, setSelectedManager] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'progress' | 'dueDate' | 'value' | 'recent'>('dueDate');

  // Drag & drop state for Kanban
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

  // Active Project Detail Drawer / Modal
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'overview' | 'milestones' | 'tasks' | 'issues' | 'team'>('overview');
  const [portalShareProject, setPortalShareProject] = useState<Project | null>(null);
  const [copiedPortalUrl, setCopiedPortalUrl] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState<string | null>(null);

  // Dynamic progress calculation helper
  const getProjectDynamicProgress = (project: Project): number => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    const projectMilestones = project.milestones || [];
    const total = projectTasks.length + projectMilestones.length;
    if (total === 0) return project.progress || 0;
    const completed = 
      projectTasks.filter(t => t.status === 'COMPLETED').length + 
      projectMilestones.filter(m => m.status === 'Completed').length;
    return Math.round((completed / total) * 100);
  };

  const formatFriendlyDueDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return <span className="text-gray-400 font-normal">Open</span>;
    try {
      const due = new Date(dateStr);
      if (isNaN(due.getTime())) return <span>{dateStr}</span>;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const dueMidnight = new Date(due);
      dueMidnight.setHours(0, 0, 0, 0);
      
      const diffDays = Math.ceil((dueMidnight.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatted = `${monthNames[due.getMonth()]} ${due.getDate()}, ${due.getFullYear()}`;

      if (diffDays < 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <AlertCircle size={10} /> {formatted} (Overdue)
          </span>
        );
      } else if (diffDays <= 7) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <Clock size={10} /> {formatted} ({diffDays === 0 ? 'Due Today' : `${diffDays}d left`})
          </span>
        );
      }
      return <span className="text-gray-600 font-medium text-[11px] whitespace-nowrap">{formatted}</span>;
    } catch {
      return <span>{dateStr}</span>;
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedProjectId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: ProjectStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (!id) return;
    const match = projects.find(p => p.id === id);
    if (match && match.status !== targetStage) {
      updateProjectStatus(id, targetStage);
      toast.success('Stage Updated', `${match.name} moved to ${targetStage}`);
    }
    setDraggedProjectId(null);
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Quick Task Creation inside project drawer
  const [newQuickTaskTitle, setNewQuickTaskTitle] = useState('');

  // Add Milestone Sub-form state
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 5000,
    status: 'Pending' as const,
    progress: 0
  });

  // Auto-open project drawer if navigated with entity ID or quick create
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddModalOpen(true);
      onNavigate('projects', undefined);
    } else if (initialSelectedId) {
      const match = projects.find(p => p.id === initialSelectedId);
      if (match) setActiveProject(match);
      onNavigate('projects', undefined);
    }
  }, [initialSelectedId]);

  // Form State for new project
  const [newProject, setNewProject] = useState({
    name: '',
    clientId: clients[0]?.id || '',
    clientName: clients[0]?.company || '',
    serviceType: 'Custom AI Agent',
    projectManager: currentUser?.fullName || 'Abhinav',
    assignedTeam: [currentUser?.fullName || 'Abhinav'],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    projectValue: 25000,
    receivedAmount: 12500,
    pendingAmount: 12500,
    status: 'PLANNING' as ProjectStatus,
    priority: 'High' as Priority,
    progress: 10,
    description: ''
  });

  // Dynamic filter lists
  const dynamicServices = useMemo(() => {
    const set = new Set<string>();
    projects.forEach(p => { if (p.serviceType) set.add(p.serviceType); });
    return Array.from(set);
  }, [projects]);

  const dynamicClients = useMemo(() => {
    const set = new Set<string>();
    clients.forEach(c => set.add(c.company));
    projects.forEach(p => { if (p.clientName) set.add(p.clientName); });
    return Array.from(set);
  }, [clients, projects]);

  const dynamicManagers = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => set.add(m.fullName));
    projects.forEach(p => { if (p.projectManager) set.add(p.projectManager); });
    return Array.from(set);
  }, [teamMembers, projects]);

  // Operational KPI Metrics
  const projectMetrics = useMemo(() => {
    const activeList = projects.filter(p => p.status !== 'COMPLETED');
    const totalPipelineValue = projects.reduce((sum, p) => sum + (p.projectValue || 0), 0);
    const totalReceivedValue = projects.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);

    let totalMilestonesCount = 0;
    let completedMilestonesCount = 0;
    projects.forEach(p => {
      if (p.milestones) {
        totalMilestonesCount += p.milestones.length;
        completedMilestonesCount += p.milestones.filter(m => m.status === 'Completed').length;
      }
    });

    const milestoneRate = totalMilestonesCount > 0
      ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100)
      : 0;

    const upcomingDeliveries = projects.filter(p => {
      if (!p.dueDate || p.status === 'COMPLETED') return false;
      const due = new Date(p.dueDate).getTime();
      const now = Date.now();
      const daysDiff = (due - now) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 14;
    }).length;

    return {
      activeProjectsCount: activeList.length,
      totalPipelineValue,
      totalReceivedValue,
      totalMilestonesCount,
      completedMilestonesCount,
      milestoneRate,
      upcomingDeliveries
    };
  }, [projects]);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    let result = projects.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.serviceType.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
      const matchesService = selectedService === 'All' || p.serviceType === selectedService;
      const matchesClient = selectedClient === 'All' || p.clientName === selectedClient;
      const matchesManager = selectedManager === 'All' || p.projectManager === selectedManager;
      const matchesPriority = selectedPriority === 'All' || p.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesService && matchesClient && matchesManager && matchesPriority;
    });

    return result.sort((a, b) => {
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'value') return (b.projectValue || 0) - (a.projectValue || 0);
      if (sortBy === 'recent') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
    });
  }, [projects, searchQuery, selectedStatus, selectedService, selectedClient, selectedManager, selectedPriority, sortBy]);

  // Action Handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) {
      toast.error('Validation Error', 'Please enter a valid project name.');
      return;
    }
    const matchedClient = clients.find(c => c.id === newProject.clientId);
    addProject({
      ...newProject,
      clientName: matchedClient ? matchedClient.company : newProject.clientName
    });
    setIsAddModalOpen(false);
    setNewProject({
      name: '',
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.company || '',
      serviceType: 'Custom AI Agent',
      projectManager: currentUser?.fullName || 'Abhinav',
      assignedTeam: [currentUser?.fullName || 'Abhinav'],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      projectValue: 25000,
      receivedAmount: 12500,
      pendingAmount: 12500,
      status: 'PLANNING',
      priority: 'High',
      progress: 10,
      description: ''
    });
  };

  const handleSaveEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    updateProject(editingProject.id, editingProject);
    if (activeProject?.id === editingProject.id) {
      setActiveProject(editingProject);
    }
    setEditingProject(null);
  };

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    deleteProject(projectToDelete.id);
    if (activeProject?.id === projectToDelete.id) {
      setActiveProject(null);
    }
    setProjectToDelete(null);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActiveProject || !newMilestone.title.trim()) return;
    addMilestone(currentActiveProject.id, {
      projectId: currentActiveProject.id,
      title: newMilestone.title,
      dueDate: newMilestone.dueDate,
      amount: newMilestone.amount,
      status: newMilestone.status,
      progress: newMilestone.progress
    });
    setNewMilestone({
      title: '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 5000,
      status: 'Pending',
      progress: 0
    });
  };

  const handleAddQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActiveProject || !newQuickTaskTitle.trim()) return;
    addTask({
      title: newQuickTaskTitle,
      description: `Task created from Project Hub: ${currentActiveProject.name}`,
      status: 'TO DO',
      priority: 'High',
      assignedTo: currentActiveProject.projectManager || currentUser?.fullName || 'Abhinav',
      projectId: currentActiveProject.id,
      projectName: currentActiveProject.name,
      clientId: currentActiveProject.clientId,
      clientName: currentActiveProject.clientName,
      dueDate: currentActiveProject.dueDate || new Date().toISOString().split('T')[0],
      estimatedHours: 4,
      actualHours: 0
    });
    setNewQuickTaskTitle('');
    toast.success('Task Added', `New deliverable created for ${currentActiveProject.name}`);
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_projects_operations', filteredProjects.map(p => ({
      ID: p.id,
      ProjectName: p.name,
      Client: p.clientName,
      Service: p.serviceType,
      ProjectManager: p.projectManager,
      ProjectValueINR: p.projectValue,
      ReceivedINR: p.receivedAmount,
      PendingINR: p.pendingAmount,
      Status: p.status,
      Priority: p.priority,
      Progress: `${p.progress}%`,
      MilestonesTotal: p.milestones?.length || 0,
      MilestonesCompleted: p.milestones?.filter(m => m.status === 'Completed').length || 0,
      StartDate: p.startDate,
      DueDate: p.dueDate
    })));
  };

  // Active Project in Drawer with reactivity
  const currentActiveProject = activeProject
    ? (projects.find(p => p.id === activeProject.id) || activeProject)
    : null;

  const projectTasks = currentActiveProject
    ? tasks.filter(t => t.projectId === currentActiveProject.id || t.projectName === currentActiveProject.name)
    : [];

  const projectDocs = currentActiveProject
    ? documents.filter(d => d.projectId === currentActiveProject.id || d.clientName === currentActiveProject.clientName)
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Project Operations & Delivery Hub
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black text-[#CCFF00] tracking-wide">
              {projects.length} PROJECTS
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Track milestones, operational status, progress calculations, and team resource allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer btn-press"
          >
            <Download size={14} /> Export CSV
          </button>

          {store.resetToSampleData && (
            <button
              onClick={() => store.resetToSampleData()}
              title="Reset sample projects and issues to test onboarding and magic links"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer btn-press"
            >
              <RotateCcw size={14} /> Reset Mock Data
            </button>
          )}

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-press ${
                viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-press ${
                viewMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-press ${
                viewMode === 'table' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer btn-press"
          >
            <Plus size={15} /> New Project
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Header (Clickable Filters with Double-Bezel Architecture) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'IN PROGRESS' ? 'All' : 'IN PROGRESS')}
          className={`double-bezel-outer card-tactile cursor-pointer btn-press ${
            selectedStatus === 'IN PROGRESS' ? 'ring-2 ring-indigo-500' : ''
          }`}
          title="Click to filter by In Production"
        >
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Sprints</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {projectMetrics.activeProjectsCount} In Production
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <TrendingUp size={13} /> {projects.length} Total Projects
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Briefcase size={18} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSortBy('value')}
          className={`double-bezel-outer card-tactile cursor-pointer btn-press ${
            sortBy === 'value' ? 'ring-2 ring-purple-500' : ''
          }`}
          title="Click to sort by total project value"
        >
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Production Pipeline</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                ₹{projectMetrics.totalPipelineValue.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <IndianRupee size={13} /> ₹{projectMetrics.totalReceivedValue.toLocaleString('en-IN')} Received
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee size={18} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === 'COMPLETED' ? 'All' : 'COMPLETED')}
          className={`double-bezel-outer card-tactile cursor-pointer btn-press ${
            selectedStatus === 'COMPLETED' ? 'ring-2 ring-emerald-500' : ''
          }`}
          title="Click to filter by Completed"
        >
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Milestone Completion</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                {projectMetrics.milestoneRate}% Reached
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> {projectMetrics.completedMilestonesCount} / {projectMetrics.totalMilestonesCount} Done
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 size={18} />
            </div>
          </div>
        </div>

        <div
          onClick={() => setSortBy('dueDate')}
          className={`double-bezel-outer card-tactile cursor-pointer btn-press ${
            sortBy === 'dueDate' ? 'ring-2 ring-amber-500' : ''
          }`}
          title="Click to sort by nearest deadline"
        >
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">14-Day Delivery Focus</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block tabular-nums">
                {projectMetrics.upcomingDeliveries} Deadlines
              </span>
              <span className="text-xs text-amber-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> Approaching Due Date
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              <Clock size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Search & Dynamic Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        {/* 1-Click Segmented Stage Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-gray-100">
          {[
            { id: 'All', label: 'All Projects', count: projects.length },
            { id: 'IN PROGRESS', label: 'In Production', count: projects.filter(p => p.status === 'IN PROGRESS').length },
            { id: 'TESTING', label: 'Testing', count: projects.filter(p => p.status === 'TESTING').length },
            { id: 'CLIENT REVIEW', label: 'Review', count: projects.filter(p => p.status === 'CLIENT REVIEW').length },
            { id: 'COMPLETED', label: 'Completed', count: projects.filter(p => p.status === 'COMPLETED').length }
          ].map(stage => {
            const isSelected = selectedStatus === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStatus(stage.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-press cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-[#CCFF00] shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200/70 text-gray-600'
                }`}
              >
                <span>{stage.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-[#CCFF00] text-black' : 'bg-white text-gray-500'
                }`}>
                  {stage.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, client, service..."
              className="w-full bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 outline-none focus:border-black transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Service Type Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[170px] truncate"
            >
              <option value="All">All Services ({dynamicServices.length})</option>
              {dynamicServices.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Client Filter */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[170px] truncate"
            >
              <option value="All">All Clients ({dynamicClients.length})</option>
              {dynamicClients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Manager Filter */}
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All PMs</option>
              {dynamicManagers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="dueDate">Sort: Nearest Due Date</option>
              <option value="progress">Sort: Progress %</option>
              <option value="value">Sort: Project Value</option>
              <option value="recent">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || selectedStatus !== 'All' || selectedService !== 'All' || selectedClient !== 'All' || selectedManager !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
            <span className="font-semibold">Active Filters ({filteredProjects.length} projects):</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-medium flex items-center gap-1">
                "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium flex items-center gap-1">
                Stage: {selectedStatus} <X size={11} className="cursor-pointer" onClick={() => setSelectedStatus('All')} />
              </span>
            )}
            {selectedService !== 'All' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Service: {selectedService} <X size={11} className="cursor-pointer" onClick={() => setSelectedService('All')} />
              </span>
            )}
            {selectedClient !== 'All' && (
              <span className="px-2 py-0.5 bg-lime-100 text-lime-800 rounded-md font-medium flex items-center gap-1">
                Client: {selectedClient} <X size={11} className="cursor-pointer" onClick={() => setSelectedClient('All')} />
              </span>
            )}
            {selectedManager !== 'All' && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-medium flex items-center gap-1">
                PM: {selectedManager} <X size={11} className="cursor-pointer" onClick={() => setSelectedManager('All')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All');
                setSelectedService('All');
                setSelectedClient('All');
                setSelectedManager('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Grid Cards View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
              <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No projects match the specified filter criteria.</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const radius = 22;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference - ((project.progress || 0) / 100) * circumference;

              return (
                <div
                  key={project.id}
                  onClick={() => setActiveProject(project)}
                  className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer group flex flex-col justify-between relative card-tactile ${
                    activeProject?.id === project.id
                      ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-500/20'
                      : 'border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                        project.status === 'TESTING' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                        project.status === 'IN PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                        project.status === 'CLIENT REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                        'bg-gray-100 text-gray-700 border-gray-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          project.status === 'COMPLETED' ? 'bg-emerald-500' :
                          project.status === 'TESTING' ? 'bg-amber-500' :
                          project.status === 'IN PROGRESS' ? 'bg-indigo-500 animate-pulse' :
                          project.status === 'CLIENT REVIEW' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`} />
                        {project.status}
                      </span>

                      <div className="flex items-center gap-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          project.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                          project.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {project.priority}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                          className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer btn-press"
                          title="Edit Project"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setProjectToDelete(project); }}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer btn-press"
                          title="Delete Project"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-base text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mb-2">
                      Client: <strong className="text-gray-700">{project.clientName}</strong> • {project.serviceType}
                    </p>

                    {/* Onboarding Status Capsule & Portal Link */}
                    {(() => {
                      const ob = isProjectOnboarded(project.id);
                      const projIssues = issues.filter(i => i.projectId === project.id);
                      const openCount = projIssues.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;

                      return (
                        <div className="flex items-center justify-between gap-1.5 my-2.5 flex-wrap">
                          {ob.onboarded ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                              <Sparkles size={10} className="text-emerald-500" /> Onboarded (Portal Ready)
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 flex items-center gap-1" title="Agreement or Initial Payment Pending">
                              <Clock size={10} /> Pending Onboarding
                            </span>
                          )}

                          <div className="flex items-center gap-1.5">
                            {openCount > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {openCount} Issues
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPortalShareProject(project);
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer btn-press"
                              title="Share Client Issue Portal Link"
                            >
                              <Share2 size={11} /> Issue Link
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-1.5 py-3 border-y border-gray-100 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Target Delivery:</span>
                        {formatFriendlyDueDate(project.dueDate)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Project Manager:</span>
                        <span className="font-semibold text-gray-800">{project.projectManager}</span>
                      </div>
                      <div className="flex items-center justify-between tabular-nums">
                        <span className="text-gray-400">Commercials:</span>
                        <span className="font-bold text-gray-900">
                          ₹{project.receivedAmount?.toLocaleString('en-IN') || 0} / ₹{project.projectValue?.toLocaleString('en-IN') || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress & Milestone snapshot */}
                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r={radius} stroke="#E2E8F0" strokeWidth="3.5" fill="transparent" />
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            stroke={project.progress >= 100 ? '#10B981' : project.progress >= 50 ? '#4F46E5' : '#F59E0B'}
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <span className="absolute text-[11px] font-bold text-gray-900 tabular-nums">{project.progress}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Milestones</span>
                        <span className="text-xs font-semibold text-gray-700 tabular-nums">
                          {project.milestones?.filter(m => m.status === 'Completed').length || 0} / {project.milestones?.length || 0} Done
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Hub <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Row 4: Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map(stage => {
            const stageProjects = filteredProjects.filter(p => p.status === stage);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
                className="bg-gray-50/80 rounded-2xl p-3.5 border border-gray-200/70 flex flex-col min-w-[240px] transition-colors hover:border-black/30"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="font-extrabold text-xs text-gray-800 tracking-wide">{stage}</span>
                  <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                    {stageProjects.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 min-h-[100px]">
                  {stageProjects.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                      Drop projects here
                    </div>
                  ) : (
                    stageProjects.map(project => {
                      const dynamicProg = getProjectDynamicProgress(project);

                      return (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, project.id)}
                          onClick={() => setActiveProject(project)}
                          className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                        >
                          <div className="flex items-center justify-between mb-1.5 gap-1">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              project.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                              project.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {project.priority}
                            </span>
                            {formatFriendlyDueDate(project.dueDate)}
                          </div>

                          <h4 className="font-extrabold text-xs text-gray-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                            {project.name}
                          </h4>
                          <div className="text-[10px] text-gray-500 mb-2 truncate">{project.clientName}</div>

                          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                dynamicProg >= 100 ? 'bg-emerald-500' :
                                dynamicProg >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${dynamicProg}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-50 tabular-nums">
                            <span>{dynamicProg}% Done</span>
                            <span className="font-bold text-gray-800">₹{project.projectValue?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 5: Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Project & Client</th>
                  <th className="py-3.5 px-3">Service</th>
                  <th className="py-3.5 px-3">Stage</th>
                  <th className="py-3.5 px-3">Commercials</th>
                  <th className="py-3.5 px-3">Progress</th>
                  <th className="py-3.5 px-3">Manager</th>
                  <th className="py-3.5 px-3">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      No projects found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => setActiveProject(project)}
                      className={`transition-colors cursor-pointer group border-l-4 ${
                        activeProject?.id === project.id
                          ? 'bg-indigo-50/70 border-indigo-600'
                          : 'hover:bg-gray-50/80 border-transparent'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-gray-900 text-xs group-hover:text-indigo-600 transition-colors">{project.name}</div>
                        <div className="text-[11px] text-gray-400">{project.clientName}</div>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-gray-800">
                        {project.serviceType}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          project.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' :
                          project.status === 'TESTING' ? 'bg-amber-50 text-amber-700 border-amber-200/60' :
                          project.status === 'IN PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60' :
                          project.status === 'CLIENT REVIEW' ? 'bg-purple-50 text-purple-700 border-purple-200/60' :
                          'bg-gray-100 text-gray-700 border-gray-200/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            project.status === 'COMPLETED' ? 'bg-emerald-500' :
                            project.status === 'TESTING' ? 'bg-amber-500' :
                            project.status === 'IN PROGRESS' ? 'bg-indigo-500 animate-pulse' :
                            project.status === 'CLIENT REVIEW' ? 'bg-purple-500' :
                            'bg-gray-400'
                          }`} />
                          {project.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 tabular-nums">
                        <div className="font-bold text-gray-900">₹{project.projectValue?.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] font-semibold text-emerald-600">Paid: ₹{project.receivedAmount?.toLocaleString('en-IN')}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2 tabular-nums">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                project.progress >= 100 ? 'bg-emerald-600' :
                                project.progress >= 50 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="font-bold text-[10px] text-gray-700">{project.progress}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-medium text-gray-800">
                        {project.projectManager}
                      </td>

                      <td className="py-3.5 px-3">
                        {formatFriendlyDueDate(project.dueDate)}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPortalShareProject(project)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors btn-press"
                            title="Share Client Issue Portal Link"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            onClick={() => setEditingProject(project)}
                            className="p-1 text-gray-400 hover:text-black rounded cursor-pointer btn-press"
                            title="Edit Project"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(project)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer btn-press"
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row 6: 360° Project Operations Drawer */}
      <AnimatePresence>
        {currentActiveProject && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-3xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-extrabold text-gray-900">{currentActiveProject.name}</h2>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        currentActiveProject.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        currentActiveProject.status === 'IN PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {currentActiveProject.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Client: <strong>{currentActiveProject.clientName}</strong> • {currentActiveProject.serviceType} • PM: {currentActiveProject.projectManager}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProject(currentActiveProject)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setActiveProject(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Linkage Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-4">
                  <button
                    onClick={() => {
                      const cId = currentActiveProject.clientId;
                      setActiveProject(null);
                      onNavigate('clients', cId);
                    }}
                    className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Users size={13} /> Client 360°
                  </button>
                  <button
                    onClick={() => {
                      const pId = currentActiveProject.id;
                      setActiveProject(null);
                      onNavigate('tasks', pId);
                    }}
                    className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CheckSquare size={13} /> Sprints Hub
                  </button>
                  <button
                    onClick={() => {
                      setActiveProject(null);
                      onNavigate('finance', 'new');
                    }}
                    className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <IndianRupee size={13} /> Issue Invoice
                  </button>
                  <button
                    onClick={() => onNavigate('calendar', 'new')}
                    className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Calendar size={13} /> Review Call
                  </button>
                  <button
                    onClick={() => setPortalShareProject(currentActiveProject)}
                    className="py-2 px-2 bg-[#CCFF00]/25 hover:bg-[#CCFF00]/50 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-[#CCFF00]/60 col-span-2 sm:col-span-1 shadow-2xs"
                  >
                    <Share2 size={13} /> Portal Link
                  </button>
                </div>

                {/* Stage Stepper Selector */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Advance Stage Workflow</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {WORKFLOW_STAGES.map((st) => (
                      <button
                        key={st}
                        onClick={() => updateProjectStatus(currentActiveProject.id, st)}
                        className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap text-[11px] transition-all cursor-pointer ${
                          currentActiveProject.status === st
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drawer Tab Navigation */}
                <div className="flex items-center gap-1 overflow-x-auto py-2 border-b border-gray-100 text-xs">
                  {[
                    { key: 'overview', label: 'Overview & Commercials' },
                    { key: 'milestones', label: `Milestones (${currentActiveProject.milestones?.length || 0})` },
                    { key: 'tasks', label: `Sprint Tasks (${projectTasks.length})` },
                    { key: 'issues', label: `Issues & Feedback (${issues.filter(i => i.projectId === currentActiveProject.id).length})` },
                    { key: 'team', label: 'Team & Resources' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveDrawerTab(tab.key as any)}
                      className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeDrawerTab === tab.key ? 'bg-black text-white shadow-xs' : 'text-gray-500 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Drawer Tab Contents */}
                <div className="py-4 text-xs">
                  {/* Tab 1: Overview */}
                  {activeDrawerTab === 'overview' && (
                    <div className="space-y-5">
                      {/* Financials Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <span className="text-gray-400 block font-normal mb-1 text-[11px]">Total Project Value</span>
                          <strong className="text-base font-extrabold text-gray-900">₹{currentActiveProject.projectValue?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-900 border border-emerald-100">
                          <span className="text-emerald-600 block font-normal mb-1 text-[11px]">Paid to Date</span>
                          <strong className="text-base font-extrabold">₹{currentActiveProject.receivedAmount?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-2xl text-amber-900 border border-amber-100">
                          <span className="text-amber-600 block font-normal mb-1 text-[11px]">Pending Balance</span>
                          <strong className="text-base font-extrabold">₹{currentActiveProject.pendingAmount?.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {/* Progress Slider */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900 block text-xs">Delivery Velocity</span>
                          <span className="text-gray-400 text-[11px]">Target Delivery: {currentActiveProject.dueDate || 'Ongoing'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={currentActiveProject.progress}
                            onChange={(e) => {
                              const newProg = Number(e.target.value);
                              updateProjectStatus(currentActiveProject.id, currentActiveProject.status, newProg);
                            }}
                            className="w-28 accent-[#CCFF00]"
                          />
                          <span className="font-extrabold text-gray-900 text-sm">{currentActiveProject.progress}%</span>
                        </div>
                      </div>

                      {/* Financial Health & Realized Profitability */}
                      {(() => {
                        const directExpenses = expenses.filter(e => e.projectId === currentActiveProject.id || (currentActiveProject.name && e.projectName === currentActiveProject.name));
                        const totalDirectCost = directExpenses.reduce((s, e) => s + (e.amount || 0), 0);
                        const projectProfit = (currentActiveProject.receivedAmount || 0) - totalDirectCost;
                        const marginPct = (currentActiveProject.receivedAmount || 0) > 0 ? Math.round((projectProfit / currentActiveProject.receivedAmount) * 100) : 0;
                        const dynamicProg = getProjectDynamicProgress(currentActiveProject);

                        return (
                          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <span className="text-emerald-500">💰</span> Realized Project Profitability & Cost
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                                marginPct >= 40 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : marginPct > 0 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {marginPct}% Net Margin
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-medium block">Received Revenue</span>
                                <span className="font-extrabold text-xs text-gray-900 mt-0.5 block">₹{(currentActiveProject.receivedAmount || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-rose-900">
                                <span className="text-[10px] text-rose-600 font-medium block">Direct Expenses ({directExpenses.length})</span>
                                <span className="font-extrabold text-xs mt-0.5 block">₹{totalDirectCost.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 text-emerald-900">
                                <span className="text-[10px] text-emerald-700 font-medium block">Net Project Profit</span>
                                <span className="font-extrabold text-xs mt-0.5 block">₹{projectProfit.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                              <span>Milestones & Tasks Completion Velocity:</span>
                              <span className="font-bold text-gray-900">{dynamicProg}% Shipped</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Description */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-1">Project Scope & Directives</h4>
                        <p className="text-gray-600 leading-relaxed">
                          {currentActiveProject.description || 'No detailed scope description provided.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Milestones */}
                  {activeDrawerTab === 'milestones' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Milestone Deliverables & Billing</span>
                        <span className="text-xs text-gray-400">
                          {currentActiveProject.milestones?.filter(m => m.status === 'Completed').length || 0} / {currentActiveProject.milestones?.length || 0} Reached
                        </span>
                      </div>

                      <div className="space-y-2">
                        {currentActiveProject.milestones?.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400">
                            No milestone phases created yet.
                          </div>
                        ) : (
                          currentActiveProject.milestones?.map((m) => (
                            <div key={m.id} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-900 text-xs">{m.title}</div>
                                <div className="text-[10px] text-gray-400">Due: {m.dueDate} • Value: ₹{m.amount.toLocaleString('en-IN')}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <select
                                  value={m.status}
                                  onChange={(e) => {
                                    updateMilestone(currentActiveProject.id, m.id, {
                                      status: e.target.value as any,
                                      progress: e.target.value === 'Completed' ? 100 : (e.target.value === 'In Progress' ? 50 : 0)
                                    });
                                  }}
                                  className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-gray-200 outline-none cursor-pointer"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                {m.isBilled ? (
                                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-lg flex items-center gap-1 border border-emerald-200" title={`Invoiced via ${m.invoiceId || 'Finance'}`}>
                                    <CheckCircle2 size={11} /> Invoiced
                                  </span>
                                ) : (
                                  m.status === 'Completed' && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => {
                                          createInvoiceFromMilestone(currentActiveProject.id, m.id, true);
                                          setActiveProject(null);
                                          onNavigate('finance');
                                        }}
                                        className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                        title="Generate GST Tax Invoice (18%)"
                                      >
                                        <FileText size={11} /> Bill (GST)
                                      </button>
                                      <button
                                        onClick={() => {
                                          createInvoiceFromMilestone(currentActiveProject.id, m.id, false);
                                          setActiveProject(null);
                                          onNavigate('finance');
                                        }}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                        title="Generate Non-GST Commercial Invoice"
                                      >
                                        <FileText size={11} /> Non-GST
                                      </button>
                                    </div>
                                  )
                                )}
                                <button
                                  onClick={() => deleteMilestone(currentActiveProject.id, m.id)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer"
                                  title="Delete Milestone"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Milestone Form */}
                      <form onSubmit={handleAddMilestone} className="p-3 bg-gray-50 rounded-2xl border border-gray-200/80 flex items-center gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Milestone title..."
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                        />
                        <input
                          type="number"
                          placeholder="₹ Value"
                          value={newMilestone.amount}
                          onChange={(e) => setNewMilestone({ ...newMilestone, amount: Number(e.target.value) })}
                          className="w-24 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} /> Add
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Tab 3: Linked Tasks */}
                  {activeDrawerTab === 'tasks' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Sprint Tasks ({projectTasks.length})</span>
                        <button
                          onClick={() => {
                            const pId = currentActiveProject.id;
                            setActiveProject(null);
                            onNavigate('tasks', pId);
                          }}
                          className="px-3 py-1.5 bg-black text-white hover:bg-gray-800 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <CheckSquare size={13} className="text-[#CCFF00]" /> Full Sprints Board
                        </button>
                      </div>

                      {/* Quick Add Task */}
                      <form onSubmit={handleAddQuickTask} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add new sprint deliverable / task..."
                          value={newQuickTaskTitle}
                          onChange={(e) => setNewQuickTaskTitle(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Plus size={13} /> Add Task
                        </button>
                      </form>

                      <div className="space-y-2">
                        {projectTasks.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-2xl text-gray-400">
                            No sprint tasks assigned to this project yet.
                          </div>
                        ) : (
                          projectTasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => {
                                const tId = t.id;
                                setActiveProject(null);
                                onNavigate('tasks', tId);
                              }}
                              className="p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-between cursor-pointer group"
                            >
                              <div>
                                <h5 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{t.title}</h5>
                                <span className="text-[10px] text-gray-400">Due: {t.dueDate} • Assignee: {t.assignedTo}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                                  t.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {t.priority}
                                </span>
                                <span className="font-bold text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                  {t.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Team */}
                  {activeDrawerTab === 'team' && (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                        <h4 className="font-bold text-gray-900 text-xs">Project Leadership</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-black text-white font-extrabold flex items-center justify-center text-xs">
                            {currentActiveProject.projectManager?.substring(0, 2).toUpperCase() || 'PM'}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900">{currentActiveProject.projectManager}</div>
                            <span className="text-[10px] text-gray-400">Account Lead & Sprint Coordinator</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 text-xs mb-2">Assigned Engineers & Specialists</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          {currentActiveProject.assignedTeam?.map((tm, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-800 shadow-2xs">
                              {tm}
                            </span>
                          )) || <span className="text-gray-400">No extra team assigned</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Issues & Client Feedback */}
                  {activeDrawerTab === 'issues' && (() => {
                    const projectIssuesList = issues.filter(i => i.projectId === currentActiveProject.id);
                    const ob = isProjectOnboarded(currentActiveProject.id);

                    return (
                      <div className="space-y-4">
                        {/* Onboarding & Portal Share Capsule */}
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {ob.onboarded ? (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <Sparkles size={11} className="text-emerald-600" /> Project Onboarded (Portal Ready)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                                  <Clock size={11} /> Pending Agreement / Deposit
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {projectIssuesList.length} issues logged by client
                              </span>
                            </div>

                            <button
                              onClick={() => setPortalShareProject(currentActiveProject)}
                              className="px-3 py-1.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Share2 size={13} /> Share Client Portal Link
                            </button>
                          </div>
                        </div>

                        {/* Issue Items */}
                        {projectIssuesList.length === 0 ? (
                          <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                            <CheckCircle2 size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-bold text-gray-600">No issues reported yet</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">Send the client portal link to the client owner so they can log issues.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {projectIssuesList.map(issue => (
                              <div
                                key={issue.id}
                                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs space-y-3"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                                      #{issue.ticketNumber}
                                    </span>
                                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                      issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                                      issue.status === 'IN PROGRESS' ? 'bg-purple-100 text-purple-800' :
                                      'bg-amber-100 text-amber-800'
                                    }`}>
                                      {issue.status}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                      {issue.issueType}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                      issue.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                                      issue.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {issue.priority}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 text-xs">
                                    <select
                                      value={issue.status}
                                      onChange={(e) => updateIssueStatus(issue.id, e.target.value as any)}
                                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-[11px] font-semibold cursor-pointer"
                                    >
                                      <option value="REPORTED">Reported</option>
                                      <option value="IN REVIEW">In Review</option>
                                      <option value="IN PROGRESS">In Progress</option>
                                      <option value="RESOLVED">Resolved</option>
                                      <option value="CLOSED">Closed</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-extrabold text-sm text-gray-900">{issue.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{issue.description}</p>
                                </div>

                                {issue.attachments && issue.attachments.length > 0 && (
                                  <div className="flex items-center gap-2 pt-1">
                                    <span className="text-[10px] text-gray-400 font-medium">Screenshots:</span>
                                    {issue.attachments.map((att, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveScreenshot(att)}
                                        className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                      >
                                        <img src={att} alt="attachment" className="w-full h-full object-cover" />
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {issue.resolutionNotes && (
                                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-900">
                                    <strong className="block text-emerald-800 text-[11px]">Resolution Shared With Client:</strong>
                                    <p className="text-[11px] mt-0.5">{issue.resolutionNotes}</p>
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                                  <span className="text-gray-400">
                                    By {issue.reporterName} • {new Date(issue.createdAt).toLocaleDateString()}
                                  </span>

                                  <button
                                    onClick={() => convertIssueToTask(issue.id)}
                                    className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <CheckSquare size={12} /> Convert to Sprint Task
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setProjectToDelete(currentActiveProject)}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Project
                </button>
                <button
                  onClick={() => setActiveProject(null)}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Close Hub
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Initiate New Project</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. AI Customer Service Engine"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Client Account *</label>
                  <select
                    value={newProject.clientId}
                    onChange={(e) => {
                      const c = clients.find(cl => cl.id === e.target.value);
                      setNewProject({ ...newProject, clientId: e.target.value, clientName: c ? c.company : '' });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Service Type</label>
                  <select
                    value={newProject.serviceType}
                    onChange={(e) => setNewProject({ ...newProject, serviceType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Custom AI Agent">Custom AI Agent</option>
                    <option value="Workflow Automation">Workflow Automation</option>
                    <option value="Full-stack Platform">Full-stack Platform</option>
                    <option value="Internal Tools">Internal Tools</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Value (₹)</label>
                  <input
                    type="number"
                    value={newProject.projectValue}
                    onChange={(e) => setNewProject({ ...newProject, projectValue: Number(e.target.value), pendingAmount: Number(e.target.value) - newProject.receivedAmount })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newProject.dueDate}
                    onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Manager</label>
                  <select
                    value={newProject.projectManager}
                    onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicManagers.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description & Objectives</label>
                <textarea
                  rows={3}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Key milestones, tech stack, and deliverable directives..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold shadow-md cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Project Details</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    value={editingProject.serviceType}
                    onChange={(e) => setEditingProject({ ...editingProject, serviceType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Manager</label>
                  <select
                    value={editingProject.projectManager}
                    onChange={(e) => setEditingProject({ ...editingProject, projectManager: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicManagers.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Project Value (₹)</label>
                  <input
                    type="number"
                    value={editingProject.projectValue}
                    onChange={(e) => setEditingProject({ ...editingProject, projectValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={editingProject.dueDate}
                    onChange={(e) => setEditingProject({ ...editingProject, dueDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-bold hover:bg-gray-800 shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Project Confirmation */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Project?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete <strong>{projectToDelete.name}</strong> and all linked sprint milestones?
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Share Client Issue Portal Modal */}
      <AnimatePresence>
        {portalShareProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5"
            >
              <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#CCFF00]/30 text-black border border-[#CCFF00]">
                      Client Issue Portal
                    </span>
                    {isProjectOnboarded(portalShareProject.id).onboarded ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ✨ Onboarded
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Deposit/Agreement Pending
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-lg text-gray-900">{portalShareProject.name}</h3>
                  <p className="text-xs text-gray-500">Client: <strong>{portalShareProject.clientName}</strong></p>
                </div>

                <button
                  onClick={() => { setPortalShareProject(null); setCopiedPortalUrl(false); }}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Onboarding Overview */}
              {(() => {
                const ob = isProjectOnboarded(portalShareProject.id);
                return (
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Onboarding Readiness</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Agreement:</span>
                        <strong className={ob.hasAgreement ? 'text-emerald-700' : 'text-amber-700'}>
                          {ob.hasAgreement ? 'Signed ✅' : `${ob.agreementStatus || 'Pending'} ⚠️`}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Deposit Paid:</span>
                        <strong className={ob.hasPayment ? 'text-emerald-700' : 'text-amber-700'}>
                          ₹{(portalShareProject.receivedAmount || 0).toLocaleString('en-IN')} {ob.hasPayment ? '✅' : '⚠️'}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Portal URL Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">Client Magic Link (No Login Needed)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getProjectPortalUrl(portalShareProject)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 font-mono focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const url = getProjectPortalUrl(portalShareProject);
                      navigator.clipboard.writeText(url);
                      setCopiedPortalUrl(true);
                      toast.success('Link Copied 📋', 'Client Issue Upload portal link copied to clipboard.');
                      setTimeout(() => setCopiedPortalUrl(false), 2500);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedPortalUrl
                        ? 'bg-emerald-600 text-white'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {copiedPortalUrl ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPortalUrl ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Instant Sharing Actions */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">One-Click Sharing</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hi ${portalShareProject.clientName}, here is your direct Project Issue & Feedback Portal link for "${portalShareProject.name}":\n\n${getProjectPortalUrl(portalShareProject)}\n\nYou can upload bugs, revision requests, and screenshots anytime without needing to log in. Our team is alerted immediately.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                  >
                    <MessageSquare size={14} /> Share via WhatsApp
                  </a>

                  <button
                    onClick={() => {
                      const url = getProjectPortalUrl(portalShareProject);
                      window.open(url, '_blank');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
                  >
                    <ExternalLink size={14} /> Preview Portal
                  </button>
                </div>
              </div>

              {/* Security & Link Rotation */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <button
                  onClick={() => {
                    if (confirm('Regenerate secret portal token? The previous link will stop working.')) {
                      regenerateProjectPortalToken(portalShareProject.id);
                    }
                  }}
                  className="text-gray-500 hover:text-black font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} /> Rotate Link
                </button>

                <div className="flex items-center gap-2">
                  <span>Portal Active:</span>
                  <input
                    type="checkbox"
                    checked={portalShareProject.portalEnabled !== false}
                    onChange={(e) => toggleProjectPortal(portalShareProject.id, e.target.checked)}
                    className="accent-[#CCFF00] cursor-pointer"
                  />
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
