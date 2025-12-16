'use client';

import { DragEvent } from 'react';
import { NodeType } from '@/types/workflow';
import {
  Play,
  ClipboardList,
  UserCheck,
  Zap,
  Flag,
  GripVertical,
} from 'lucide-react';

interface NodeItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
}

const nodeItems: NodeItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play className="w-4 h-4" />,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Human task step',
    icon: <ClipboardList className="w-4 h-4" />,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Approval required',
    icon: <UserCheck className="w-4 h-4" />,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    type: 'automated',
    label: 'Automated',
    description: 'System action',
    icon: <Zap className="w-4 h-4" />,
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow end point',
    icon: <Flag className="w-4 h-4" />,
    gradient: 'from-rose-500 to-red-600',
  },
];

export function NodeSidebar() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-[220px] h-full bg-slate-900/80 backdrop-blur-lg border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <h2 className="text-sm font-semibold text-white">Node Types</h2>
        <p className="text-xs text-slate-400 mt-1">Drag nodes to canvas</p>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {nodeItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            className="group flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02]"
          >
            <div
              className={`p-2 bg-gradient-to-br ${item.gradient} rounded-lg shadow-lg`}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-slate-400 truncate">{item.description}</p>
            </div>
            <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Footer Tip */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
        <p className="text-xs text-slate-500">
          💡 Connect nodes by dragging from handles
        </p>
      </div>
    </div>
  );
}

