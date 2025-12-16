'use client';

import { StartNodeData, KeyValuePair } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { KeyValueEditor } from './KeyValueEditor';
import { Play } from 'lucide-react';

interface StartNodeFormProps {
  nodeId: string;
  data: StartNodeData;
}

export function StartNodeForm({ nodeId, data }: StartNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleUpdate = (field: keyof StartNodeData, value: any) => {
    updateNodeData(nodeId, { [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
          <Play className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Start Node</h3>
          <p className="text-xs text-slate-400">Workflow entry point</p>
        </div>
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Start Title
        </label>
        <input
          type="text"
          value={data.title || ''}
          onChange={(e) => handleUpdate('title', e.target.value)}
          placeholder="Enter workflow start title"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Label Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Display Label
        </label>
        <input
          type="text"
          value={data.label || ''}
          onChange={(e) => handleUpdate('label', e.target.value)}
          placeholder="Node display label"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Metadata Key-Value Editor */}
      <KeyValueEditor
        label="Metadata (Optional)"
        values={data.metadata || []}
        onChange={(values: KeyValuePair[]) => handleUpdate('metadata', values)}
      />
    </div>
  );
}

