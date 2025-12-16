// Core workflow types and interfaces

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface KeyValuePair {
  key: string;
  value: string;
}

// Base node data interface
// Index signature makes it compatible with React Flow's Record<string, unknown>
export interface BaseNodeData {
  label: string;
  type: NodeType;
  [key: string]: unknown;
}

// Start Node Data
export interface StartNodeData extends BaseNodeData {
  type: 'start';
  title: string;
  metadata: KeyValuePair[];
}

// Task Node Data
export interface TaskNodeData extends BaseNodeData {
  type: 'task';
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields: KeyValuePair[];
}

// Approval Node Data
export interface ApprovalNodeData extends BaseNodeData {
  type: 'approval';
  title: string;
  approverRole: 'Manager' | 'HRBP' | 'Director' | string;
  autoApproveThreshold: number;
}

// Automated Step Node Data
export interface AutomatedStepNodeData extends BaseNodeData {
  type: 'automated';
  title: string;
  actionId: string;
  actionParams: Record<string, string>;
}

// End Node Data
export interface EndNodeData extends BaseNodeData {
  type: 'end';
  endMessage: string;
  showSummary: boolean;
}

// Union type for all node data
export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomatedStepNodeData
  | EndNodeData;

// Workflow Node (extends React Flow Node)
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

// Workflow Edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  animated?: boolean;
  label?: string;
}

// Complete Workflow
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

// Automation Action from API
export interface AutomationAction {
  id: string;
  label: string;
  description?: string;
  params: string[];
}

// Simulation Result
export interface SimulationStep {
  nodeId: string;
  nodeName: string;
  nodeType: NodeType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
  duration?: number;
}

export interface SimulationResult {
  workflowId: string;
  success: boolean;
  steps: SimulationStep[];
  errors: ValidationError[];
  completedAt: string;
  totalDuration: number;
}

// Validation
export interface ValidationError {
  nodeId?: string;
  type: 'error' | 'warning';
  message: string;
  code: string;
}

// Drag and Drop
export interface DragItem {
  type: NodeType;
  label: string;
}

