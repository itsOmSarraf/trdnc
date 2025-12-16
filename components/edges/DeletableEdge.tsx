'use client';

import { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';
import { X } from 'lucide-react';

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        stroke="transparent"
        className="react-flow__edge-interaction"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isHovered ? '#818cf8' : '#6366f1',
          strokeWidth: isHovered ? 3 : 2,
          strokeDasharray: '5,5',
        }}
        className="animated-edge"
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={onEdgeClick}
            className={`
              flex items-center justify-center w-6 h-6 
              bg-slate-800 hover:bg-rose-500 
              border border-slate-600 hover:border-rose-500 
              rounded-full shadow-lg 
              transition-all duration-200 
              hover:scale-110
              ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
            `}
            title="Delete connection"
          >
            <X className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
