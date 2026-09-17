import React, { useState, useEffect, useRef } from 'react';
import { PresentationSettingsPanel } from './PresentationSettingsPanel';
import type { PresentationLayoutConfig, WorkspaceState, PdfDocument, LayoutMode } from '../types';
import { Workspace } from './Workspace';

interface PresentationStudioProps {
  ws1: WorkspaceState;
  ws2: WorkspaceState;
  updateWs1: (updates: Partial<WorkspaceState>) => void;
  updateWs2: (updates: Partial<WorkspaceState>) => void;
  pdfs: PdfDocument[];
  onExit: () => void;
}

const DEFAULT_CONFIG: PresentationLayoutConfig = {
  canvasWidth: 'auto',
  canvasHeight: 'auto',
  zoomLevel: 1,
  alignX: 'center',
  alignY: 'center',
  padding: 16,
  showSidebar: false,
  showToolbar: true,
  showStudentPanel: false,
  showHeader: false,
  contentMode: 'single',
};

export function PresentationStudio({ ws1, ws2, updateWs1, updateWs2, pdfs, onExit }: PresentationStudioProps) {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [config, setConfig] = useState<PresentationLayoutConfig>(() => {
    const saved = localStorage.getItem('quran-presentation-layout');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const updateConfig = (updates: Partial<PresentationLayoutConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    localStorage.setItem('quran-presentation-layout', JSON.stringify(config));
    alert('Presentation layout saved successfully!');
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
  };

  // Convert the studio's logical content mode to what the Workspace needs
  // We can force the workspace state locally if needed, but since we are wrapping,
  // we can just render the right things.
  
  let layoutMode: LayoutMode = 'single';
  let overrideWs1 = { ...ws1 };
  
  if (config.contentMode === 'dual') {
    layoutMode = 'split';
  } else if (config.contentMode === 'pdf') {
    layoutMode = 'single';
    // If not a PDF, default to the first one
    if (!overrideWs1.activePdfId || overrideWs1.activePdfId === 'quiz' || overrideWs1.activePdfId === 'blank') {
      overrideWs1.activePdfId = pdfs[0]?.id || null;
    }
  } else if (config.contentMode === 'whiteboard') {
    layoutMode = 'single';
    overrideWs1.activePdfId = 'blank';
  } else if (config.contentMode === 'quran') {
    layoutMode = 'single';
    overrideWs1.activePdfId = null;
  }

  // Alignment classes
  const getAlignX = () => {
    switch (config.alignX) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      case 'center':
      default: return 'justify-center';
    }
  };

  const getAlignY = () => {
    switch (config.alignY) {
      case 'top': return 'items-start';
      case 'bottom': return 'items-end';
      case 'center':
      default: return 'items-center';
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-brand-text overflow-hidden font-sans">
      
      {/* The main studio area where the canvas lives */}
      <div 
        className={`flex-1 overflow-auto relative flex ${getAlignX()} ${getAlignY()} transition-all duration-300 ease-in-out`} 
        style={{ padding: `${config.padding}px` }}
      >
        
        {/* The Teaching Canvas Wrapper */}
        <div 
          className="relative bg-[#F8F9FA] rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-700/50 transition-all duration-300 ease-in-out"
          style={{
            width: isPanelCollapsed || config.canvasWidth === 'auto' ? '100%' : `${config.canvasWidth}px`,
            height: isPanelCollapsed || config.canvasHeight === 'auto' ? '100%' : `${config.canvasHeight}px`,
            transform: isPanelCollapsed ? 'scale(1)' : `scale(${config.zoomLevel})`,
            transformOrigin: `${config.alignX} ${config.alignY}`, // e.g., 'center center'
            resize: isPanelCollapsed ? 'none' : 'both',
            overflow: 'hidden',
            minWidth: '400px',
            minHeight: '300px'
          }}
        >
          {/* Internal Application Structure tailored for Presentation */}
          <div className="flex flex-col h-full w-full">
            <div className={`flex-1 flex flex-row overflow-hidden relative`}>
               {/* Workspace 1 */}
               {(layoutMode === 'single' || layoutMode === 'split' || layoutMode === 'focus-1') && (
                <div key={overrideWs1.id} className={`${layoutMode === 'split' ? 'w-1/2 border-r-2 border-brand-dark-green' : 'w-full'} flex-shrink-0 flex`}>
                  <Workspace 
                    workspace={overrideWs1} 
                    updateWorkspace={updateWs1} 
                    pdfs={pdfs} 
                    isPresentationMode={true} 
                    hideToolbar={!config.showToolbar}
                    hideHeader={!config.showHeader}
                    hideStudentPanel={!config.showStudentPanel}
                  />
                </div>
              )}
              
              {/* Workspace 2 */}
              {(layoutMode === 'split' || layoutMode === 'focus-2') && (
                <div key={ws2.id} className={`${layoutMode === 'split' ? 'w-1/2' : 'w-full'} flex-shrink-0 flex`}>
                  <Workspace 
                    workspace={ws2} 
                    updateWorkspace={updateWs2} 
                    pdfs={pdfs} 
                    isPresentationMode={true} 
                    hideToolbar={!config.showToolbar}
                    hideHeader={!config.showHeader}
                    hideStudentPanel={!config.showStudentPanel}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Expand Button (Visible when panel is collapsed) */}
        {isPanelCollapsed && (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="absolute top-4 right-4 bg-brand-dark-green text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 z-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            <span className="text-xs font-bold px-1">Settings</span>
          </button>
        )}
      </div>

      {/* Settings Panel */}
      <div 
        className={`transition-all duration-300 ease-in-out border-l border-gray-800 ${isPanelCollapsed ? 'w-0 overflow-hidden border-none opacity-0' : 'w-80 opacity-100 shrink-0'}`}
      >
        <PresentationSettingsPanel 
          config={config} 
          updateConfig={updateConfig} 
          onSave={handleSave}
          onReset={handleReset}
          onExit={onExit}
          onCollapse={() => setIsPanelCollapsed(true)}
        />
      </div>
    </div>
  );
}
