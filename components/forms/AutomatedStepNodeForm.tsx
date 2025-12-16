'use client';

import { useEffect, useState } from 'react';
import { AutomatedStepNodeData, AutomationAction } from '@/types/workflow';
import { useWorkflowStore } from '@/store/workflowStore';
import { getAutomations } from '@/lib/api/mockApi';
import { Zap, Loader2 } from 'lucide-react';

interface AutomatedStepNodeFormProps {
  nodeId: string;
  data: AutomatedStepNodeData;
}

export function AutomatedStepNodeForm({ nodeId, data }: AutomatedStepNodeFormProps) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAutomations() {
      setLoading(true);
      const actions = await getAutomations();
      setAutomations(actions);
      setLoading(false);
    }
    fetchAutomations();
  }, []);

  const selectedAction = automations.find((a) => a.id === data.actionId);

  const handleUpdate = (field: keyof AutomatedStepNodeData, value: any) => {
    updateNodeData(nodeId, { [field]: value });
  };

  const handleActionChange = (actionId: string) => {
    const action = automations.find((a) => a.id === actionId);
    if (action) {
      // Reset params when action changes
      const newParams: Record<string, string> = {};
      action.params.forEach((param) => {
        newParams[param] = '';
      });
      updateNodeData(nodeId, { actionId, actionParams: newParams });
    } else {
      updateNodeData(nodeId, { actionId: '', actionParams: {} });
    }
  };

  const handleParamChange = (param: string, value: string) => {
    handleUpdate('actionParams', { ...data.actionParams, [param]: value });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Automated Step</h3>
          <p className="text-xs text-slate-400">System-triggered action</p>
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
          placeholder="e.g., Send Welcome Email"
          className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Action Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Action
        </label>
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg">
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-400">Loading actions...</span>
          </div>
        ) : (
          <select
            value={data.actionId || ''}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">
              Select an action...
            </option>
            {automations.map((action) => (
              <option key={action.id} value={action.id} className="bg-slate-800">
                {action.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Description */}
      {selectedAction?.description && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <p className="text-xs text-purple-300">
            {selectedAction.description}
          </p>
        </div>
      )}

      {/* Dynamic Parameters */}
      {selectedAction && selectedAction.params.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">
            Action Parameters
          </h4>
          {selectedAction.params.map((param) => (
            <div key={param} className="space-y-1">
              <label className="text-xs font-medium text-slate-400 capitalize">
                {param.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                value={data.actionParams?.[param] || ''}
                onChange={(e) => handleParamChange(param, e.target.value)}
                placeholder={`Enter ${param.replace(/_/g, ' ')}`}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          ))}
        </div>
      )}

      {/* No Action Selected State */}
      {!selectedAction && !loading && (
        <div className="p-4 bg-slate-700/30 border border-slate-600 border-dashed rounded-lg">
          <p className="text-sm text-slate-400 text-center">
            Select an action to configure parameters
          </p>
        </div>
      )}
    </div>
  );
}

