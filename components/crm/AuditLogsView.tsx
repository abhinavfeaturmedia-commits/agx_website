import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Search, Filter, Clock, User, ArrowRight, Eye, CheckCircle2,
  Download, AlertTriangle, Key, Layers, Briefcase, Users, IndianRupee,
  FileText, X, ArrowUpRight, CheckCircle, Database
} from 'lucide-react';
import { AuditLog } from '../../types/crm';
import { useCrmStore } from '../../lib/crmStore';
import { exportService } from '../../lib/exportService';
import { toast } from '../../lib/toastStore';

interface AuditLogsViewProps {
  store: ReturnType<typeof useCrmStore>;
  onNavigate: (route: string, entityId?: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ store, onNavigate }) => {
  const { auditLogs } = store;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('All');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  // Audit KPI Metrics
  const auditMetrics = useMemo(() => {
    const totalEvents = auditLogs.length;
    const secretReveals = auditLogs.filter(l => l.actionType === 'REVEAL_SECRET').length;
    const paymentsLogged = auditLogs.filter(l => l.actionType === 'PAYMENT_RECORDED').length;
    const leadConversions = auditLogs.filter(l => l.actionType === 'CONVERT_LEAD').length;

    return {
      totalEvents,
      secretReveals,
      paymentsLogged,
      leadConversions
    };
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        log.description.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        (log.entityId && log.entityId.toLowerCase().includes(q));

      const matchesAction = selectedAction === 'All' || log.actionType === selectedAction;
      return matchesSearch && matchesAction;
    });
  }, [auditLogs, searchQuery, selectedAction]);

  const handleExportCsv = () => {
    exportService.exportToCsv('agx_audit_trail', filteredLogs.map(log => ({
      Timestamp: new Date(log.createdAt).toLocaleString(),
      User: log.userName,
      UserRole: log.userRole,
      Action: log.actionType,
      Entity: `${log.entityType} (${log.entityId || 'N/A'})`,
      Summary: log.description
    })));
    toast.success('Audit Trail Exported', 'CSV downloaded.');
  };

  const getActionBadge = (type: AuditLog['actionType']) => {
    switch (type) {
      case 'CONVERT_LEAD': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PAYMENT_RECORDED': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'STATUS_CHANGE': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'REVEAL_SECRET': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'CREATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UPDATE': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleNavigateEntity = (log: AuditLog) => {
    const entity = log.entityType.toLowerCase();
    setSelectedLogForDetails(null);
    if (entity.includes('lead')) {
      onNavigate('leads', log.entityId);
    } else if (entity.includes('client')) {
      onNavigate('clients', log.entityId);
    } else if (entity.includes('project')) {
      onNavigate('projects', log.entityId);
    } else if (entity.includes('task')) {
      onNavigate('tasks', log.entityId);
    } else if (entity.includes('credential') || entity.includes('vault')) {
      onNavigate('vault', log.entityId);
    } else if (entity.includes('invoice') || entity.includes('payment') || entity.includes('expense')) {
      onNavigate('finance', log.entityId);
    } else if (entity.includes('agreement') || entity.includes('document')) {
      onNavigate('documents', log.entityId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Audit Logs & Security Trail
          </h2>
          <p className="text-xs text-gray-500">
            Immutable chronological record of all CRM mutations, status transitions, and secret access.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} /> Export Audit CSV
          </button>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
            <Shield size={14} /> Immutable Logging Active
          </div>
        </div>
      </div>

      {/* Row 1: Audit KPIs Header Banner with Double-Bezel Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Logged Mutations</span>
              <span className="text-2xl font-black text-gray-900 mt-1 block tabular-nums">
                {auditMetrics.totalEvents} Events
              </span>
              <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Clock size={13} /> Real-time PostgreSQL Ledger
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shadow-xs">
              <Clock size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Secret Reveal Traces</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block tabular-nums">
                {auditMetrics.secretReveals} Access Events
              </span>
              <span className="text-xs text-rose-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <Key size={13} /> Zero-Exposure Traced
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-xs">
              <Key size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commercial Ledger Mutators</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block tabular-nums">
                {auditMetrics.paymentsLogged} Payments
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <IndianRupee size={13} /> Inflows & Collections
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee size={18} />
            </div>
          </div>
        </div>

        <div className="double-bezel-outer card-tactile">
          <div className="double-bezel-inner p-5 flex items-start justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lead Conversions</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block tabular-nums">
                {auditMetrics.leadConversions} Accounts
              </span>
              <span className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-1 tabular-nums">
                <CheckCircle2 size={13} /> Client Provisionings
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <Users size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by user, entity, action..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-xs text-gray-800 outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">Action:</span>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="All">All Actions ({auditLogs.length})</option>
            <option value="STATUS_CHANGE">Status Changes</option>
            <option value="CONVERT_LEAD">Lead Conversions</option>
            <option value="PAYMENT_RECORDED">Payments</option>
            <option value="REVEAL_SECRET">Secret Reveals</option>
            <option value="CREATE">Record Creations</option>
            <option value="UPDATE">Record Updates</option>
            <option value="DELETE">Deletions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-5">Activity Summary</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    No audit records match the specified search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLogForDetails(log)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {log.userName}
                      <span className="text-[10px] text-gray-400 block font-normal">{log.userRole}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getActionBadge(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {log.entityType}
                    </td>
                    <td className="py-3.5 px-5 text-gray-700">
                      <div className="line-clamp-1">{log.description}</div>
                      {log.beforeState && log.afterState && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-xs">
                          Diff: {JSON.stringify(log.beforeState)} → {JSON.stringify(log.afterState)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLogForDetails(log);
                        }}
                        className="p-1 text-gray-400 hover:text-black rounded"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° Audit Event Inspection Drawer */}
      <AnimatePresence>
        {selectedLogForDetails && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto flex flex-col p-6 sm:p-8 justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-gray-100">
                  <div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${getActionBadge(selectedLogForDetails.actionType)} inline-block mb-2`}>
                      {selectedLogForDetails.actionType}
                    </span>
                    <h2 className="text-lg font-extrabold text-gray-900">Audit Trail Event Inspection</h2>
                    <span className="text-xs text-gray-400 font-mono">Log ID: {selectedLogForDetails.id}</span>
                  </div>
                  <button
                    onClick={() => setSelectedLogForDetails(null)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Event Metadata */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2.5 my-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Timestamp:</span>
                    <strong className="text-gray-900 font-mono">{new Date(selectedLogForDetails.createdAt).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User / Actor:</span>
                    <strong className="text-gray-900">{selectedLogForDetails.userName} ({selectedLogForDetails.userRole})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entity Type:</span>
                    <strong className="text-gray-900">{selectedLogForDetails.entityType}</strong>
                  </div>
                  {selectedLogForDetails.entityId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entity ID:</span>
                      <span className="font-mono text-gray-700">{selectedLogForDetails.entityId}</span>
                    </div>
                  )}
                </div>

                {/* Human-Readable Description */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
                  <span className="font-bold text-gray-900 block text-xs mb-1">Activity Summary:</span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedLogForDetails.description}
                  </p>
                </div>

                {/* State Diff Inspector */}
                {selectedLogForDetails.beforeState && selectedLogForDetails.afterState && (
                  <div className="space-y-2 mb-4">
                    <span className="font-bold text-gray-900 block text-xs">State Mutation Diff:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl overflow-x-auto">
                        <span className="text-[10px] text-rose-700 font-bold block mb-1">Before State</span>
                        <pre className="text-[10px] text-rose-900">{JSON.stringify(selectedLogForDetails.beforeState, null, 2)}</pre>
                      </div>
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl overflow-x-auto">
                        <span className="text-[10px] text-emerald-700 font-bold block mb-1">After State</span>
                        <pre className="text-[10px] text-emerald-900">{JSON.stringify(selectedLogForDetails.afterState, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer & Linkages */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                {selectedLogForDetails.entityId && (
                  <button
                    type="button"
                    onClick={() => handleNavigateEntity(selectedLogForDetails)}
                    className="px-4 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    Inspect {selectedLogForDetails.entityType} <ArrowRight size={13} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedLogForDetails(null)}
                  className="px-4 py-2.5 border border-gray-200 font-bold text-xs rounded-xl hover:bg-gray-50 cursor-pointer ml-auto"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
