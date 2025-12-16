'use client';

import { TaskNodeData, KeyValuePair } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { KeyValueEditor } from './KeyValueEditor';
import { ClipboardList } from 'lucide-react';

interface TaskNodeFormProps {
  nodeId: string;
  data: TaskNodeData;
}

export function TaskNodeForm({ nodeId, data }: TaskNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleUpdate = (field: keyof TaskNodeData, value: any) => {
    updateNodeData(nodeId, { [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Task Node</h3>
          <p className="text-xs text-slate-400">Human task configuration</p>
        </div>
      </div>

      {/* Title Field (Required) */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Title <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => handleUpdate('title', e.target.value)}
          placeholder="e.g., Collect Documents"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Description
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => handleUpdate('description', e.target.value)}
          placeholder="Describe what needs to be done in this task..."
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Assignee Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Assignee
        </label>
        <input
          type="text"
          value={data.assignee || ''}
          onChange={(e) => handleUpdate('assignee', e.target.value)}
          placeholder="e.g., HR Manager, John Doe"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Due Date Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Due Date
        </label>
        <input
          type="date"
          value={data.dueDate || ''}
          onChange={(e) => handleUpdate('dueDate', e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all [color-scheme:dark]"
        />
      </div>

      {/* Custom Fields Key-Value Editor */}
      <KeyValueEditor
        label="Custom Fields (Optional)"
        values={data.customFields || []}
        onChange={(values: KeyValuePair[]) => handleUpdate('customFields', values)}
      />
    </div>
  );
}

