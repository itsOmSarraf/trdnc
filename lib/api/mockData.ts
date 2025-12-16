import { AutomationAction } from '@/types/workflow';

// Mock automation actions available from "API"
export const mockAutomationActions: AutomationAction[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send an email notification to specified recipients',
    params: ['to', 'subject', 'body'],
  },
  {
    id: 'generate_doc',
    label: 'Generate Document',
    description: 'Generate a document from a template',
    params: ['template', 'recipient', 'format'],
  },
  {
    id: 'send_slack',
    label: 'Send Slack Message',
    description: 'Send a notification to a Slack channel',
    params: ['channel', 'message'],
  },
  {
    id: 'create_ticket',
    label: 'Create Ticket',
    description: 'Create a ticket in the ticketing system',
    params: ['title', 'priority', 'assignee'],
  },
  {
    id: 'update_hris',
    label: 'Update HRIS Record',
    description: 'Update employee record in HRIS',
    params: ['employeeId', 'field', 'value'],
  },
  {
    id: 'schedule_meeting',
    label: 'Schedule Meeting',
    description: 'Schedule a calendar meeting',
    params: ['title', 'attendees', 'duration'],
  },
  {
    id: 'archive_record',
    label: 'Archive Record',
    description: 'Archive a record to long-term storage',
    params: ['recordId', 'category'],
  },
  {
    id: 'trigger_webhook',
    label: 'Trigger Webhook',
    description: 'Send data to an external webhook',
    params: ['url', 'payload'],
  },
];

// Sample workflow templates
export const sampleWorkflows = {
  onboarding: {
    name: 'Employee Onboarding',
    description: 'Standard onboarding workflow for new employees',
  },
  leaveApproval: {
    name: 'Leave Approval',
    description: 'Leave request approval workflow',
  },
  documentVerification: {
    name: 'Document Verification',
    description: 'Employee document verification process',
  },
};

