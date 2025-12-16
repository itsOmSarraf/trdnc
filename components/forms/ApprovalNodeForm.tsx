'use client';

import { ApprovalNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { UserCheck } from 'lucide-react';

interface ApprovalNodeFormProps {
  nodeId: string;
  data: ApprovalNodeData;
}

const APPROVER_ROLES = [
  { value: 'Manager', label: 'Manager' },
  { value: 'HRBP', label: 'HR Business Partner (HRBP)' },
  { value: 'Director', label: 'Director' },
  { value: 'VP', label: 'Vice President' },
  { value: 'CFO', label: 'Chief Financial Officer' },
  { value: 'CEO', label: 'Chief Executive Officer' },
];

export function ApprovalNodeForm({ nodeId, data }: ApprovalNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleUpdate = (field: keyof ApprovalNodeData, value: any) => {
    updateNodeData(nodeId, { [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Approval Node</h3>
          <p className="text-xs text-slate-400">Approval step configuration</p>
        </div>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => handleUpdate('title', e.target.value)}
          placeholder="e.g., Manager Approval"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Approver Role Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Approver Role
        </label>
        <select
          value={data.approverRole || 'Manager'}
          onChange={(e) => handleUpdate('approverRole', e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          {APPROVER_ROLES.map((role) => (
            <option key={role.value} value={role.value} className="bg-slate-800">
              {role.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">
          Select the role required to approve this step
        </p>
      </div>

      {/* Auto-Approve Threshold Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Auto-Approve Threshold (days)
        </label>
        <input
          type="number"
          min="0"
          max="365"
          value={data.autoApproveThreshold || 0}
          onChange={(e) => handleUpdate('autoApproveThreshold', parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-slate-500">
          Set to 0 to disable auto-approval. Otherwise, requests will be automatically approved if within the threshold.
        </p>
      </div>

      {/* Visual Indicator */}
      {data.autoApproveThreshold > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            ⚡ Auto-approval enabled for requests ≤ {data.autoApproveThreshold} days
          </p>
        </div>
      )}
    </div>
  );
}

