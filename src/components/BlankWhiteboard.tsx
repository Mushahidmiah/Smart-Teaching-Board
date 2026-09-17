import React, { useRef, useState, useEffect } from 'react';
import { DrawingOverlay } from './DrawingOverlay';
import type { WorkspaceState } from '../types';

interface BlankWhiteboardProps {
  workspace: WorkspaceState;
  updateWorkspace?: (updates: Partial<WorkspaceState>) => void;
  isPresentationMode?: boolean;
}

export function BlankWhiteboard({ workspace, updateWorkspace, isPresentationMode = false }: BlankWhiteboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`flex-1 overflow-hidden relative ${isPresentationMode ? 'bg-black' : 'bg-[#F8F9FA]'}`}
    >
      {dimensions.width > 0 && (
        <div className="absolute inset-4 rounded-xl overflow-hidden bg-white shadow-xl border border-gray-200">
          <DrawingOverlay 
            width={dimensions.width - 32} // Account for inset-4 (16px * 2)
            height={dimensions.height - 32} 
            activeTool={workspace.activeTool} 
            pageIndex={0}
            resetKey={workspace.resetDrawings}
            brushSize={workspace.brushSize}
            textSize={workspace.textSize}
            highlighterOpacity={workspace.highlighterOpacity}
            undoTrigger={workspace.undoTrigger}
            redoTrigger={workspace.redoTrigger}
            drawingColor={workspace.drawingColor}
            fillColor={workspace.fillColor}
            fillType={workspace.fillType}
            isRounded={workspace.isRounded}
            focusMode={workspace.focusMode}
            focusSpeed={workspace.focusSpeed}
            onFocusRegion={updateWorkspace ? (rect) => {
              if (workspace.focusMode === 'zoom') {
                updateWorkspace({ currentFocus: rect });
              }
            } : undefined}
          />
        </div>
      )}
    </div>
  );
}
