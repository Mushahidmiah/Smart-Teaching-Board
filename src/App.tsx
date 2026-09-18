import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PDFLibrary } from './components/PDFLibrary';
import { Workspace } from './components/Workspace';
import { ClassroomBar } from './components/ClassroomBar';
import { PresentationStudio } from './components/PresentationStudio';
import { StudentsView } from './components/StudentsView';
import { AIAssistantView } from './components/AIAssistantView';
import type { ViewTab, WorkspaceState, LayoutMode, PdfDocument, StudentProfile } from './types';
import { SAMPLE_QUIZ, INITIAL_STUDENTS } from './data';

const initialWorkspace1: WorkspaceState = {
  id: 'w1',
  studentId: 'student-1',
  name: INITIAL_STUDENTS[0].name,
  activePdfId: INITIAL_STUDENTS[0].activePdfId,
  currentPage: INITIAL_STUDENTS[0].currentPage,
  totalPages: 1,
  zoom: 1,
  activeTool: 'highlighter',
  drawingColor: '#eab308',
  fillColor: '#fef08a',
  fillType: 'semi',
  isRounded: true,
  focusMode: 'zoom',
  focusSpeed: 'normal',
  currentFocus: null,
  focusWord: null,
  autoConvertHandwriting: false,
  convertTrigger: 0,
  resetDrawings: 0,
  showAnimations: false,
  notes: INITIAL_STUDENTS[0].notes,
  lesson: INITIAL_STUDENTS[0].lesson,
  homework: INITIAL_STUDENTS[0].homework,
  brushSize: 4,
  textSize: 24,
  highlighterOpacity: 0.4,
  undoTrigger: 0,
  redoTrigger: 0,
  quiz: {
    isActive: false,
    currentIndex: 0,
    score: 0,
    showAnswer: false,
    status: 'idle',
    feedbackAnim: 'none',
    questions: SAMPLE_QUIZ,
    wrongAnswers: {}
  }
};

const initialWorkspace2: WorkspaceState = {
  id: 'w2',
  studentId: 'student-2',
  name: INITIAL_STUDENTS[1].name,
  activePdfId: INITIAL_STUDENTS[1].activePdfId,
  currentPage: INITIAL_STUDENTS[1].currentPage,
  totalPages: 1,
  zoom: 1,
  activeTool: 'highlighter',
  drawingColor: '#eab308',
  fillColor: '#fef08a',
  fillType: 'semi',
  isRounded: true,
  focusMode: 'zoom',
  focusSpeed: 'normal',
  currentFocus: null,
  focusWord: null,
  autoConvertHandwriting: false,
  convertTrigger: 0,
  resetDrawings: 0,
  showAnimations: false,
  notes: INITIAL_STUDENTS[1].notes,
  lesson: INITIAL_STUDENTS[1].lesson,
  homework: INITIAL_STUDENTS[1].homework,
  brushSize: 4,
  textSize: 24,
  highlighterOpacity: 0.4,
  undoTrigger: 0,
  redoTrigger: 0,
  quiz: {
    isActive: false,
    currentIndex: 0,
    score: 0,
    showAnswer: false,
    status: 'idle',
    feedbackAnim: 'none',
    questions: SAMPLE_QUIZ,
    wrongAnswers: {}
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('students');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  
  const [ws1, setWs1] = useState<WorkspaceState>(initialWorkspace1);
  const [ws2, setWs2] = useState<WorkspaceState>(initialWorkspace2);

  // Helper to sync workspace changes back to the student profile
  const syncStudentData = (studentId: string, updates: Partial<WorkspaceState>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          ...(updates.activePdfId !== undefined && { activePdfId: updates.activePdfId }),
          ...(updates.currentPage !== undefined && { currentPage: updates.currentPage }),
          ...(updates.lesson !== undefined && { lesson: updates.lesson }),
          ...(updates.notes !== undefined && { notes: updates.notes }),
          ...(updates.homework !== undefined && { homework: updates.homework }),
        };
      }
      return s;
    }));
  };

  const updateWs1 = (updates: Partial<WorkspaceState>) => {
    setWs1(prev => {
      const next = { ...prev, ...updates };
      if (next.studentId) syncStudentData(next.studentId, updates);
      return next;
    });
  };

  const updateWs2 = (updates: Partial<WorkspaceState>) => {
    setWs2(prev => {
      const next = { ...prev, ...updates };
      if (next.studentId) syncStudentData(next.studentId, updates);
      return next;
    });
  };

  const openStudentInWorkspace = (student: StudentProfile, workspaceId: 'w1' | 'w2') => {
    const wsUpdates: Partial<WorkspaceState> = {
      studentId: student.id,
      name: student.name,
      activePdfId: student.activePdfId,
      currentPage: student.currentPage,
      lesson: student.lesson,
      notes: student.notes,
      homework: student.homework,
    };
    
    if (workspaceId === 'w1') {
      updateWs1(wsUpdates);
    } else {
      updateWs2(wsUpdates);
      if (layoutMode === 'single') setLayoutMode('split');
    }
    setActiveTab('quran');
  };

  const handleSwap = () => {
    const temp = ws1;
    setWs1(ws2);
    setWs2(temp);
  };

  const enterPresentationMode = () => {
    setIsPresentationMode(true);
  };

  const exitPresentationMode = () => {
    setIsPresentationMode(false);
  };

  if (isPresentationMode) {
    return (
      <PresentationStudio
        ws1={ws1}
        ws2={ws2}
        updateWs1={updateWs1}
        updateWs2={updateWs2}
        pdfs={pdfs}
        onExit={exitPresentationMode}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-brand-soft-white text-brand-text overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header onEnterPresentationMode={enterPresentationMode} />
        
        {activeTab === 'pdfs' ? (
          <PDFLibrary pdfs={pdfs} setPdfs={setPdfs} />
        ) : activeTab === 'students' ? (
          <StudentsView students={students} onOpenInWorkspace={openStudentInWorkspace} />
        ) : activeTab === 'ai-assistant' ? (
          <AIAssistantView students={students} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ClassroomBar layoutMode={layoutMode} setLayoutMode={setLayoutMode} onSwapWorkspaces={handleSwap} />
            
            <div className={`flex-1 flex flex-row overflow-hidden relative bg-gray-200`}>
              {/* Workspace 1 */}
              {(layoutMode === 'single' || layoutMode === 'split' || layoutMode === 'focus-1') && (
                <div key={ws1.id} className={`${layoutMode === 'split' ? 'w-1/2 border-r-2 border-brand-dark-green' : 'w-full'} flex-shrink-0 flex`}>
                  <Workspace workspace={ws1} updateWorkspace={updateWs1} pdfs={pdfs} isPresentationMode={false} />
                </div>
              )}
              
              {/* Workspace 2 */}
              {(layoutMode === 'split' || layoutMode === 'focus-2') && (
                <div key={ws2.id} className={`${layoutMode === 'split' ? 'w-1/2' : 'w-full'} flex-shrink-0 flex`}>
                  <Workspace workspace={ws2} updateWorkspace={updateWs2} pdfs={pdfs} isPresentationMode={false} />
                </div>
              )}

              {/* Floating Layout Indicators (Optional) */}
              {layoutMode === 'focus-1' && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                  {ws1.name} Focused
                </div>
              )}
              {layoutMode === 'focus-2' && (
                <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                  {ws2.name} Focused
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
