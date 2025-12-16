'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ApprovalNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { UserCheck, Shield } from 'lucide-react';

function ApprovalNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as ApprovalNodeData;
  const selectNode = useWorkflowStore((state) => state.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        relative min-w-[200px] rounded-xl 
        bg-gradient-to-br from-amber-500 to-orange-600
        shadow-lg shadow-amber-500/20
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-102'}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-amber-500"
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <UserCheck className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
          Approval
        </span>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3 space-y-2">
        <h3 className="text-sm font-semibold text-white truncate">
          {nodeData.title || 'Approval Required'}
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-md">
            <Shield className="w-3 h-3 text-white/80" />
            <span className="text-xs text-white/80 font-medium">
              {nodeData.approverRole || 'Manager'}
            </span>
          </div>
        </div>

        {nodeData.autoApproveThreshold > 0 && (
          <p className="text-xs text-white/60">
            Auto-approve if ≤ {nodeData.autoApproveThreshold} days
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-orange-500"
      />
    </div>
  );
}

export const ApprovalNode = memo(ApprovalNodeComponent);

