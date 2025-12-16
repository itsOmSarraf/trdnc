/**
 * API Test Script for HR Workflow Designer
 * Run with: bun test-api.mjs
 */

import { getAutomations, simulateWorkflow, validateWorkflowAPI } from './lib/api/mockApi.ts';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = {
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}═══ ${msg} ═══${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.yellow}→ ${msg}${colors.reset}`),
  json: (obj) => console.log(JSON.stringify(obj, null, 2)),
};

async function testGetAutomations() {
  log.title('TEST 1: GET /automations');
  
  const automations = await getAutomations();
  
  log.info(`Received ${automations.length} automation actions`);
  
  console.log('\nAvailable Automations:');
  console.table(automations.map(a => ({
    ID: a.id,
    Label: a.label,
    Params: a.params.join(', ')
  })));
  
  if (automations.length === 8) {
    log.success('GET /automations returned expected 8 actions');
  } else {
    log.error(`Expected 8 automations, got ${automations.length}`);
  }
}

async function testSimulateValidWorkflow() {
  log.title('TEST 2: POST /simulate (Valid Workflow)');
  
  const validWorkflow = {
    id: 'test-workflow-valid',
    name: 'Employee Onboarding',
    description: 'Standard onboarding process',
    nodes: [
      { id: 'start-1', type: 'start', position: { x: 0, y: 200 }, data: { label: 'Start', type: 'start', title: 'Begin Onboarding', metadata: [] } },
      { id: 'task-1', type: 'task', position: { x: 250, y: 200 }, data: { label: 'Review Documents', type: 'task', title: 'Review Documents', assignee: 'HR Manager', description: 'Review submitted documents' } },
      { id: 'approval-1', type: 'approval', position: { x: 500, y: 200 }, data: { label: 'Manager Approval', type: 'approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 5 } },
      { id: 'automated-1', type: 'automated', position: { x: 750, y: 200 }, data: { label: 'Send Welcome Email', type: 'automated', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Welcome!' } } },
      { id: 'end-1', type: 'end', position: { x: 1000, y: 200 }, data: { label: 'End', type: 'end', endMessage: 'Onboarding Complete', showSummary: true } }
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'task-1' },
      { id: 'e2', source: 'task-1', target: 'approval-1' },
      { id: 'e3', source: 'approval-1', target: 'automated-1' },
      { id: 'e4', source: 'automated-1', target: 'end-1' }
    ]
  };
  
  log.info('Sending workflow with 5 nodes and 4 edges...');
  
  const result = await simulateWorkflow(validWorkflow);
  
  console.log('\nSimulation Result:');
  console.log(`  Success: ${result.success ? colors.green + 'YES' : colors.red + 'NO'}${colors.reset}`);
  console.log(`  Steps executed: ${result.steps.length}`);
  console.log(`  Total duration: ${result.totalDuration}ms`);
  console.log(`  Errors: ${result.errors.length}`);
  
  console.log('\nExecution Steps:');
  result.steps.forEach((step, i) => {
    const status = step.status === 'completed' ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`  ${i + 1}. ${status} [${step.nodeType}] ${step.nodeName} - ${step.duration}ms`);
    console.log(`     ${step.message}`);
  });
  
  if (result.success && result.steps.length === 5) {
    log.success('Valid workflow simulation completed successfully');
  } else {
    log.error('Valid workflow simulation failed unexpectedly');
  }
}

async function testSimulateInvalidWorkflow() {
  log.title('TEST 3: POST /simulate (Invalid - Missing Start Node)');
  
  const invalidWorkflow = {
    id: 'test-workflow-invalid-1',
    name: 'Invalid Workflow',
    description: 'Missing start node',
    nodes: [
      { id: 'task-1', type: 'task', position: { x: 250, y: 200 }, data: { label: 'Task', type: 'task', title: 'Some Task' } },
      { id: 'end-1', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
    ],
    edges: [
      { id: 'e1', source: 'task-1', target: 'end-1' }
    ]
  };
  
  log.info('Sending workflow WITHOUT start node...');
  
  const result = await simulateWorkflow(invalidWorkflow);
  
  console.log('\nSimulation Result:');
  console.log(`  Success: ${result.success ? colors.green + 'YES' : colors.red + 'NO'}${colors.reset}`);
  console.log(`  Steps executed: ${result.steps.length}`);
  console.log(`  Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\nValidation Errors:');
    result.errors.forEach((err, i) => {
      const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
      console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
    });
  }
  
  const hasMissingStartError = result.errors.some(e => e.code === 'MISSING_START');
  if (!result.success && hasMissingStartError) {
    log.success('Correctly detected missing start node');
  } else {
    log.error('Failed to detect missing start node');
  }
}

