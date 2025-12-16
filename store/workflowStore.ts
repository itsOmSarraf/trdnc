import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  WorkflowNodeData,
  StartNodeData,
  TaskNodeData,
  ApprovalNodeData,
  AutomatedStepNodeData,
  EndNodeData,
  SimulationResult,
  ValidationError,
} from '@/types/workflow';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';

// Default node data factories
export function createDefaultNodeData(type: NodeType): WorkflowNodeData {
  switch (type) {
    case 'start':
      return {
        label: 'Start',
        type: 'start',
        title: 'Workflow Start',
        metadata: [],
      } as StartNodeData;
    case 'task':
      return {
        label: 'Task',
        type: 'task',
        title: 'New Task',
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      } as TaskNodeData;
    case 'approval':
      return {
        label: 'Approval',
        type: 'approval',
        title: 'Approval Required',
        approverRole: 'Manager',
        autoApproveThreshold: 0,
      } as ApprovalNodeData;
    case 'automated':
      return {
        label: 'Automated',
        type: 'automated',
        title: 'Automated Step',
        actionId: '',
        actionParams: {},
      } as AutomatedStepNodeData;
    case 'end':
      return {
        label: 'End',
        type: 'end',
        endMessage: 'Workflow completed',
        showSummary: true,
      } as EndNodeData;
  }
}

interface WorkflowState {
  // Workflow data
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
  workflowName: string;
  workflowDescription: string;
  
  // UI state
  selectedNodeId: string | null;
  isPanelOpen: boolean;
  isSandboxOpen: boolean;
  
  // Simulation state
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  validationErrors: ValidationError[];
  
  // Actions
  setNodes: (nodes: Node<WorkflowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<Node<WorkflowNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  
  selectNode: (nodeId: string | null) => void;
  setIsPanelOpen: (open: boolean) => void;
  setIsSandboxOpen: (open: boolean) => void;
  
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;
  
  setSimulationResult: (result: SimulationResult | null) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  
  // Serialization
  exportWorkflow: () => string;
  importWorkflow: (json: string) => boolean;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  workflowName: 'Untitled Workflow',
  workflowDescription: '',
  selectedNodeId: null,
  isPanelOpen: false,
  isSandboxOpen: false,
  simulationResult: null,
  isSimulating: false,
  validationErrors: [],
  
  // Node and edge management
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  
  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge: Edge = {
      id: `edge-${uuidv4()}`,
      type: 'deletable',
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
  },
  
  addNode: (type, position) => {
    const newNode: Node<WorkflowNodeData> = {
      id: `node-${uuidv4()}`,
      type,
      position,
      data: createDefaultNodeData(type),
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
      selectedNodeId: newNode.id,
      isPanelOpen: true,
    }));
  },
  
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as WorkflowNodeData }
          : node
      ),
    }));
  },
  
  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      isPanelOpen: state.selectedNodeId === nodeId ? false : state.isPanelOpen,
    }));
  },
  
  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
  },
  
  // UI state
  selectNode: (nodeId) => {
    set({
      selectedNodeId: nodeId,
      isPanelOpen: nodeId !== null,
    });
  },
  
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  setIsSandboxOpen: (open) => set({ isSandboxOpen: open }),
  
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  
  // Simulation state
  setSimulationResult: (result) => set({ simulationResult: result }),
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  
  // Serialization
  exportWorkflow: () => {
    const state = get();
    const workflow = {
      id: uuidv4(),
      name: state.workflowName,
      description: state.workflowDescription,
      nodes: state.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      })),
      edges: state.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return JSON.stringify(workflow, null, 2);
  },
  
  importWorkflow: (json) => {
    try {
      const workflow = JSON.parse(json);
      
      if (!workflow.nodes || !workflow.edges) {
        return false;
      }
      
      const nodes: Node<WorkflowNodeData>[] = workflow.nodes.map((n: any) => ({
        id: n.id,
        type: n.type || n.data?.type,
        position: n.position,
        data: n.data,
      }));
      
      const edges: Edge[] = workflow.edges.map((e: any) => ({
        id: e.id,
        type: 'deletable',
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      }));
      
      set({
        nodes,
        edges,
        workflowName: workflow.name || 'Imported Workflow',
        workflowDescription: workflow.description || '',
        selectedNodeId: null,
        isPanelOpen: false,
      });
      
      return true;
    } catch {
      return false;
    }
  },
  
  clearWorkflow: () => {
    set({
      nodes: [],
      edges: [],
      workflowName: 'Untitled Workflow',
      workflowDescription: '',
      selectedNodeId: null,
      isPanelOpen: false,
      simulationResult: null,
      validationErrors: [],
    });
  },
}));

// Selector hooks for optimized re-renders
export const useSelectedNode = () => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  return nodes.find((n) => n.id === selectedNodeId);
};

