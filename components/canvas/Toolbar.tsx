'use client';

import { useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import {
  Play,
  Download,
  Upload,
  Trash2,
  FileJson,
  Settings,
  X,
} from 'lucide-react';

export function Toolbar() {
  const workflowName = useWorkflowStore((state) => state.workflowName);
  const workflowDescription = useWorkflowStore((state) => state.workflowDescription);
  const setWorkflowName = useWorkflowStore((state) => state.setWorkflowName);
  const setWorkflowDescription = useWorkflowStore((state) => state.setWorkflowDescription);
  const setIsSandboxOpen = useWorkflowStore((state) => state.setIsSandboxOpen);
  const exportWorkflow = useWorkflowStore((state) => state.exportWorkflow);
  const importWorkflow = useWorkflowStore((state) => state.importWorkflow);
  const clearWorkflow = useWorkflowStore((state) => state.clearWorkflow);
  const nodes = useWorkflowStore((state) => state.nodes);

  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const json = exportWorkflow();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}-workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    const success = importWorkflow(importJson);
    if (success) {
      setShowImport(false);
      setImportJson('');
    } else {
      setImportError('Invalid workflow JSON format');
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the entire workflow? This cannot be undone.')) {
      clearWorkflow();
    }
  };

  return (
    <>
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-lg">
        {/* Left: Workflow Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileJson className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">{workflowName}</h1>
              <p className="text-xs text-slate-400">
                {nodes.length} node{nodes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
            title="Workflow settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 text-sm rounded-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-700 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleClear}
            disabled={nodes.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-rose-400 hover:bg-rose-400/10 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button
            onClick={() => setIsSandboxOpen(true)}
            disabled={nodes.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span>Test Workflow</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Workflow Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Workflow Name</label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Enter workflow description"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Import Workflow</h2>
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportJson('');
                  setImportError('');
                }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Paste Workflow JSON
                </label>
                <textarea
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value);
                    setImportError('');
                  }}
                  placeholder='{"name": "My Workflow", "nodes": [...], "edges": [...]}'
                  rows={10}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none"
                />
                {importError && (
                  <p className="text-sm text-rose-400">{importError}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImport(false);
                  setImportJson('');
                  setImportError('');
                }}
                className="px-4 py-2 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

