'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { EndNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { Flag, FileText } from 'lucide-react';

function EndNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as EndNodeData;
  const selectNode = useWorkflowStore((state) => state.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        relative min-w-[180px] rounded-xl 
        bg-gradient-to-br from-rose-500 to-red-600
        shadow-lg shadow-rose-500/20
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-102'}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-rose-500"
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <Flag className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
          End
        </span>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3 space-y-2">
        <h3 className="text-sm font-semibold text-white truncate">
          {nodeData.endMessage || 'Workflow End'}
        </h3>
        
        {nodeData.showSummary && (
          <div className="flex items-center gap-1 text-xs text-white/60">
            <FileText className="w-3 h-3" />
            <span>Show summary</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const EndNode = memo(EndNodeComponent);

