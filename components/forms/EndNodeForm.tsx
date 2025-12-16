'use client';

import { EndNodeData } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { Flag } from 'lucide-react';

interface EndNodeFormProps {
  nodeId: string;
  data: EndNodeData;
}

export function EndNodeForm({ nodeId, data }: EndNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const handleUpdate = (field: keyof EndNodeData, value: any) => {
    updateNodeData(nodeId, { [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <div className="p-2 bg-gradient-to-br from-rose-500 to-red-600 rounded-lg">
          <Flag className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">End Node</h3>
          <p className="text-xs text-slate-400">Workflow completion point</p>
        </div>
      </div>

      {/* End Message Field */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          End Message
        </label>
        <textarea
          value={data.endMessage || ''}
          onChange={(e) => handleUpdate('endMessage', e.target.value)}
          placeholder="Message to display when workflow completes..."
          rows={3}
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Show Summary Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Options
        </label>
        <label className="flex items-center gap-3 p-3 bg-slate-700/30 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
          <input
            type="checkbox"
            checked={data.showSummary ?? true}
            onChange={(e) => handleUpdate('showSummary', e.target.checked)}
            className="w-5 h-5 rounded border-slate-500 bg-slate-700 text-rose-500 focus:ring-rose-500 focus:ring-offset-slate-800 cursor-pointer"
          />
          <div>
            <span className="text-sm font-medium text-white">Show Summary</span>
            <p className="text-xs text-slate-400">
              Display a summary of all completed steps when workflow ends
            </p>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Preview</label>
        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Workflow Complete</span>
          </div>
          <p className="text-sm text-slate-300">
            {data.endMessage || 'Workflow completed successfully'}
          </p>
          {data.showSummary && (
            <p className="text-xs text-slate-500 mt-2 italic">
              + Summary will be displayed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

