import React from 'react';
import { Settings2, Maximize, Minimize, AlignLeft, AlignCenter, AlignRight, Layout, Monitor, Sidebar, ToggleLeft, PanelRightClose } from 'lucide-react';
import type { PresentationLayoutConfig } from '../types';

interface PresentationSettingsProps {
  config: PresentationLayoutConfig;
  updateConfig: (updates: Partial<PresentationLayoutConfig>) => void;
  onSave: () => void;
  onReset: () => void;
  onExit: () => void;
  onCollapse: () => void;
}

export function PresentationSettingsPanel({ config, updateConfig, onSave, onReset, onExit, onCollapse }: PresentationSettingsProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-20">
      <div className="p-4 border-b border-gray-200 bg-brand-soft-white sticky top-0 z-10 flex items-center justify-between">
        <h2 className="font-bold text-brand-dark-green flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Presentation Studio
        </h2>
        <button 
          onClick={onCollapse}
          className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors"
          title="Collapse Panel"
        >
          <PanelRightClose className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Content Mode */}
        <section>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Content Mode</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'single', label: 'Single Student' },
              { id: 'dual', label: 'Dual Student' },
              { id: 'quran', label: 'Teaching Board (Quran)' },
              { id: 'pdf', label: 'PDF Only' },
              { id: 'whiteboard', label: 'Whiteboard Only' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateConfig({ contentMode: mode.id as any })}
                className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  config.contentMode === mode.id
                    ? 'bg-brand-light-green text-brand-dark-green font-bold border border-brand-secondary-green/30'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-gray-100"></div>

        {/* Canvas Dimensions */}
        <section>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Canvas Size</label>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-gray-600">
                <span>Width (px)</span>
                <span className="font-mono">{config.canvasWidth === 'auto' ? 'Auto' : config.canvasWidth}</span>
              </div>
              <input 
                type="range" 
                min="600" 
                max="2560" 
                step="10"
                value={config.canvasWidth === 'auto' ? 1280 : config.canvasWidth}
                onChange={(e) => updateConfig({ canvasWidth: parseInt(e.target.value) })}
                className="w-full accent-brand-dark-green"
              />
              <button 
                onClick={() => updateConfig({ canvasWidth: 'auto' })}
                className="text-xs text-brand-dark-green hover:underline mt-1"
              >
                Set to Auto
              </button>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1 text-gray-600">
                <span>Height (px)</span>
                <span className="font-mono">{config.canvasHeight === 'auto' ? 'Auto' : config.canvasHeight}</span>
              </div>
              <input 
                type="range" 
                min="400" 
                max="1440" 
                step="10"
                value={config.canvasHeight === 'auto' ? 720 : config.canvasHeight}
                onChange={(e) => updateConfig({ canvasHeight: parseInt(e.target.value) })}
                className="w-full accent-brand-dark-green"
              />
              <button 
                onClick={() => updateConfig({ canvasHeight: 'auto' })}
                className="text-xs text-brand-dark-green hover:underline mt-1"
              >
                Set to Auto
              </button>
            </div>
          </div>
        </section>

        <div className="w-full h-px bg-gray-100"></div>

        {/* Zoom & Alignment */}
        <section>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">View Adjustments</label>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 text-gray-600">
              <span>Zoom Level</span>
              <span className="font-mono">{Math.round(config.zoomLevel * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.25" 
              max="2.5" 
              step="0.05"
              value={config.zoomLevel}
              onChange={(e) => updateConfig({ zoomLevel: parseFloat(e.target.value) })}
              className="w-full accent-brand-dark-green"
            />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1 text-gray-600">
              <span>Padding (px)</span>
              <span className="font-mono">{config.padding}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="128" 
              step="4"
              value={config.padding}
              onChange={(e) => updateConfig({ padding: parseInt(e.target.value) })}
              className="w-full accent-brand-dark-green"
            />
          </div>

          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => updateConfig({ alignX: 'left' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignX === 'left' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => updateConfig({ alignX: 'center' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignX === 'center' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Center Horizontal"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => updateConfig({ alignX: 'right' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignX === 'right' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => updateConfig({ alignY: 'top' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignY === 'top' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Top"
            >
              <span className="text-xs font-bold">Top</span>
            </button>
            <button 
              onClick={() => updateConfig({ alignY: 'center' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignY === 'center' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Center Vertical"
            >
              <span className="text-xs font-bold">Mid</span>
            </button>
            <button 
              onClick={() => updateConfig({ alignY: 'bottom' })}
              className={`flex-1 flex justify-center py-1.5 rounded border ${config.alignY === 'bottom' ? 'bg-brand-light-green border-brand-dark-green text-brand-dark-green' : 'bg-gray-50 border-gray-200'}`}
              title="Align Bottom"
            >
              <span className="text-xs font-bold">Bot</span>
            </button>
          </div>
        </section>

        <div className="w-full h-px bg-gray-100"></div>

        {/* Visibility Toggles */}
        <section>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Visibility</label>
          <div className="space-y-3">
            {[
              { id: 'showSidebar', label: 'Left Sidebar' },
              { id: 'showToolbar', label: 'Drawing Toolbar' },
              { id: 'showStudentPanel', label: 'Student Panel' },
              { id: 'showHeader', label: 'Workspace Header' },
            ].map((toggle) => (
              <label key={toggle.id} className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-gray-700 group-hover:text-black">{toggle.label}</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={config[toggle.id as keyof PresentationLayoutConfig] as boolean}
                    onChange={(e) => updateConfig({ [toggle.id]: e.target.checked })}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${config[toggle.id as keyof PresentationLayoutConfig] ? 'bg-brand-dark-green' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${config[toggle.id as keyof PresentationLayoutConfig] ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200 space-y-2">
        <button 
          onClick={onSave}
          className="w-full bg-brand-dark-green text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors shadow-sm"
        >
          Save Layout
        </button>
        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={onExit}
            className="flex-1 bg-red-50 border border-red-200 text-red-600 font-bold py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
          >
            Exit Studio
          </button>
        </div>
      </div>
    </div>
  );
}
