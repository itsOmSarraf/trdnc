import {
  AutomationAction,
  SimulationResult,
  SimulationStep,
  Workflow,
  ValidationError,
  WorkflowNode,
  WorkflowEdge,
} from '@/types/workflow';
import { mockAutomationActions } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * GET /automations
 * Returns available automation actions
 */
export async function getAutomations(): Promise<AutomationAction[]> {
  await delay(300);
  return mockAutomationActions;
}

/**
 * Validates the workflow structure
 * Comprehensive validation including structure, node configuration, and reachability
 */
function validateWorkflow(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // ═══════════════════════════════════════════════════════════════════════════
  // STRUCTURAL VALIDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Check for empty workflow
  if (nodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow is empty - add at least a Start and End node',
      code: 'EMPTY_WORKFLOW',
    });
    return errors; // Early return - no point checking further
  }

  // Check for start node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have a Start node',
      code: 'MISSING_START',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one Start node',
      code: 'MULTIPLE_START',
    });
  }

  // Check for end node
  const endNodes = nodes.filter((n) => n.type === 'end');
  if (endNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have an End node',
      code: 'MISSING_END',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EDGE VALIDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Check for invalid edges (referencing non-existent nodes)
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.source)) {
      errors.push({
        type: 'error',
        message: `Edge "${edge.id}" references non-existent source node`,
        code: 'INVALID_EDGE_SOURCE',
      });
    }
    if (!nodeMap.has(edge.target)) {
      errors.push({
        type: 'error',
        message: `Edge "${edge.id}" references non-existent target node`,
        code: 'INVALID_EDGE_TARGET',
      });
    }
  });

  // Check for duplicate edges
  const edgeKeys = new Set<string>();
  edges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (edgeKeys.has(key)) {
      errors.push({
        type: 'warning',
        message: `Duplicate connection from "${nodeMap.get(edge.source)?.data.label}" to "${nodeMap.get(edge.target)?.data.label}"`,
        code: 'DUPLICATE_EDGE',
      });
    }
    edgeKeys.add(key);
  });

  // Check start node has outgoing connection
  if (startNodes.length === 1) {
    const startNode = startNodes[0];
    const hasOutgoing = edges.some((e) => e.source === startNode.id);
    if (!hasOutgoing) {
      errors.push({
        nodeId: startNode.id,
        type: 'warning',
        message: 'Start node has no outgoing connections',
        code: 'START_NO_CONNECTION',
      });
    }
  }

  // Check end node has incoming connection
  endNodes.forEach((endNode) => {
    const hasIncoming = edges.some((e) => e.target === endNode.id);
    if (!hasIncoming) {
      errors.push({
        nodeId: endNode.id,
        type: 'warning',
        message: 'End node has no incoming connections',
        code: 'END_NO_CONNECTION',
      });
    }
  });

  // Check for disconnected nodes (no incoming connections)
  nodes.forEach((node) => {
    if (node.type === 'start') return;
    const hasIncoming = edges.some((e) => e.target === node.id);
    if (!hasIncoming) {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `Node "${node.data.label}" has no incoming connections`,
        code: 'NODE_DISCONNECTED',
      });
    }
  });

  // Check for dead-end nodes (no outgoing connections, except End nodes)
  nodes.forEach((node) => {
    if (node.type === 'end') return;
    const hasOutgoing = edges.some((e) => e.source === node.id);
    if (!hasOutgoing) {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `Node "${node.data.label}" has no outgoing connections (dead end)`,
        code: 'DEAD_END_NODE',
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // NODE CONFIGURATION VALIDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  nodes.forEach((node) => {
    const data = node.data as any;

    // Check for missing title on all nodes
    if (!data.title || data.title.trim() === '') {
      errors.push({
        nodeId: node.id,
        type: 'warning',
        message: `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} node "${node.data.label}" has no title`,
        code: 'MISSING_TITLE',
      });
    }

    // Task-specific validations
    if (node.type === 'task') {
      if (!data.assignee || data.assignee.trim() === '') {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Task "${data.title || node.data.label}" has no assignee`,
          code: 'TASK_NO_ASSIGNEE',
        });
      }
    }

    // Approval-specific validations
    if (node.type === 'approval') {
      if (!data.approverRole || data.approverRole.trim() === '') {
        errors.push({
          nodeId: node.id,
          type: 'warning',
          message: `Approval "${data.title || node.data.label}" has no approver role`,
          code: 'APPROVAL_NO_ROLE',
        });
      }
    }

    // Automated step validations
    if (node.type === 'automated') {
      if (!data.actionId || data.actionId.trim() === '') {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: `Automated step "${data.title || node.data.label}" has no action selected`,
          code: 'AUTOMATED_NO_ACTION',
        });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // REACHABILITY VALIDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  // Check for unreachable nodes from start
  if (startNodes.length === 1) {
    const reachable = new Set<string>();
    const queue = [startNodes[0].id];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachable.has(nodeId)) continue;
      reachable.add(nodeId);
      
      edges
        .filter((e) => e.source === nodeId)
        .forEach((e) => {
          if (!reachable.has(e.target)) {
            queue.push(e.target);
          }
        });
    }

    nodes.forEach((node) => {
      if (!reachable.has(node.id) && node.type !== 'start') {
        errors.push({
          nodeId: node.id,
          type: 'error',
          message: `Node "${node.data.label}" is unreachable from Start`,
          code: 'UNREACHABLE_NODE',
        });
      }
    });
  }

  // Check if any End node is reachable from Start
  if (startNodes.length === 1 && endNodes.length > 0) {
    const reachable = new Set<string>();
    const queue = [startNodes[0].id];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (reachable.has(nodeId)) continue;
      reachable.add(nodeId);
      
      edges
        .filter((e) => e.source === nodeId)
        .forEach((e) => queue.push(e.target));
    }

    const anyEndReachable = endNodes.some((end) => reachable.has(end.id));
    if (!anyEndReachable) {
      errors.push({
        type: 'error',
        message: 'No End node is reachable from Start - workflow cannot complete',
        code: 'END_UNREACHABLE',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CYCLE DETECTION
  // ═══════════════════════════════════════════════════════════════════════════

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  let hasCycle = false;
  let cycleNodes: string[] = [];

  function detectCycle(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter((e) => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (detectCycle(edge.target, [...path, nodeId])) return true;
      } else if (recursionStack.has(edge.target)) {
        cycleNodes = [...path, nodeId, edge.target];
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (detectCycle(node.id, [])) {
        hasCycle = true;
        break;
      }
    }
  }

  if (hasCycle) {
    const cycleNodeNames = cycleNodes
      .map((id) => nodeMap.get(id)?.data.label || id)
      .join(' → ');
    errors.push({
      type: 'error',
      message: `Workflow contains a cycle: ${cycleNodeNames}`,
      code: 'CYCLE_DETECTED',
    });
  }

  return errors;
}

/**
 * Topologically sort nodes for execution order
 */
function getExecutionOrder(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const result: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes.find((n) => n.id === nodeId);
    if (node) result.push(node);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}

/**
 * POST /simulate
 * Simulates workflow execution and returns step-by-step results
 */
export async function simulateWorkflow(
  workflow: Workflow
): Promise<SimulationResult> {
  await delay(500);

  const { nodes, edges } = workflow;
  const errors = validateWorkflow(nodes, edges);

  // If there are critical errors, return early
  const criticalErrors = errors.filter((e) => e.type === 'error');
  if (criticalErrors.length > 0) {
    return {
      workflowId: workflow.id,
      success: false,
      steps: [],
      errors,
      completedAt: new Date().toISOString(),
      totalDuration: 0,
    };
  }

  // Get execution order
  const executionOrder = getExecutionOrder(nodes, edges);
  const steps: SimulationStep[] = [];
  let totalDuration = 0;

  // Simulate each step
  for (const node of executionOrder) {
    const stepDuration = Math.floor(Math.random() * 2000) + 500;
    totalDuration += stepDuration;

    await delay(100); // Small delay between steps for realism

    const step: SimulationStep = {
      nodeId: node.id,
      nodeName: node.data.label,
      nodeType: node.type,
      status: 'completed',
      message: getStepMessage(node),
      timestamp: new Date().toISOString(),
      duration: stepDuration,
    };

    // Random chance of failure for non-start/end nodes (for demo purposes)
    if (
      node.type !== 'start' &&
      node.type !== 'end' &&
      Math.random() < 0.05
    ) {
      step.status = 'failed';
      step.message = `Failed: ${getFailureMessage(node)}`;

      steps.push(step);
      return {
        workflowId: workflow.id,
        success: false,
        steps,
        errors,
        completedAt: new Date().toISOString(),
        totalDuration,
      };
    }

    steps.push(step);
  }

  return {
    workflowId: workflow.id,
    success: true,
    steps,
    errors,
    completedAt: new Date().toISOString(),
    totalDuration,
  };
}

function getStepMessage(node: WorkflowNode): string {
  switch (node.type) {
    case 'start':
      return `Workflow started: ${node.data.title || 'Untitled'}`;
    case 'task':
      return `Task "${node.data.title}" assigned to ${
        (node.data as any).assignee || 'Unassigned'
      }`;
    case 'approval':
      return `Approval requested from ${
        (node.data as any).approverRole || 'Manager'
      }`;
    case 'automated':
      return `Automated action executed: ${
        (node.data as any).actionId || 'Unknown action'
      }`;
    case 'end':
      return `Workflow completed: ${
        (node.data as any).endMessage || 'Process finished'
      }`;
    default:
      return 'Step completed';
  }
}

function getFailureMessage(node: WorkflowNode): string {
  switch (node.type) {
    case 'task':
      return 'Task could not be assigned - assignee not found';
    case 'approval':
      return 'Approval request timed out';
    case 'automated':
      return 'Automation service unavailable';
    default:
      return 'Unknown error occurred';
  }
}

/**
 * Validate workflow without full simulation
 */
export async function validateWorkflowAPI(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Promise<ValidationError[]> {
  await delay(200);
  return validateWorkflow(nodes, edges);
}

