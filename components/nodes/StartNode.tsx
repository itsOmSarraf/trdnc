'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { StartNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { Play, AlertTriangle } from 'lucide-react';

function StartNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as StartNodeData;
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const validationErrors = useWorkflowStore((state) => state.validationErrors);
  
  // Check if this node has validation errors
  const nodeErrors = validationErrors.filter((e) => e.nodeId === id);
  const hasErrors = nodeErrors.length > 0;

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        relative min-w-[180px] rounded-xl 
        bg-gradient-to-br from-emerald-500 to-teal-600
        shadow-lg shadow-emerald-500/20
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-102'}
        ${hasErrors && !selected ? 'ring-2 ring-rose-500/50' : ''}
      `}
    >
      {/* Validation Error Badge */}
      {hasErrors && (
        <div 
          className="absolute -top-2 -right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse"
          title={nodeErrors.map(e => e.message).join('\n')}
        >
          <AlertTriangle className="w-3 h-3" />
        </div>
      )}
      
      {/* Node Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <Play className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
          Start
        </span>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-white truncate">
          {nodeData.title || 'Start'}
        </h3>
        {nodeData.metadata && nodeData.metadata.length > 0 && (
          <p className="text-xs text-white/60 mt-1">
            {nodeData.metadata.length} metadata field{nodeData.metadata.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-emerald-500"
      />
    </div>
  );
}

export const StartNode = memo(StartNodeComponent);