async function testValidateOnly() {
  log.title('TEST 4: validateWorkflowAPI (Cycle Detection)');
  
  // Create a workflow with a cycle: A -> B -> C -> A
  const nodes = [
    { id: 'start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', type: 'start', title: 'Start' } },
    { id: 'task-1', type: 'task', position: { x: 200, y: 0 }, data: { label: 'Task A', type: 'task', title: 'Task A' } },
    { id: 'task-2', type: 'task', position: { x: 400, y: 0 }, data: { label: 'Task B', type: 'task', title: 'Task B' } },
    { id: 'end-1', type: 'end', position: { x: 600, y: 0 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
  ];
  
  const edgesWithCycle = [
    { id: 'e1', source: 'start-1', target: 'task-1' },
    { id: 'e2', source: 'task-1', target: 'task-2' },
    { id: 'e3', source: 'task-2', target: 'task-1' },  // Creates cycle!
    { id: 'e4', source: 'task-2', target: 'end-1' }
  ];
  
  log.info('Validating workflow with cycle (Task A -> Task B -> Task A)...');
  
  const errors = await validateWorkflowAPI(nodes, edgesWithCycle);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasCycleError = errors.some(e => e.code === 'CYCLE_DETECTED');
  if (hasCycleError) {
    log.success('Correctly detected cycle in workflow');
  } else {
    log.error('Failed to detect cycle');
  }
}

async function testDisconnectedNodes() {
  log.title('TEST 5: validateWorkflowAPI (Disconnected Nodes)');
  
  const nodes = [
    { id: 'start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', type: 'start', title: 'Start' } },
    { id: 'task-1', type: 'task', position: { x: 200, y: 0 }, data: { label: 'Connected Task', type: 'task', title: 'Connected', assignee: 'HR' } },
    { id: 'task-2', type: 'task', position: { x: 200, y: 200 }, data: { label: 'Disconnected Task', type: 'task', title: 'Disconnected', assignee: 'Admin' } },  // Disconnected!
    { id: 'end-1', type: 'end', position: { x: 400, y: 0 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
  ];
  
  const edges = [
    { id: 'e1', source: 'start-1', target: 'task-1' },
    { id: 'e2', source: 'task-1', target: 'end-1' }
    // Note: task-2 is not connected!
  ];
  
  log.info('Validating workflow with disconnected node...');
  
  const errors = await validateWorkflowAPI(nodes, edges);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasDisconnectedWarning = errors.some(e => e.code === 'NODE_DISCONNECTED');
  const hasUnreachableError = errors.some(e => e.code === 'UNREACHABLE_NODE');
  if (hasDisconnectedWarning || hasUnreachableError) {
    log.success('Correctly detected disconnected/unreachable node');
  } else {
    log.error('Failed to detect disconnected node');
  }
}

async function testEmptyWorkflow() {
  log.title('TEST 6: validateWorkflowAPI (Empty Workflow)');
  
  const nodes = [];
  const edges = [];
  
  log.info('Validating empty workflow...');
  
  const errors = await validateWorkflowAPI(nodes, edges);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasEmptyError = errors.some(e => e.code === 'EMPTY_WORKFLOW');
  if (hasEmptyError) {
    log.success('Correctly detected empty workflow');
  } else {
    log.error('Failed to detect empty workflow');
  }
}

async function testMissingNodeConfig() {
  log.title('TEST 7: validateWorkflowAPI (Missing Node Configuration)');
  
  const nodes = [
    { id: 'start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', type: 'start', title: '' } }, // Missing title
    { id: 'task-1', type: 'task', position: { x: 200, y: 0 }, data: { label: 'Task', type: 'task', title: 'Review', assignee: '' } }, // Missing assignee
    { id: 'approval-1', type: 'approval', position: { x: 400, y: 0 }, data: { label: 'Approval', type: 'approval', title: 'Approve', approverRole: '' } }, // Missing approver role
    { id: 'automated-1', type: 'automated', position: { x: 600, y: 0 }, data: { label: 'Automated', type: 'automated', title: 'Send', actionId: '' } }, // Missing action
    { id: 'end-1', type: 'end', position: { x: 800, y: 0 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
  ];
  
  const edges = [
    { id: 'e1', source: 'start-1', target: 'task-1' },
    { id: 'e2', source: 'task-1', target: 'approval-1' },
    { id: 'e3', source: 'approval-1', target: 'automated-1' },
    { id: 'e4', source: 'automated-1', target: 'end-1' }
  ];
  
  log.info('Validating workflow with missing node configurations...');
  
  const errors = await validateWorkflowAPI(nodes, edges);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasMissingTitle = errors.some(e => e.code === 'MISSING_TITLE');
  const hasMissingAssignee = errors.some(e => e.code === 'TASK_NO_ASSIGNEE');
  const hasMissingRole = errors.some(e => e.code === 'APPROVAL_NO_ROLE');
  const hasMissingAction = errors.some(e => e.code === 'AUTOMATED_NO_ACTION');
  
  console.log('\nConfiguration Checks:');
  console.log(`  ${hasMissingTitle ? '✓' : '✗'} MISSING_TITLE`);
  console.log(`  ${hasMissingAssignee ? '✓' : '✗'} TASK_NO_ASSIGNEE`);
  console.log(`  ${hasMissingRole ? '✓' : '✗'} APPROVAL_NO_ROLE`);
  console.log(`  ${hasMissingAction ? '✓' : '✗'} AUTOMATED_NO_ACTION`);
  
  if (hasMissingTitle && hasMissingAssignee && hasMissingRole && hasMissingAction) {
    log.success('Correctly detected all missing configurations');
  } else {
    log.error('Failed to detect some missing configurations');
  }
}

async function testDeadEndNode() {
  log.title('TEST 8: validateWorkflowAPI (Dead End Node)');
  
  const nodes = [
    { id: 'start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', type: 'start', title: 'Start' } },
    { id: 'task-1', type: 'task', position: { x: 200, y: 0 }, data: { label: 'Task', type: 'task', title: 'Task', assignee: 'HR' } }, // Dead end - no outgoing
    { id: 'end-1', type: 'end', position: { x: 400, y: 0 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
  ];
  
  const edges = [
    { id: 'e1', source: 'start-1', target: 'task-1' }
    // Missing: task-1 -> end-1
  ];
  
  log.info('Validating workflow with dead-end node...');
  
  const errors = await validateWorkflowAPI(nodes, edges);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasDeadEnd = errors.some(e => e.code === 'DEAD_END_NODE');
  const hasEndUnreachable = errors.some(e => e.code === 'END_UNREACHABLE');
  if (hasDeadEnd || hasEndUnreachable) {
    log.success('Correctly detected dead-end / unreachable end');
  } else {
    log.error('Failed to detect dead-end node');
  }
}

async function testInvalidEdge() {
  log.title('TEST 9: validateWorkflowAPI (Invalid Edge)');
  
  const nodes = [
    { id: 'start-1', type: 'start', position: { x: 0, y: 0 }, data: { label: 'Start', type: 'start', title: 'Start' } },
    { id: 'end-1', type: 'end', position: { x: 400, y: 0 }, data: { label: 'End', type: 'end', endMessage: 'Done' } }
  ];
  
  const edges = [
    { id: 'e1', source: 'start-1', target: 'non-existent-node' }, // Invalid target
    { id: 'e2', source: 'ghost-node', target: 'end-1' } // Invalid source
  ];
  
  log.info('Validating workflow with invalid edges...');
  
  const errors = await validateWorkflowAPI(nodes, edges);
  
  console.log('\nValidation Errors:');
  errors.forEach((err, i) => {
    const icon = err.type === 'error' ? colors.red + '❌' : colors.yellow + '⚠️';
    console.log(`  ${i + 1}. ${icon} [${err.code}] ${err.message}${colors.reset}`);
  });
  
  const hasInvalidSource = errors.some(e => e.code === 'INVALID_EDGE_SOURCE');
  const hasInvalidTarget = errors.some(e => e.code === 'INVALID_EDGE_TARGET');
  if (hasInvalidSource && hasInvalidTarget) {
    log.success('Correctly detected invalid edge references');
  } else {
    log.error('Failed to detect invalid edges');
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║      HR WORKFLOW DESIGNER - API TEST SUITE             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  
  await testGetAutomations();
  await testSimulateValidWorkflow();
  await testSimulateInvalidWorkflow();
  await testValidateOnly();
  await testDisconnectedNodes();
  await testEmptyWorkflow();
  await testMissingNodeConfig();
  await testDeadEndNode();
  await testInvalidEdge();
  
  console.log(`\n${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.green}ALL 9 TESTS COMPLETED!${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}═══════════════════════════════════════════════════════════${colors.reset}`);
  
  console.log(`\n${colors.bold}Available Validation Error Codes:${colors.reset}`);
  console.log(`
  ${colors.red}ERRORS (Block Simulation):${colors.reset}
  ├─ EMPTY_WORKFLOW       - No nodes in workflow
  ├─ MISSING_START        - No Start node
  ├─ MULTIPLE_START       - Multiple Start nodes  
  ├─ MISSING_END          - No End node
  ├─ INVALID_EDGE_SOURCE  - Edge references missing source
  ├─ INVALID_EDGE_TARGET  - Edge references missing target
  ├─ UNREACHABLE_NODE     - Node can't be reached from Start
  ├─ END_UNREACHABLE      - No End node reachable from Start
  ├─ CYCLE_DETECTED       - Workflow contains a loop
  └─ AUTOMATED_NO_ACTION  - Automated step has no action

  ${colors.yellow}WARNINGS (Allow Simulation):${colors.reset}
  ├─ START_NO_CONNECTION  - Start has no outgoing edge
  ├─ END_NO_CONNECTION    - End has no incoming edge
  ├─ NODE_DISCONNECTED    - Node has no incoming edge
  ├─ DEAD_END_NODE        - Node has no outgoing edge
  ├─ DUPLICATE_EDGE       - Same connection exists twice
  ├─ MISSING_TITLE        - Node has empty title
  ├─ TASK_NO_ASSIGNEE     - Task has no assignee
  └─ APPROVAL_NO_ROLE     - Approval has no role
`);
}

runAllTests();

