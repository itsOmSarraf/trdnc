'use client';

import { useWorkflowStore, useSelectedNode } from '@/store/workflowStore';
import { StartNodeForm } from './StartNodeForm';
import { TaskNodeForm } from './TaskNodeForm';
import { ApprovalNodeForm } from './ApprovalNodeForm';
import { AutomatedStepNodeForm } from './AutomatedStepNodeForm';
import { EndNodeForm } from './EndNodeForm';
import { X, Trash2 } from 'lucide-react';
import {
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  EndNodeData,
} from '@/types/workflow';

export function NodeFormPanel() {
  const isPanelOpen = useWorkflowStore((state) => state.isPanelOpen);
  const setIsPanelOpen = useWorkflowStore((state) => state.setIsPanelOpen);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const selectNode = useWorkflowStore((state) => state.selectNode);
  const selectedNode = useSelectedNode();

  if (!isPanelOpen || !selectedNode) {
    return null;
  }

  const handleClose = () => {
    setIsPanelOpen(false);
    selectNode(null);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(selectedNode.id);
    }
  };

  const renderForm = () => {
    const { id, data, type } = selectedNode;
    
    switch (type) {
      case 'start':
        return <StartNodeForm nodeId={id} data={data as StartNodeData} />;
      case 'task':
        return <TaskNodeForm nodeId={id} data={data as TaskNodeData} />;
      case 'approval':
        return <ApprovalNodeForm nodeId={id} data={data as ApprovalNodeData} />;
      case 'automated':
        return <AutomatedStepNodeForm nodeId={id} data={data as AutomatedStepNodeData} />;
      case 'end':
        return <EndNodeForm nodeId={id} data={data as EndNodeData} />;
      default:
        return <p className="text-slate-400">Unknown node type</p>;
    }
  };

  return (
    <div className="absolute right-0 top-0 h-full w-[360px] bg-slate-800/95 backdrop-blur-lg border-l border-slate-700 shadow-2xl z-50 flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
        <h2 className="text-sm font-semibold text-white">Node Configuration</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
            title="Delete node"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            title="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderForm()}
      </div>

      {/* Panel Footer */}
      <div className="px-4 py-3 border-t border-slate-700 bg-slate-900/50">
        <p className="text-xs text-slate-500">
          Node ID: <code className="text-slate-400">{selectedNode.id}</code>
        </p>
      </div>
    </div>
  );
}

