'use client';

import { KeyValuePair } from '@/types/workflow';
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  label: string;
  values: KeyValuePair[];
  onChange: (values: KeyValuePair[]) => void;
}

export function KeyValueEditor({ label, values, onChange }: KeyValueEditorProps) {
  const addPair = () => {
    onChange([...values, { key: '', value: '' }]);
  };

  const updatePair = (index: number, field: 'key' | 'value', newValue: string) => {
    const updated = values.map((pair, i) =>
      i === index ? { ...pair, [field]: newValue } : pair
    );
    onChange(updated);
  };

  const removePair = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <button
          type="button"
          onClick={addPair}
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Field
        </button>
      </div>

      {values.length === 0 ? (
        <p className="text-xs text-slate-500 italic py-2">No fields added</p>
      ) : (
        <div className="space-y-2">
          {values.map((pair, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Key"
                value={pair.key}
                onChange={(e) => updatePair(index, 'key', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Value"
                value={pair.value}
                onChange={(e) => updatePair(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => removePair(index)}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

