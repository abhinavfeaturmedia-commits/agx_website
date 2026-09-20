import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare, Plus, Search, Filter, Clock, User, AlertCircle,
  Calendar, CheckCircle2, MoreVertical, X, Sparkles, AlertOctagon,
  Edit3, Trash2, Download, Layers, TrendingUp, CheckCircle,
  ArrowRight, Briefcase, Users, PlayCircle, ShieldAlert, ArrowUpRight, UserCheck
} from 'lucide-react';
import { Task, TaskStatus, Priority } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface TasksViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
  initialSelectedId?: string;
}

const TASK_STATUSES: { status: TaskStatus; label: string; badge: string; color: string }[] = [
  { status: 'TO DO', label: 'To Do', badge: 'bg-gray-100 text-gray-700 border-gray-200', color: 'border-gray-300' },
  { status: 'IN PROGRESS', label: 'In Progress', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', color: 'border-indigo-400' },
  { status: 'IN REVIEW', label: 'In Review', badge: 'bg-purple-100 text-purple-700 border-purple-200', color: 'border-purple-400' },
  { status: 'COMPLETED', label: 'Completed', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', color: 'border-emerald-400' },
  { status: 'BLOCKED', label: 'Blocked', badge: 'bg-rose-100 text-rose-700 border-rose-200', color: 'border-rose-400' }
];

const formatFriendlyDueDate = (dateStr?: string) => {
  if (!dateStr) return { text: 'Open', badgeClass: 'bg-gray-100 text-gray-500' };
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return { text: dateStr, badgeClass: 'bg-gray-100 text-gray-600' };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `${Math.abs(diffDays)}d overdue`,
      badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold'
    };
  }
  if (diffDays === 0) {
    return {
      text: 'Due Today',
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-300 font-bold animate-pulse'
    };
  }
  if (diffDays === 1) {
    return {
      text: 'Due Tomorrow',
      badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold'
    };
  }
  if (diffDays <= 7) {
    return {
      text: `In ${diffDays} days`,
      badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold'
    };
  }
  return {
    text: target.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    badgeClass: 'bg-gray-50 text-gray-700 border border-gray-200 font-medium'
  };
};

