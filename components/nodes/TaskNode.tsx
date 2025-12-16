'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { TaskNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { ClipboardList, User, Calendar } from 'lucide-react';

function TaskNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as TaskNodeData;
  const selectNode = useWorkflowStore((state) => state.selectNode);

  return (
    <div
      onClick={() => selectNode(id)}
      className={`
        relative min-w-[200px] rounded-xl 
        bg-gradient-to-br from-blue-500 to-indigo-600
        shadow-lg shadow-blue-500/20
        transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-102'}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-white !border-2 !border-blue-500"
      />

      {/* Node Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20">
        <div className="p-1.5 bg-white/20 rounded-lg">
          <ClipboardList className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
          Task
        </span>
      </div>

      {/* Node Content */}
      <div className="px-4 py-3 space-y-2">
        <h3 className="text-sm font-semibold text-white truncate">
          {nodeData.title || 'Untitled Task'}
        </h3>
        
        {nodeData.description && (
          <p className="text-xs text-white/70 line-clamp-2">
            {nodeData.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {nodeData.assignee && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{nodeData.assignee}</span>
            </div>
          )}
          {nodeData.dueDate && (
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Calendar className="w-3 h-3" />
              <span>{nodeData.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-white !border-2 !border-indigo-500"
      />
    </div>
  );
}

export const TaskNode = memo(TaskNodeComponent);

