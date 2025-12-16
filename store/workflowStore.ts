import { create } from 'zustand';
import { temporal } from 'zundo';
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
import dagre from 'dagre';

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

// Auto-layout function using dagre
function getLayoutedElements(
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100,
        y: nodeWithPosition.y - 50,
      },
    };
  });
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
  
  // Auto-layout
  autoLayout: (direction?: 'LR' | 'TB') => void;
  
  // Templates
  loadTemplate: (templateId: string) => void;
}

// Workflow templates
const workflowTemplates: Record<string, { name: string; nodes: Node<WorkflowNodeData>[]; edges: Edge[] }> = {
  onboarding: {
    name: 'Employee Onboarding',
    nodes: [
      { id: 'tpl-start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', type: 'start', title: 'Begin Onboarding', metadata: [] } as StartNodeData },
      { id: 'tpl-task1', type: 'task', position: { x: 280, y: 200 }, data: { label: 'Task', type: 'task', title: 'Collect Documents', description: 'Gather required documents from new employee', assignee: 'HR Coordinator', dueDate: '', customFields: [] } as TaskNodeData },
      { id: 'tpl-approval', type: 'approval', position: { x: 510, y: 200 }, data: { label: 'Approval', type: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } as ApprovalNodeData },
      { id: 'tpl-auto', type: 'automated', position: { x: 740, y: 200 }, data: { label: 'Automated', type: 'automated', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Welcome to the team!' } } as AutomatedStepNodeData },
      { id: 'tpl-end', type: 'end', position: { x: 970, y: 200 }, data: { label: 'End', type: 'end', endMessage: 'Onboarding Complete', showSummary: true } as EndNodeData },
    ],
    edges: [
      { id: 'tpl-e1', type: 'deletable', source: 'tpl-start', target: 'tpl-task1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e2', type: 'deletable', source: 'tpl-task1', target: 'tpl-approval', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e3', type: 'deletable', source: 'tpl-approval', target: 'tpl-auto', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e4', type: 'deletable', source: 'tpl-auto', target: 'tpl-end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  },
  leaveApproval: {
    name: 'Leave Approval',
    nodes: [
      { id: 'tpl-start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', type: 'start', title: 'Leave Request', metadata: [] } as StartNodeData },
      { id: 'tpl-approval1', type: 'approval', position: { x: 280, y: 200 }, data: { label: 'Approval', type: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 3 } as ApprovalNodeData },
      { id: 'tpl-approval2', type: 'approval', position: { x: 510, y: 200 }, data: { label: 'Approval', type: 'approval', title: 'HR Review', approverRole: 'HRBP', autoApproveThreshold: 0 } as ApprovalNodeData },
      { id: 'tpl-auto', type: 'automated', position: { x: 740, y: 200 }, data: { label: 'Automated', type: 'automated', title: 'Update Calendar', actionId: 'schedule_meeting', actionParams: {} } as AutomatedStepNodeData },
      { id: 'tpl-end', type: 'end', position: { x: 970, y: 200 }, data: { label: 'End', type: 'end', endMessage: 'Leave Approved', showSummary: true } as EndNodeData },
    ],
    edges: [
      { id: 'tpl-e1', type: 'deletable', source: 'tpl-start', target: 'tpl-approval1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e2', type: 'deletable', source: 'tpl-approval1', target: 'tpl-approval2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e3', type: 'deletable', source: 'tpl-approval2', target: 'tpl-auto', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e4', type: 'deletable', source: 'tpl-auto', target: 'tpl-end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  },
  documentVerification: {
    name: 'Document Verification',
    nodes: [
      { id: 'tpl-start', type: 'start', position: { x: 50, y: 200 }, data: { label: 'Start', type: 'start', title: 'Document Submitted', metadata: [] } as StartNodeData },
      { id: 'tpl-task1', type: 'task', position: { x: 280, y: 200 }, data: { label: 'Task', type: 'task', title: 'Initial Review', description: 'Check document completeness', assignee: 'Document Specialist', dueDate: '', customFields: [] } as TaskNodeData },
      { id: 'tpl-task2', type: 'task', position: { x: 510, y: 200 }, data: { label: 'Task', type: 'task', title: 'Verify Authenticity', description: 'Verify document authenticity', assignee: 'Compliance Officer', dueDate: '', customFields: [] } as TaskNodeData },
      { id: 'tpl-auto', type: 'automated', position: { x: 740, y: 200 }, data: { label: 'Automated', type: 'automated', title: 'Archive Document', actionId: 'archive_record', actionParams: {} } as AutomatedStepNodeData },
      { id: 'tpl-end', type: 'end', position: { x: 970, y: 200 }, data: { label: 'End', type: 'end', endMessage: 'Verification Complete', showSummary: true } as EndNodeData },
    ],
    edges: [
      { id: 'tpl-e1', type: 'deletable', source: 'tpl-start', target: 'tpl-task1', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e2', type: 'deletable', source: 'tpl-task1', target: 'tpl-task2', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e3', type: 'deletable', source: 'tpl-task2', target: 'tpl-auto', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'tpl-e4', type: 'deletable', source: 'tpl-auto', target: 'tpl-end', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  },
};

export { workflowTemplates };

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
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
  
  // Auto-layout using dagre
  autoLayout: (direction = 'LR') => {
    const state = get();
    if (state.nodes.length === 0) return;
    
    const layoutedNodes = getLayoutedElements(state.nodes, state.edges, direction);
    set({ nodes: layoutedNodes });
  },
  
  // Load workflow template
  loadTemplate: (templateId) => {
    const template = workflowTemplates[templateId];
    if (!template) return;
    
    // Generate new IDs to avoid conflicts
    const idMap = new Map<string, string>();
    
    const newNodes = template.nodes.map((node) => {
      const newId = `node-${uuidv4()}`;
      idMap.set(node.id, newId);
      return { ...node, id: newId };
    });
    
    const newEdges = template.edges.map((edge) => ({
      ...edge,
      id: `edge-${uuidv4()}`,
      source: idMap.get(edge.source) || edge.source,
      target: idMap.get(edge.target) || edge.target,
    }));
    
    set({
      nodes: newNodes,
      edges: newEdges,
      workflowName: template.name,
      workflowDescription: `Template: ${template.name}`,
      selectedNodeId: null,
      isPanelOpen: false,
      simulationResult: null,
      validationErrors: [],
    });
  },
    }),
    {
      // Only track nodes and edges for undo/redo
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      limit: 50, // Keep 50 history states
    }
  )
);

// Selector hooks for optimized re-renders
export const useSelectedNode = () => {
  const nodes = useWorkflowStore((state) => state.nodes);
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  return nodes.find((n) => n.id === selectedNodeId);
};


