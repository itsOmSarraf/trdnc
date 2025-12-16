'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { simulateWorkflow, validateWorkflowAPI } from '@/lib/api/mockApi';
import { SimulationStep, ValidationError, Workflow, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function getStepIcon(status: SimulationStep['status']) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-rose-400" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
    case 'skipped':
      return <AlertCircle className="w-4 h-4 text-slate-400" />;
    default:
      return <Clock className="w-4 h-4 text-slate-500" />;
  }
}

function getNodeTypeColor(nodeType: string) {
  switch (nodeType) {
    case 'start':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'task':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'approval':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'automated':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'end':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

function getRecoverySuggestion(nodeType: string): string {
  switch (nodeType) {
    case 'task':
      return 'Check that the assignee exists in your system. Verify the task configuration and ensure all required fields are filled.';
    case 'approval':
      return 'Verify the approver role is correctly configured. Consider adding backup approvers or adjusting the auto-approve threshold.';
    case 'automated':
      return 'Check if the automation service is running. Verify API credentials and ensure the action parameters are correct.';
    default:
      return 'Review the node configuration and ensure all connections are properly set up. Try running validation first.';
  }
}

export function SandboxPanel() {
  const isSandboxOpen = useWorkflowStore((state) => state.isSandboxOpen);
  const setIsSandboxOpen = useWorkflowStore((state) => state.setIsSandboxOpen);
  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const workflowName = useWorkflowStore((state) => state.workflowName);
  const workflowDescription = useWorkflowStore((state) => state.workflowDescription);
  
  const simulationResult = useWorkflowStore((state) => state.simulationResult);
  const setSimulationResult = useWorkflowStore((state) => state.setSimulationResult);
  const isSimulating = useWorkflowStore((state) => state.isSimulating);
  const setIsSimulating = useWorkflowStore((state) => state.setIsSimulating);
  const validationErrors = useWorkflowStore((state) => state.validationErrors);
  const setValidationErrors = useWorkflowStore((state) => state.setValidationErrors);

  const [activeTab, setActiveTab] = useState<'simulation' | 'validation'>('simulation');

  const handleValidate = async () => {
    const workflowNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: n.type as any,
      position: n.position,
      data: n.data as any,
    }));
    
    const workflowEdges: WorkflowEdge[] = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined,
    }));

    const errors = await validateWorkflowAPI(workflowNodes, workflowEdges);
    setValidationErrors(errors);
    setActiveTab('validation');
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setActiveTab('simulation');

    const workflow: Workflow = {
      id: uuidv4(),
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as any,
        position: n.position,
        data: n.data as any,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await simulateWorkflow(workflow);
    setSimulationResult(result);
    setValidationErrors(result.errors);
    setIsSimulating(false);
  };

  const handleClose = () => {
    setIsSandboxOpen(false);
  };

  if (!isSandboxOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div>
            <h2 className="text-lg font-semibold text-white">Workflow Sandbox</h2>
            <p className="text-xs text-slate-400 mt-0.5">Test and validate your workflow</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700">
          <button
            onClick={handleSimulate}
            disabled={isSimulating || nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Simulation
          </button>
          <button
            onClick={handleValidate}
            disabled={nodes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Validate Only
          </button>
          <div className="ml-auto text-xs text-slate-400">
            {nodes.length} nodes • {edges.length} connections
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'simulation'
                ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Simulation Results
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === 'validation'
                ? 'text-white border-b-2 border-indigo-500 bg-slate-800/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Validation
            {validationErrors.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-rose-500/20 text-rose-300 rounded">
                {validationErrors.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto">
          {activeTab === 'simulation' && (
            <div className="p-6 space-y-4">
              {isSimulating && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Running simulation...</p>
                  </div>
                </div>
              )}

              {!isSimulating && !simulationResult && (
                <div className="text-center py-12">
                  <Play className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">
                    Click &quot;Run Simulation&quot; to test your workflow
                  </p>
                </div>
              )}

              {!isSimulating && simulationResult && (
                <>
                  {/* Summary */}
                  <div
                    className={`p-4 rounded-lg border ${
                      simulationResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {simulationResult.success ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-rose-400" />
                      )}
                      <div>
                        <p className={`font-medium ${simulationResult.success ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {simulationResult.success ? 'Simulation Successful' : 'Simulation Failed'}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {simulationResult.steps.length} steps • {simulationResult.totalDuration}ms total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Steps Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Execution Log</h4>
                    <div className="space-y-1">
                      {simulationResult.steps.map((step, index) => {
                        const isFailed = step.status === 'failed';
                        const isLastStep = index === simulationResult.steps.length - 1;
                        
                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                              isFailed
                                ? 'bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/20'
                                : 'bg-slate-800/50 border-slate-700/50'
                            }`}
                          >
                            {/* Step Number & Icon */}
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-xs font-mono ${isFailed ? 'text-rose-400' : 'text-slate-500'}`}>
                                #{index + 1}
                              </span>
                              <div className="mt-0.5">{getStepIcon(step.status)}</div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium truncate ${isFailed ? 'text-rose-300' : 'text-white'}`}>
                                  {step.nodeName}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 text-xs rounded border ${getNodeTypeColor(
                                    step.nodeType
                                  )}`}
                                >
                                  {step.nodeType}
                                </span>
                                {isFailed && (
                                  <span className="px-1.5 py-0.5 text-xs bg-rose-500/30 text-rose-300 rounded font-medium animate-pulse">
                                    FAILED
                                  </span>
                                )}
                              </div>
                              
                              {/* Message */}
                              <p className={`text-xs mt-1 ${isFailed ? 'text-rose-300/90' : 'text-slate-400'}`}>
                                {step.message}
                              </p>
                              
                              {/* Duration */}
                              {step.duration && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Duration: {step.duration}ms
                                </p>
                              )}
                              
                              {/* Recovery suggestion for failed steps */}
                              {isFailed && (
                                <div className="mt-3 p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/50">
                                  <p className="text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Recovery Suggestion
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {getRecoverySuggestion(step.nodeType)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Show remaining nodes that weren't executed */}
                      {!simulationResult.success && simulationResult.steps.length < nodes.length && (
                        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-dashed border-slate-700">
                          <p className="text-xs text-slate-500 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {nodes.length - simulationResult.steps.length} remaining step(s) were not executed due to failure
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="p-6 space-y-4">
              {validationErrors.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-emerald-400">No Issues Found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Your workflow structure is valid
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        error.type === 'error'
                          ? 'bg-rose-500/10 border-rose-500/30'
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`}
                    >
                      {error.type === 'error' ? (
                        <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p
                          className={`text-sm ${
                            error.type === 'error' ? 'text-rose-300' : 'text-amber-300'
                          }`}
                        >
                          {error.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Code: {error.code}
                          {error.nodeId && ` • Node: ${error.nodeId.slice(0, 8)}...`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/30">
          <p className="text-xs text-slate-500 text-center">
            Simulation uses mock data • Results are for testing purposes only
          </p>
        </div>
      </div>
    </div>
  );
}

