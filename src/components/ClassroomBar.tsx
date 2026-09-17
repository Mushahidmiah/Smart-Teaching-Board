import React from 'react';
import { Users, SplitSquareHorizontal, UserSquare2, Maximize, UserPlus, UserMinus, ArrowLeftRight } from 'lucide-react';
import type { LayoutMode } from '../types';

interface ClassroomBarProps {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  onSwapWorkspaces: () => void;
}

export function ClassroomBar({ layoutMode, setLayoutMode, onSwapWorkspaces }: ClassroomBarProps) {
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-4">
        <div className="text-sm font-bold text-gray-600 flex items-center gap-2 uppercase tracking-wider">
          <Users className="w-4 h-4" />
          Classroom Layout
        </div>
        
        <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-gray-200 shadow-sm">
          <button 
            onClick={() => setLayoutMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === 'single' ? 'bg-brand-dark-green text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <UserSquare2 className="w-4 h-4" />
            Single Student
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          
          <button 
            onClick={() => setLayoutMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === 'split' ? 'bg-brand-dark-green text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Split View (Dual)
          </button>
          
          {layoutMode !== 'single' && (
            <>
              <div className="w-px h-4 bg-gray-200 mx-1"></div>
              
              <button 
                onClick={() => setLayoutMode('focus-1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === 'focus-1' ? 'bg-brand-dark-green text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Focus Student 1
              </button>
              
              <button 
                onClick={() => setLayoutMode('focus-2')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${layoutMode === 'focus-2' ? 'bg-brand-dark-green text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Focus Student 2
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {layoutMode !== 'single' && (
          <button onClick={onSwapWorkspaces} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded text-xs font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeftRight className="w-4 h-4" /> Swap
          </button>
        )}
        {layoutMode === 'single' && (
          <button onClick={() => setLayoutMode('split')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-green-600 rounded text-xs font-medium hover:bg-green-50 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        )}
        {layoutMode !== 'single' && (
          <button 
            onClick={() => setLayoutMode('single')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-red-600 rounded text-xs font-medium hover:bg-red-50 transition-colors shadow-sm"
          >
            <UserMinus className="w-4 h-4" /> Remove Student
          </button>
        )}
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <button onClick={toggleFullScreen} className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors shadow-sm" title="Full Screen Class">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
