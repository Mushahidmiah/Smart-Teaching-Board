import React, { useState } from 'react';
import { Toolbar } from './Toolbar';
import { TeachingCanvas } from './TeachingCanvas';
import { BlankWhiteboard } from './BlankWhiteboard';
import { PDFViewer } from './PDFViewer';
import { QuizCanvas } from './QuizCanvas';
import type { WorkspaceState, PdfDocument } from '../types';
import { StickyNote } from 'lucide-react';

interface WorkspaceProps {
  workspace: WorkspaceState;
  updateWorkspace: (updates: Partial<WorkspaceState>) => void;
  pdfs: PdfDocument[];
  isPresentationMode?: boolean;
  hideToolbar?: boolean;
  hideHeader?: boolean;
  hideStudentPanel?: boolean;
}

export function Workspace({ 
  workspace, 
  updateWorkspace, 
  pdfs, 
  isPresentationMode = false,
  hideToolbar = false,
  hideHeader = false,
  hideStudentPanel = false
}: WorkspaceProps) {
  const [showNotes, setShowNotes] = useState(false);
  const activePdf = pdfs.find(p => p.id === workspace.activePdfId);

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative min-w-[400px] ${isPresentationMode ? 'bg-[#F8F9FA] border-r border-gray-300' : 'bg-[#F8F9FA] border-r border-gray-200'}`}>
      
      {/* Workspace Header - Can be toggled in Presentation Mode */}
      {(!isPresentationMode || !hideHeader) && (
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 w-full max-w-md">
            <input 
              type="text" 
              value={workspace.name}
              onChange={(e) => updateWorkspace({ name: e.target.value })}
              className="font-bold text-brand-dark-green text-sm shrink-0 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-brand-secondary-green rounded px-1 w-24"
            />
            <div className="w-px h-4 bg-gray-300"></div>
            <input 
              type="text" 
              value={workspace.lesson}
              onChange={(e) => updateWorkspace({ lesson: e.target.value })}
              placeholder="Lesson Title..."
              className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 flex-1 focus:outline-none focus:border-brand-secondary-green focus:bg-white transition-colors"
            />
            <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`p-1.5 rounded transition-colors ${showNotes ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              title="Toggle Notes"
            >
              <StickyNote className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={workspace.activePdfId || ''}
              onChange={(e) => updateWorkspace({ activePdfId: e.target.value || null, currentPage: 1, zoom: 1 })}
              className="text-sm border border-gray-200 rounded bg-gray-50 px-2 py-1 text-gray-700 focus:outline-none focus:border-brand-secondary-green max-w-[150px] truncate"
            >
              <option value="">Teaching Board (Arabic)</option>
              <option value="blank">Blank Whiteboard</option>
              <option value="quiz">Interactive Quiz</option>
              {pdfs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {(!isPresentationMode || !hideStudentPanel) && showNotes && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 shrink-0 z-10 shadow-inner flex flex-col gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-900/60 mb-1 block">Teacher Notes</label>
            <textarea 
              value={workspace.notes}
              onChange={(e) => updateWorkspace({ notes: e.target.value })}
              placeholder={`Notes for ${workspace.name}...`}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-amber-900 resize-none h-12 placeholder:text-amber-700/50"
            />
          </div>
          <div className="w-full h-px bg-amber-200/50"></div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-900/60 mb-1 block">Homework Assignment</label>
            <textarea 
              value={workspace.homework}
              onChange={(e) => updateWorkspace({ homework: e.target.value })}
              placeholder={`Assign homework for ${workspace.name}...`}
              className="w-full bg-transparent border-none focus:outline-none text-sm text-amber-900 resize-none h-12 placeholder:text-amber-700/50"
            />
          </div>
        </div>
      )}
      
      {/* Workspace Content */}
      <div 
        className={`flex-1 relative overflow-hidden flex flex-col ${isPresentationMode ? 'bg-[#F8F9FA] text-brand-text' : ''}`}
        style={{
          transform: workspace.currentFocus ? `scale(1.5) translate(${-(workspace.currentFocus.x + workspace.currentFocus.w/2) / 1.5 + 200}px, ${-(workspace.currentFocus.y + workspace.currentFocus.h/2) / 1.5 + 200}px)` : 'scale(1) translate(0px, 0px)',
          transition: `transform ${workspace.focusSpeed === 'fast' ? '0.3s' : workspace.focusSpeed === 'slow' ? '1.2s' : '0.6s'} ease-in-out`
        }}
      >
        {workspace.currentFocus && (
          <div 
            className="absolute inset-0 pointer-events-none z-40 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        )}
        {workspace.activePdfId === 'quiz' ? (
          <QuizCanvas 
            workspace={workspace} 
            updateWorkspace={updateWorkspace} 
            isPresentationMode={isPresentationMode} 
          />
        ) : workspace.activePdfId === 'blank' ? (
          <BlankWhiteboard 
            workspace={workspace} 
            updateWorkspace={updateWorkspace}
            isPresentationMode={isPresentationMode} 
          />
        ) : activePdf ? (
          <PDFViewer 
            key={activePdf.id}
            pdf={activePdf}
            workspace={workspace}
            updateWorkspace={updateWorkspace}
            setTotalPages={(pages) => updateWorkspace({ totalPages: pages })}
            isPresentationMode={isPresentationMode}
          />
        ) : (
          <TeachingCanvas 
            workspace={workspace}
            updateWorkspace={updateWorkspace}
            setShowAnimations={(show) => updateWorkspace({ showAnimations: show })} 
            isPresentationMode={isPresentationMode}
          />
        )}
      </div>

      {workspace.currentFocus && (
        <button
          onClick={() => updateWorkspace({ currentFocus: null })}
          className="absolute top-4 right-4 z-50 bg-brand-dark-green text-white font-bold py-2 px-4 rounded-lg shadow-xl hover:bg-opacity-90 transition-transform hover:scale-105 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Reset View
        </button>
      )}

      {/* Workspace Toolbar */}
      {workspace.activePdfId !== 'quiz' && (!isPresentationMode || !hideToolbar) && (
        <Toolbar 
          workspace={workspace}
          updateWorkspace={updateWorkspace}
          isPresentationMode={isPresentationMode}
        />
      )}
    </div>
  );
}