export const TasksView: React.FC<TasksViewProps> = ({ store, onNavigate, initialSelectedId }) => {
  const {
    tasks, addTask, updateTask, updateTaskStatus, deleteTask,
    projects, clients, leads, currentUser, teamMembers, taskCompletionRate
  } = store;

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [filterAssignee, setFilterAssignee] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'hours' | 'recent'>('dueDate');

  // Task 360 Detail Drawer & Modals State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Quick column task creation
  const [quickAddColumn, setQuickAddColumn] = useState<TaskStatus | null>(null);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Auto-open task modal or filter by project if navigated with entity ID
  useEffect(() => {
    if (initialSelectedId === 'new') {
      setIsAddModalOpen(true);
      onNavigate('tasks', undefined);
    } else if (initialSelectedId) {
      const matchTask = tasks.find(t => t.id === initialSelectedId);
      if (matchTask) {
        setSelectedTask(matchTask);
      } else {
        const matchProject = projects.find(p => p.id === initialSelectedId);
        if (matchProject) {
          setFilterProject(matchProject.id);
        }
      }
      onNavigate('tasks', undefined);
    }
  }, [initialSelectedId]);

  // Form state for creating a new task
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: projects[0]?.id || '',
    projectName: projects[0]?.name || '',
    leadId: '',
    assignedTo: currentUser?.fullName || 'Abhinav',
    priority: 'High' as Priority,
    status: 'TO DO' as TaskStatus,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 8,
    actualHours: 0
  });

  // Productivity KPI Metrics
  const taskMetrics = useMemo(() => {
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgressCount = tasks.filter(t => t.status === 'IN PROGRESS' || t.status === 'IN REVIEW').length;
    const blockedCount = tasks.filter(t => t.status === 'BLOCKED').length;
    const urgentCount = tasks.filter(t => t.priority === 'Urgent' && t.status !== 'COMPLETED').length;

    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);

    const completionVelocity = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      inProgressCount,
      blockedCount,
      urgentCount,
      totalEstHours,
      totalActHours,
      completionVelocity
    };
  }, [tasks]);

  // Dynamic filter options
  const dynamicProjects = useMemo(() => {
    return projects.map(p => ({ id: p.id, name: p.name }));
  }, [projects]);

  const dynamicAssignees = useMemo(() => {
    const set = new Set<string>();
    teamMembers.forEach(m => set.add(m.fullName));
    tasks.forEach(t => { if (t.assignedTo) set.add(t.assignedTo); });
    return Array.from(set);
  }, [teamMembers, tasks]);

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.title.toLowerCase().includes(q) ||
        (t.projectName && t.projectName.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.assignedTo && t.assignedTo.toLowerCase().includes(q));

      const matchesProject = filterProject === 'All' || t.projectId === filterProject;
      const currentFirstName = (currentUser?.fullName || 'User').split(' ')[0];
      const matchesAssignee = filterAssignee === 'All' ||
        (filterAssignee === 'My Tasks' ? (t.assignedTo || '').includes(currentFirstName) : t.assignedTo === filterAssignee);
      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
      const matchesStatus = filterStatus === 'All' || t.status === filterStatus;

      return matchesSearch && matchesProject && matchesAssignee && matchesPriority && matchesStatus;
    });

    const priorityWeight: Record<Priority, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

    return result.sort((a, b) => {
      if (sortBy === 'priority') return priorityWeight[b.priority] - priorityWeight[a.priority];
      if (sortBy === 'hours') return (b.estimatedHours || 0) - (a.estimatedHours || 0);
      if (sortBy === 'recent') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
    });
  }, [tasks, searchQuery, filterProject, filterAssignee, filterPriority, filterStatus, sortBy, currentUser]);

  // Action Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Validation Error', 'Please enter a task title.');
      return;
    }
    const p = projects.find(pr => pr.id === newTask.projectId);
    const l = leads.find(le => le.id === newTask.leadId);
    addTask({
      ...newTask,
      projectName: p ? p.name : newTask.projectName,
      clientId: p ? p.clientId : undefined,
      clientName: p ? p.clientName : undefined,
      leadId: l ? l.id : undefined,
      leadName: l ? (l.company || l.name) : undefined
    });
    setIsAddModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      projectId: projects[0]?.id || '',
      projectName: projects[0]?.name || '',
      leadId: '',
      assignedTo: currentUser?.fullName || 'Abhinav',
      priority: 'High',
      status: 'TO DO',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 8,
      actualHours: 0
    });
  };

  const handleCreateQuickColumnTask = (e: React.FormEvent, status: TaskStatus) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    const defaultProject = projects[0];
    addTask({
      title: quickTaskTitle,
      description: `Task added directly to sprint column: ${status}`,
      projectId: defaultProject?.id || '',
      projectName: defaultProject?.name || 'Internal AGX',
      clientId: defaultProject?.clientId,
      clientName: defaultProject?.clientName,
      assignedTo: currentUser?.fullName || 'Abhinav',
      priority: 'High',
      status: status,
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 4,
      actualHours: 0
    });
    setQuickTaskTitle('');
    setQuickAddColumn(null);
    toast.success('Task Added', `Deliverable added to ${status}`);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    const p = projects.find(pr => pr.id === editingTask.projectId);
    const l = leads.find(le => le.id === editingTask.leadId);
    const updated = {
      ...editingTask,
      projectName: p ? p.name : editingTask.projectName,
      clientId: p ? p.clientId : editingTask.clientId,
      clientName: p ? p.clientName : editingTask.clientName,
      leadId: l ? l.id : editingTask.leadId,
      leadName: l ? (l.company || l.name) : editingTask.leadName
    };
    updateTask(editingTask.id, updated);
    if (selectedTask?.id === editingTask.id) {
      setSelectedTask(updated);
    }
    setEditingTask(null);
    toast.success('Task Updated', 'Sprint task modified.');
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    if (selectedTask?.id === taskToDelete.id) {
      setSelectedTask(null);
    }
    setTaskToDelete(null);
  };

  const handleLogHours = (taskId: string, additionalHours: number) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const newActual = Math.max(0, (target.actualHours || 0) + additionalHours);
    updateTask(target.id, { ...target, actualHours: newActual });
    if (selectedTask?.id === target.id) {
      setSelectedTask({ ...selectedTask, actualHours: newActual });
    }
    toast.success('Hours Logged', `Logged +${additionalHours}h on ${target.title}`);
  };

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_tasks_sprint', filteredTasks.map(t => ({
      ID: t.id,
      TaskTitle: t.title,
      Project: t.projectName || 'Internal',
      Client: t.clientName || 'N/A',
      AssignedTo: t.assignedTo,
      Priority: t.priority,
      Status: t.status,
      DueDate: t.dueDate,
      EstHours: t.estimatedHours,
      ActHours: t.actualHours
    })));
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, status);
      if (selectedTask?.id === taskId) {
        setSelectedTask(prev => prev ? { ...prev, status } : null);
      }
    }
  };
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  // Current selected task reactive lookup
  const currentSelectedTask = selectedTask
    ? (tasks.find(t => t.id === selectedTask.id) || selectedTask)
    : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Task & Productivity Engine
          </h2>
          <p className="text-xs text-gray-500">
            Output-focused task management with hour estimation, review stages, and blocker tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer btn-press"
          >
            <Download size={14} /> Export CSV
          </button>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-press ${
                viewMode === 'kanban' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-press ${
                viewMode === 'list' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
              }`}
            >
              Table List
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs shadow-md transition-colors cursor-pointer btn-press"
          >
            <Plus size={15} /> Create Task
          </button>
        </div>
      </div>

      {/* Row 1: KPI Metrics Header with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Sprint Deliverables</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {taskMetrics.totalCount} Active Tasks
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Layers size={13} /> {taskMetrics.inProgressCount} in Development
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <CheckSquare size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Sprint Velocity</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                {taskMetrics.completionVelocity}% Done
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> {taskMetrics.completedCount} of {taskMetrics.totalCount} Delivered
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Engineering Hours</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {taskMetrics.totalActHours}h Logged
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> {taskMetrics.totalEstHours}h Total Allocated
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Clock size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Attention Required</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block tabular-nums">
                {taskMetrics.blockedCount + taskMetrics.urgentCount} High Priority
              </span>
              <span className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <AlertOctagon size={13} /> {taskMetrics.blockedCount} Blocked, {taskMetrics.urgentCount} Urgent
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, assignees..."
              className="w-full bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 outline-none focus:border-black transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* My Tasks Quick Toggle */}
            <button
              onClick={() => setFilterAssignee(filterAssignee === 'My Tasks' ? 'All' : 'My Tasks')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 btn-press ${
                filterAssignee === 'My Tasks'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              <UserCheck size={14} className={filterAssignee === 'My Tasks' ? 'text-[#CCFF00]' : 'text-gray-400'} />
              <span>My Tasks</span>
            </button>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300 max-w-[170px] truncate"
            >
              <option value="All">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Assignee Filter */}
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Assignees</option>
              <option value="My Tasks">Assigned to Me</option>
              {dynamicAssignees.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter for list mode */}
            {viewMode === 'list' && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
              >
                <option value="All">All Statuses</option>
                {TASK_STATUSES.map(s => (
                  <option key={s.status} value={s.status}>{s.label}</option>
                ))}
              </select>
            )}

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-gray-300"
            >
              <option value="dueDate">Sort: Nearest Due Date</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="hours">Sort: Estimated Hours</option>
              <option value="recent">Sort: Recently Added</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {(searchQuery || filterProject !== 'All' || filterAssignee !== 'All' || filterPriority !== 'All' || filterStatus !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex-wrap">
            <span className="font-semibold">Active Filters ({filteredTasks.length} tasks):</span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md font-medium flex items-center gap-1">
                "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {filterProject !== 'All' && (
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-medium flex items-center gap-1">
                Project: {projects.find(p => p.id === filterProject)?.name || filterProject} <X size={11} className="cursor-pointer" onClick={() => setFilterProject('All')} />
              </span>
            )}
            {filterAssignee !== 'All' && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-medium flex items-center gap-1">
                Assignee: {filterAssignee} <X size={11} className="cursor-pointer" onClick={() => setFilterAssignee('All')} />
              </span>
            )}
            {filterPriority !== 'All' && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-medium flex items-center gap-1">
                Priority: {filterPriority} <X size={11} className="cursor-pointer" onClick={() => setFilterPriority('All')} />
              </span>
            )}
            {filterStatus !== 'All' && (
              <span className="px-2 py-0.5 bg-lime-100 text-lime-800 rounded-md font-medium flex items-center gap-1">
                Status: {filterStatus} <X size={11} className="cursor-pointer" onClick={() => setFilterStatus('All')} />
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterProject('All');
                setFilterAssignee('All');
                setFilterPriority('All');
                setFilterStatus('All');
              }}
              className="text-indigo-600 font-bold hover:underline ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Row 3: Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {TASK_STATUSES.map((col) => {
            const columnTasks = filteredTasks.filter(t => t.status === col.status);

            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-3 min-w-[240px] flex flex-col justify-between min-h-[520px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 px-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-extrabold text-gray-800">{col.label}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white text-gray-700 border border-gray-200">
                        {columnTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setQuickAddColumn(col.status);
                        setQuickTaskTitle('');
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-200/60 cursor-pointer"
                      title={`Add task to ${col.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Inline Quick Add Input */}
                  {quickAddColumn === col.status && (
                    <form onSubmit={(e) => handleCreateQuickColumnTask(e, col.status)} className="mb-3 space-y-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Task title..."
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs outline-none focus:border-black"
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuickAddColumn(null)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-[10px] cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                        No tasks in {col.label}
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedTask(task)}
                          className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative flex flex-col justify-between card-tactile"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  task.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-200/80' :
                                  task.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                                  'bg-gray-50 text-gray-600 border-gray-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    task.priority === 'Urgent' ? 'bg-rose-500' :
                                    task.priority === 'High' ? 'bg-amber-500' :
                                    'bg-gray-400'
                                  }`} />
                                  {task.priority}
                                </span>
                                {task.dueDate && (() => {
                                  const dueInfo = formatFriendlyDueDate(task.dueDate);
                                  return (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${dueInfo.badgeClass}`}>
                                      {dueInfo.text}
                                    </span>
                                  );
                                })()}
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setEditingTask(task)}
                                  className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer btn-press"
                                  title="Edit Task"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => setTaskToDelete(task)}
                                  className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer btn-press"
                                  title="Delete Task"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>

                            <h4 className="font-extrabold text-xs text-gray-900 mt-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </h4>

                            {task.projectName && (
                              <div className="text-[10px] font-semibold text-indigo-600 mt-1 line-clamp-1">
                                {task.projectName}
                              </div>
                            )}

                            {task.leadName && (
                              <div className="text-[10px] font-semibold text-purple-700 mt-0.5 line-clamp-1 flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded-md w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                                Lead: {task.leadName}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                            <span className="flex items-center gap-1 font-semibold text-gray-700 truncate max-w-[100px]">
                              <User size={12} className="text-gray-400 shrink-0" />
                              {(task.assignedTo || 'Unassigned').split(' ')[0]}
                            </span>
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span className="flex items-center gap-1 font-mono text-[10px] text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded tabular-nums">
                                <Clock size={11} className="text-gray-400" />
                                {task.actualHours}h / {task.estimatedHours}h
                              </span>
                              <button
                                onClick={() => updateTask(task.id, { actualHours: (task.actualHours || 0) + 1 })}
                                className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer btn-press"
                                title="Log +1 hour"
                              >
                                +1h
                              </button>
                              <button
                                onClick={() => updateTask(task.id, { actualHours: (task.actualHours || 0) + 2 })}
                                className="px-1.5 py-0.5 text-[9px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded cursor-pointer btn-press"
                                title="Log +2 hours"
                              >
                                +2h
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2 text-center text-[10px] text-gray-400 border-t border-gray-200/50">
                  Drag & drop to transition stage
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Row 4: Table List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Task Title</th>
                  <th className="py-3.5 px-4">Project & Client</th>
                  <th className="py-3.5 px-4">Assigned Engineer</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Hours (Act/Est)</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                      No tasks found matching the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`transition-colors cursor-pointer group border-l-4 ${
                        selectedTask?.id === task.id
                          ? 'bg-indigo-50/70 border-indigo-600'
                          : 'hover:bg-gray-50/80 border-transparent'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="font-extrabold text-gray-900 text-xs group-hover:text-indigo-600 transition-colors">{task.title}</div>
                        {task.description && (
                          <div className="text-[10px] text-gray-400 font-normal line-clamp-1">{task.description}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-indigo-600">{task.projectName || 'Internal AGX'}</div>
                        <div className="text-[10px] text-gray-400">{task.clientName || ''}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {task.assignedTo}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                          task.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 border-rose-200/80' :
                          task.priority === 'High' ? 'bg-amber-50 text-amber-700 border-amber-200/80' :
                          task.priority === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200/80' :
                          'bg-gray-100 text-gray-700 border-gray-200/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 'Urgent' ? 'bg-rose-500' :
                            task.priority === 'High' ? 'bg-amber-500' :
                            task.priority === 'Medium' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="text-xs font-bold px-2.5 py-1 rounded-xl bg-gray-100 border border-gray-200/60 outline-none cursor-pointer hover:border-gray-300"
                        >
                          {TASK_STATUSES.map(s => (
                            <option key={s.status} value={s.status}>{s.label}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        {task.dueDate ? (
                          (() => {
                            const dueInfo = formatFriendlyDueDate(task.dueDate);
                            return (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${dueInfo.badgeClass}`}>
                                {dueInfo.text}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-gray-400 text-[10px]">No date</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-gray-800 tabular-nums">
                        {task.actualHours}h / {task.estimatedHours}h
                      </td>

                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1 text-gray-400 hover:text-black rounded cursor-pointer btn-press"
                            title="Edit Task"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer btn-press"
                            title="Delete Task"
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

      {/* Row 5: 360° Task Details Drawer */}
      <AnimatePresence>
        {currentSelectedTask && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded ${
                        currentSelectedTask.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                        currentSelectedTask.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {currentSelectedTask.priority}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        currentSelectedTask.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        currentSelectedTask.status === 'IN PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        currentSelectedTask.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {currentSelectedTask.status}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{currentSelectedTask.title}</h2>
                    <span className="text-xs text-gray-400">
                      Project: <strong className="text-gray-700">{currentSelectedTask.projectName || 'Internal AGX'}</strong> • Assignee: <strong>{currentSelectedTask.assignedTo}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTask(currentSelectedTask)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Quick Linkages Toolbar */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  {currentSelectedTask.projectId && (
                    <button
                      onClick={() => {
                        const pId = currentSelectedTask.projectId;
                        setSelectedTask(null);
                        onNavigate('projects', pId);
                      }}
                      className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Briefcase size={13} /> Project Hub
                    </button>
                  )}
                  {currentSelectedTask.clientId && (
                    <button
                      onClick={() => {
                        const cId = currentSelectedTask.clientId;
                        setSelectedTask(null);
                        onNavigate('clients', cId);
                      }}
                      className="py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Users size={13} /> Client 360°
                    </button>
                  )}
                  <button
                    onClick={() => onNavigate('calendar', 'new')}
                    className="py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Calendar size={13} /> Review Call
                  </button>
                </div>

                {/* Stage Progression Buttons */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 mb-5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Stage Progression</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {TASK_STATUSES.map(s => (
                      <button
                        key={s.status}
                        onClick={() => {
                          updateTaskStatus(currentSelectedTask.id, s.status);
                          setSelectedTask({ ...currentSelectedTask, status: s.status });
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                          currentSelectedTask.status === s.status
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hours & Time Logger */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold text-gray-900 block text-xs">Logged Work Hours</span>
                      <span className="text-gray-400 text-[11px]">Due Date: {currentSelectedTask.dueDate}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-lg font-black text-gray-900">{currentSelectedTask.actualHours}h</span>
                      <span className="text-gray-400 text-xs"> / {currentSelectedTask.estimatedHours}h est</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                    <span className="text-[11px] font-bold text-gray-500">Quick Log Time:</span>
                    <button
                      onClick={() => handleLogHours(currentSelectedTask.id, 1)}
                      className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-800 cursor-pointer shadow-2xs"
                    >
                      +1h
                    </button>
                    <button
                      onClick={() => handleLogHours(currentSelectedTask.id, 2)}
                      className="px-3 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-800 cursor-pointer shadow-2xs"
                    >
                      +2h
                    </button>
                    <button
                      onClick={() => handleLogHours(currentSelectedTask.id, 4)}
                      className="px-3 py-1 rounded-lg bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      +4h
                    </button>
                  </div>
                </div>

                {/* Scope & Description */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs mb-2">Acceptance Criteria & Scope</h4>
                  <p className="text-gray-700 text-xs leading-relaxed">
                    {currentSelectedTask.description || 'No detailed scope description provided for this deliverable.'}
                  </p>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setTaskToDelete(currentSelectedTask)}
                  className="text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Task
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-black text-white font-bold text-xs rounded-xl hover:bg-gray-800 cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Create Operational Task</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Implement webhook retry queues in n8n"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Related Project</label>
                  <select
                    value={newTask.projectId}
                    onChange={(e) => {
                      const p = projects.find(pr => pr.id === e.target.value);
                      setNewTask({ ...newTask, projectId: e.target.value, projectName: p ? p.name : '' });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- No Specific Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Linked Lead / Opportunity</label>
                  <select
                    value={newTask.leadId || ''}
                    onChange={(e) => setNewTask({ ...newTask, leadId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                  >
                    <option value="">-- None (Project / Direct Task) --</option>
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>{l.company || l.name} ({l.status})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Staff</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer focus:border-black"
                >
                  {dynamicAssignees.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description & Acceptance Criteria</label>
                <textarea
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detail edge cases, required test coverage, or mock payloads..."
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
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-lg text-gray-900">Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-900 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Staff</label>
                  <select
                    value={editingTask.assignedTo}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {dynamicAssignees.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    {TASK_STATUSES.map(s => (
                      <option key={s.status} value={s.status}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={editingTask.estimatedHours}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Actual Hours</label>
                  <input
                    type="number"
                    value={editingTask.actualHours}
                    onChange={(e) => setEditingTask({ ...editingTask, actualHours: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
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

      {/* Delete Task Confirmation */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={24} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">Delete Task?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to permanently remove <strong>{taskToDelete.title}</strong>?
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Delete Task
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
