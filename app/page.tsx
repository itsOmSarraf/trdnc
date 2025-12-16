'use client';

import { NodeSidebar } from '@/components/canvas/NodeSidebar';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { Toolbar } from '@/components/canvas/Toolbar';
import { NodeFormPanel } from '@/components/forms/NodeFormPanel';
import { SandboxPanel } from '@/components/sandbox/SandboxPanel';

export default function WorkflowDesigner() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar - Node Types */}
        <NodeSidebar />

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <WorkflowCanvas />

          {/* Right Panel - Node Form */}
          <NodeFormPanel />
        </div>
        </div>

      {/* Sandbox Modal */}
      <SandboxPanel />
    </div>
  );
}
