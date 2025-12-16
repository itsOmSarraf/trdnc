# HR Workflow Designer

A visual drag-and-drop workflow designer for HR processes built with **React**, **Next.js 15**, and **React Flow**. Design, configure, and test internal workflows such as onboarding, leave approval, or document verification.

![HR Workflow Designer](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![React Flow](https://img.shields.io/badge/React_Flow-12-FF0072)

## ✨ Features

### Workflow Canvas
- **Drag-and-drop** node placement from sidebar
- **Visual node connections** with animated edges
- **Snap-to-grid** for clean layouts
- **MiniMap** for navigation on large workflows
- **Zoom controls** and pan navigation

### Node Types
| Node | Purpose | Color |
|------|---------|-------|
| 🟢 **Start** | Workflow entry point | Emerald |
| 🔵 **Task** | Human task (e.g., collect documents) | Blue |
| 🟠 **Approval** | Manager/HR approval step | Amber |
| 🟣 **Automated** | System actions (email, generate PDF) | Purple |
| 🔴 **End** | Workflow completion | Rose |

### Node Configuration Forms
Each node type has a dedicated configuration panel with:
- **Start Node**: Title, metadata key-value pairs
- **Task Node**: Title, description, assignee, due date, custom fields
- **Approval Node**: Title, approver role selection, auto-approve threshold
- **Automated Step Node**: Dynamic action selection from mock API, configurable parameters
- **End Node**: Completion message, summary toggle

### Mock API Integration
- `GET /automations` - Fetch available automation actions
- `POST /simulate` - Execute workflow simulation

### Workflow Testing Sandbox
- **Validation** - Check for structural issues (missing start/end, cycles, disconnected nodes)
- **Simulation** - Step-by-step execution with timing and status
- **Error reporting** - Visual feedback for validation errors

### Import/Export
- Export workflows as JSON files
- Import existing workflow definitions

## 🏗️ Architecture

```
/app
  page.tsx           # Main workflow designer page
  layout.tsx         # Root layout with fonts
  globals.css        # Global styles and React Flow customizations

/components
  /canvas
    WorkflowCanvas.tsx   # React Flow canvas wrapper
    NodeSidebar.tsx      # Draggable node type list
    Toolbar.tsx          # Top toolbar with actions
  /nodes
    StartNode.tsx        # Start node component
    TaskNode.tsx         # Task node component
    ApprovalNode.tsx     # Approval node component
    AutomatedStepNode.tsx # Automated step component
    EndNode.tsx          # End node component
    index.ts             # Node type registry
  /forms
    NodeFormPanel.tsx    # Right panel container
    StartNodeForm.tsx    # Start node configuration
    TaskNodeForm.tsx     # Task node configuration
    ApprovalNodeForm.tsx # Approval node configuration
    AutomatedStepNodeForm.tsx # Automated step configuration
    EndNodeForm.tsx      # End node configuration
    KeyValueEditor.tsx   # Reusable key-value input
  /sandbox
    SandboxPanel.tsx     # Testing/simulation modal

/store
  workflowStore.ts     # Zustand state management

/lib
  /api
    mockApi.ts         # Mock API functions
    mockData.ts        # Sample automation actions

/types
  workflow.ts          # TypeScript interfaces
```

## 🎨 Design Decisions

### State Management
**Zustand** was chosen over Context API for:
- Simpler API with less boilerplate
- Better performance with selective subscriptions
- Easy persistence and middleware support
- No provider wrapping needed

### Component Architecture
- **Colocation**: Forms are kept separate from nodes for separation of concerns
- **Composition**: KeyValueEditor is a reusable component for metadata and custom fields
- **Memoization**: Node components use `React.memo` to prevent unnecessary re-renders

### Type Safety
- Full TypeScript coverage with strict mode
- Discriminated unions for node data types
- Proper typing for React Flow nodes and edges

### Styling
- **Tailwind CSS v4** for utility-first styling
- Custom gradients for node type differentiation
- Dark theme optimized for long work sessions
- Smooth animations for professional UX

### Mock API Design
- Simulated network delays for realistic behavior
- Topological sort for proper execution order
- Comprehensive validation with error codes
- Random failure injection for testing edge cases

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trdnc

# Install dependencies
bun install
# or
npm install

# Start development server
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the designer.

## 📖 Usage Guide

### Creating a Workflow

1. **Drag nodes** from the left sidebar onto the canvas
2. **Connect nodes** by dragging from output handles (right) to input handles (left)
3. **Configure nodes** by clicking on them to open the right panel
4. **Test your workflow** using the "Test Workflow" button

### Node Connection Rules
- Start nodes only have output handles
- End nodes only have input handles
- Other nodes have both input and output handles
- Multiple connections are supported

### Testing Workflows
1. Click **"Test Workflow"** in the toolbar
2. Click **"Run Simulation"** to execute
3. View step-by-step execution in the results
4. Check the **Validation** tab for structural issues

### Exporting/Importing
- **Export**: Click the Export button to download JSON
- **Import**: Click Import and paste valid workflow JSON

## 🧪 Sample Workflow JSON

```json
{
  "name": "Employee Onboarding",
  "description": "Standard onboarding workflow",
  "nodes": [
    {
      "id": "node-1",
      "type": "start",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Start",
        "type": "start",
        "title": "Begin Onboarding",
        "metadata": []
      }
    },
    {
      "id": "node-2",
      "type": "task",
      "position": { "x": 350, "y": 200 },
      "data": {
        "label": "Task",
        "type": "task",
        "title": "Collect Documents",
        "description": "Gather all required onboarding documents",
        "assignee": "HR Coordinator",
        "dueDate": "",
        "customFields": []
      }
    },
    {
      "id": "node-3",
      "type": "end",
      "position": { "x": 600, "y": 200 },
      "data": {
        "label": "End",
        "type": "end",
        "endMessage": "Onboarding Complete",
        "showSummary": true
      }
    }
  ],
  "edges": [
    { "id": "edge-1", "source": "node-1", "target": "node-2" },
    { "id": "edge-2", "source": "node-2", "target": "node-3" }
  ]
}
```

## ⏱️ What I Completed

- ✅ React Flow canvas with drag-and-drop
- ✅ 5 custom node types with unique styling
- ✅ Node configuration forms with validation
- ✅ Mock API for automations and simulation
- ✅ Workflow sandbox with execution log
- ✅ Graph validation (cycles, connectivity)
- ✅ Import/Export functionality
- ✅ MiniMap and zoom controls
- ✅ Modern dark theme UI
- ✅ TypeScript throughout
- ✅ Zustand state management

## 🔮 Future Enhancements

Given more time, I would add:

- **Undo/Redo** - Using Zustand temporal middleware
- **Auto-layout** - Automatic node arrangement using dagre
- **Conditional branches** - Fork/merge nodes for decision logic
- **Node templates** - Pre-configured node presets
- **Workflow versioning** - Track changes over time
- **Collaborative editing** - Real-time multi-user support
- **API persistence** - Save workflows to backend
- **Keyboard shortcuts** - Power user features
- **Accessibility** - Full ARIA support
- **Mobile support** - Responsive touch interface

## 📦 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [React 19](https://react.dev/) | UI library |
| [React Flow 12](https://reactflow.dev/) | Node-based graph editor |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Lucide React](https://lucide.dev/) | Icon library |

## 📄 License

MIT License - feel free to use this for any purpose.

---

Built with ❤️ for HR teams everywhere
