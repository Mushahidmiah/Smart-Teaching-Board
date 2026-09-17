import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pen, Pencil, Highlighter, Circle, Square, Minus, Type, ArrowUpRight, Eraser, ZoomIn, ZoomOut, RotateCcw, Sparkles, Volume2, Maximize, GripHorizontal, ChevronDown, ChevronUp, Undo2, Redo2, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { DrawingTool, WorkspaceState } from '../types';

const tools: { id: DrawingTool; icon: React.ElementType; label: string }[] = [
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'pencil', icon: Pencil, label: 'Pencil' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

interface ToolbarProps {
  workspace: WorkspaceState;
  updateWorkspace: (updates: Partial<WorkspaceState>) => void;
  isPresentationMode?: boolean;
}

export function Toolbar({ 
  workspace,
  updateWorkspace,
  isPresentationMode = false
}: ToolbarProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUndo = () => updateWorkspace({ undoTrigger: workspace.undoTrigger + 1 });
  const handleRedo = () => updateWorkspace({ redoTrigger: workspace.redoTrigger + 1 });

  const renderSettingsPopover = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div
          ref={settingsRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`absolute z-50 p-4 rounded-xl shadow-xl w-64 ${isPresentationMode ? 'bottom-full mb-4 bg-gray-900 border border-white/10 text-white' : 'bottom-full mb-4 bg-white border border-gray-200 text-gray-800'}`}
        >
          <div className="space-y-4">
            {/* Quick Color Palette */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: '#ef4444', label: 'Red' },
                  { value: '#22c55e', label: 'Green' },
                  { value: '#3b82f6', label: 'Blue' },
                  { value: '#eab308', label: 'Yellow' },
                  { value: '#f97316', label: 'Orange' },
                  { value: '#a855f7', label: 'Purple' },
                  { value: '#ffffff', label: 'White' },
                  { value: '#000000', label: 'Black' },
                ].map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateWorkspace({ drawingColor: color.value, fillColor: color.value + '80' })} // Auto-set fill color to semi-transparent version
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${workspace.drawingColor === color.value ? 'scale-125 border-brand-dark-green' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Stroke Size</label>
                <span className="text-xs font-mono">{workspace.brushSize}px</span>
              </div>
              <div className="flex gap-2 mb-2 items-center">
                {[2, 4, 6, 8, 12, 16, 24].map(size => (
                  <button
                    key={size}
                    onClick={() => updateWorkspace({ brushSize: size })}
                    className={`h-6 rounded flex items-center justify-center text-xs font-mono transition-colors flex-1 ${workspace.brushSize === size ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} ${isPresentationMode && workspace.brushSize !== size ? 'bg-white/10 text-gray-300 hover:bg-white/20' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <input 
                type="range" min="1" max="48" 
                value={workspace.brushSize} 
                onChange={(e) => updateWorkspace({ brushSize: parseInt(e.target.value) })}
                className="w-full accent-brand-dark-green"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-70">Opacity (Highlighter/Fill)</label>
                <span className="text-xs font-mono">{Math.round(workspace.highlighterOpacity * 100)}%</span>
              </div>
              <input 
                type="range" min="10" max="100" step="5"
                value={workspace.highlighterOpacity * 100} 
                onChange={(e) => updateWorkspace({ highlighterOpacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-brand-dark-green"
              />
            </div>

            {/* Shape Fill Settings (Only show if rectangle or circle) */}
            {(workspace.activeTool === 'rectangle' || workspace.activeTool === 'circle') && (
              <>
                <div className="w-full h-px bg-gray-200 opacity-20"></div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2 block">Shape Style</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      onClick={() => updateWorkspace({ fillType: 'none' })}
                      className={`py-1.5 px-2 text-xs rounded transition-colors ${workspace.fillType === 'none' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.fillType !== 'none' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      Outline Only
                    </button>
                    <button
                      onClick={() => updateWorkspace({ fillType: 'semi' })}
                      className={`py-1.5 px-2 text-xs rounded transition-colors ${workspace.fillType === 'semi' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.fillType !== 'semi' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      Semi-Transparent
                    </button>
                    <button
                      onClick={() => updateWorkspace({ fillType: 'solid' })}
                      className={`py-1.5 px-2 text-xs rounded transition-colors ${workspace.fillType === 'solid' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.fillType !== 'solid' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      Solid Fill
                    </button>
                    <button
                      onClick={() => updateWorkspace({ fillType: 'transparent' })}
                      className={`py-1.5 px-2 text-xs rounded transition-colors ${workspace.fillType === 'transparent' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.fillType !== 'transparent' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      Hidden Fill (Border)
                    </button>
                  </div>
                  {workspace.activeTool === 'rectangle' && (
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input 
                        type="checkbox" 
                        checked={workspace.isRounded}
                        onChange={(e) => updateWorkspace({ isRounded: e.target.checked })}
                        className="rounded text-brand-dark-green focus:ring-brand-dark-green"
                      />
                      <span className={`text-xs ${isPresentationMode ? 'text-gray-300' : 'text-gray-600'}`}>Rounded Corners</span>
                    </label>
                  )}
                </div>

                <div className="w-full h-px bg-gray-200 opacity-20"></div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2 block">Focus & Zoom Mode</label>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateWorkspace({ focusMode: 'zoom' })}
                      className={`py-2 px-2 text-xs rounded transition-colors text-left flex justify-between items-center ${workspace.focusMode === 'zoom' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.focusMode !== 'zoom' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      <span>Focus & Zoom (Camera effect)</span>
                      {workspace.focusMode === 'zoom' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </button>
                    <button
                      onClick={() => updateWorkspace({ focusMode: 'highlight' })}
                      className={`py-2 px-2 text-xs rounded transition-colors text-left flex justify-between items-center ${workspace.focusMode === 'highlight' ? 'bg-brand-dark-green text-white' : 'bg-gray-100 text-gray-600'} ${isPresentationMode && workspace.focusMode !== 'highlight' ? 'bg-white/10 text-gray-300' : ''}`}
                    >
                      <span>Highlight Only (No zoom)</span>
                      {workspace.focusMode === 'highlight' && <span className="w-2 h-2 rounded-full bg-white"></span>}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2 block">Text Size</label>
              <input 
                type="range" min="12" max="72" 
                value={workspace.textSize} 
                onChange={(e) => updateWorkspace({ textSize: parseInt(e.target.value) })}
                className="w-full accent-brand-dark-green"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isPresentationMode) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        {renderSettingsPopover()}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2 mb-2 pointer-events-auto flex-wrap justify-center max-w-[90vw]"
            >
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => updateWorkspace({ currentPage: Math.max(1, workspace.currentPage - 1) })}
                  disabled={workspace.currentPage <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold text-white px-1 min-w-[50px] text-center tracking-wider">
                  {workspace.currentPage} <span className="text-white/40">/</span> {workspace.totalPages}
                </div>
                <button 
                  onClick={() => updateWorkspace({ currentPage: Math.min(workspace.totalPages, workspace.currentPage + 1) })}
                  disabled={workspace.currentPage >= workspace.totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

              <div className="flex items-center gap-1 flex-wrap shrink-0 justify-center">
                <button onClick={handleUndo} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Undo">
                  <Undo2 className="w-4 h-4" />
                </button>
                <button onClick={handleRedo} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Redo">
                  <Redo2 className="w-4 h-4" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-1"></div>

                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => updateWorkspace({ activeTool: tool.id })}
                    className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                      workspace.activeTool === tool.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={tool.label}
                  >
                    {workspace.activeTool === tool.id && (
                      <motion.div
                        layoutId="active-tool-presentation"
                        className="absolute inset-0 bg-brand-dark-green rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      <tool.icon className="w-4 h-4" />
                    </span>
                  </button>
                ))}

                <div className="w-px h-6 bg-white/20 mx-1"></div>
                
                {/* Quick Color Pickers for Presentation Mode */}
                <div className="flex items-center gap-1 px-1">
                  {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ffffff', '#000000'].map(color => (
                     <button
                       key={color}
                       onClick={() => updateWorkspace({ drawingColor: color, fillColor: color + '80' })}
                       className={`w-5 h-5 rounded-full border-2 transition-transform ${workspace.drawingColor === color ? 'scale-125 border-brand-dark-green' : 'border-transparent'}`}
                       style={{ backgroundColor: color }}
                     />
                  ))}
                </div>

                <div className="w-px h-6 bg-white/20 mx-1"></div>

                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${showSettings ? 'bg-white/20 text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  title="Whiteboard Settings"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="w-px h-8 bg-white/20 hidden sm:block"></div>

              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => updateWorkspace({ zoom: Math.min(3, workspace.zoom + 0.25) })} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom In">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={() => updateWorkspace({ zoom: Math.max(0.5, workspace.zoom - 0.25) })} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Zoom Out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={() => updateWorkspace({ resetDrawings: workspace.resetDrawings + 1 })} className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/10 hover:text-red-400 transition-colors" title="Clear Annotations">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-gray-900/80 backdrop-blur text-white/70 hover:text-white rounded-full p-1.5 shadow-lg border border-white/10 transition-colors"
        >
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-4 shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative">
      {renderSettingsPopover()}
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateWorkspace({ currentPage: Math.max(1, workspace.currentPage - 1) })}
          disabled={workspace.currentPage <= 1}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-sm font-medium text-gray-600 px-2 min-w-[80px] text-center">
          Page {workspace.currentPage} {workspace.totalPages > 1 ? `/ ${workspace.totalPages}` : ''}
        </div>
        <button 
          onClick={() => updateWorkspace({ currentPage: Math.min(workspace.totalPages, workspace.currentPage + 1) })}
          disabled={workspace.currentPage >= workspace.totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-[50vw]">
        <button onClick={handleUndo} className="w-10 h-10 flex shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-brand-dark-green transition-colors" title="Undo">
          <Undo2 className="w-5 h-5" />
        </button>
        <button onClick={handleRedo} className="w-10 h-10 flex shrink-0 items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-brand-dark-green transition-colors" title="Redo">
          <Redo2 className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>

        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => updateWorkspace({ activeTool: tool.id })}
            className={`relative shrink-0 w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
              workspace.activeTool === tool.id ? 'text-white' : 'text-gray-600 hover:text-brand-dark-green'
            }`}
            title={tool.label}
          >
            {workspace.activeTool === tool.id && (
              <motion.div
                layoutId={`active-tool-${isPresentationMode ? 'pres' : 'norm'}`}
                className="absolute inset-0 bg-brand-dark-green rounded-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <tool.icon className="w-5 h-5" />
            </span>
          </button>
        ))}
        
        <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>

        {/* Quick Color Pickers for Standard Mode */}
        <div className="flex items-center gap-1 shrink-0 px-1">
          {['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#ffffff', '#000000'].map(color => (
             <button
               key={color}
               onClick={() => updateWorkspace({ drawingColor: color, fillColor: color + '80' })}
               className={`w-6 h-6 rounded-full border-2 transition-transform ${workspace.drawingColor === color ? 'scale-110 border-brand-dark-green' : 'border-gray-200'}`}
               style={{ backgroundColor: color }}
               title="Select Color"
             />
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-md transition-colors ${showSettings ? 'bg-gray-200 text-brand-dark-green' : 'text-gray-600 hover:bg-white hover:text-brand-dark-green'}`}
          title="Whiteboard Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>

        <button onClick={() => updateWorkspace({ zoom: Math.min(3, workspace.zoom + 0.25) })} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-brand-dark-green transition-colors" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={() => updateWorkspace({ zoom: Math.max(0.5, workspace.zoom - 0.25) })} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-brand-dark-green transition-colors" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={() => updateWorkspace({ resetDrawings: workspace.resetDrawings + 1 })} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-md text-gray-600 hover:bg-white hover:text-red-500 transition-colors" title="Clear Annotations">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateWorkspace({ showAnimations: !workspace.showAnimations })}
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium ${workspace.showAnimations ? 'bg-brand-gold/20 text-brand-dark-green' : 'hover:bg-gray-100 text-gray-600'}`}
        >
          <Sparkles className={`w-5 h-5 ${workspace.showAnimations ? 'text-brand-dark-green' : 'text-brand-gold'}`} />
          <span className="hidden sm:inline">Animations</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors text-sm font-medium">
          <Volume2 className="w-5 h-5 text-blue-500" />
          <span className="hidden sm:inline">Audio</span>
        </button>
      </div>
    </div>
  );
}
