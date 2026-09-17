export type AnimationType =
  | 'none'
  | 'letter-focus'
  | 'harakat'
  | 'madd'
  | 'tajweed'
  | 'arrow'
  | 'circle'
  | 'correct'
  | 'wrong'
  | 'star'
  | 'pulse';

export type ViewTab = 'dashboard' | 'quran' | 'qaida' | 'tajweed' | 'pdfs' | 'students' | 'ai-assistant';

export type DrawingTool = 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'circle' | 'rectangle' | 'line' | 'arrow' | 'text';

export interface QuizQuestion {
  id: string;
  type: 'identify-letter' | 'identify-harakat' | 'identify-tajweed' | 'multiple-choice' | 'read-word' | 'true-false' | 'fill-blank';
  question: string;
  content: string;
  options?: string[];
  answer: string;
  topic: string;
}

export interface QuizState {
  isActive: boolean;
  currentIndex: number;
  score: number;
  showAnswer: boolean;
  status: 'idle' | 'active' | 'finished';
  feedbackAnim: 'none' | 'correct' | 'wrong';
  questions: QuizQuestion[];
  wrongAnswers: Record<string, number>;
}

export interface PdfDocument {
  id: string;
  name: string;
  url: string;
  pages: number;
  uploadDate: string;
}

export interface DrawingShape {
  id: string;
  tool: DrawingTool;
  points?: number[];
  x?: number;
  y?: number;
  radius?: number;
  width?: number;
  height?: number;
  color: string;
  fillColor?: string;
  fillType?: 'none' | 'transparent' | 'semi' | 'solid';
  isRounded?: boolean;
  text?: string;
  fontSize?: number;
  opacity?: number;
  strokeWidth?: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  course: string;
  level: string;
  teacher: string;
  classTime: string;
  activePdfId: string | null;
  currentPage: number;
  lesson: string;
  notes: string;
  homework: string;
  progress: number;
}

export interface WorkspaceState {
  id: string;
  studentId: string | null;
  name: string;
  activePdfId: string | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  activeTool: DrawingTool;
  drawingColor: string;
  fillColor: string;
  fillType: 'none' | 'transparent' | 'semi' | 'solid';
  isRounded: boolean;
  focusMode: 'highlight' | 'zoom';
  focusSpeed: 'slow' | 'normal' | 'fast';
  currentFocus: { x: number, y: number, w: number, h: number } | null;
  resetDrawings: number;
  showAnimations: boolean;
  notes: string;
  lesson: string;
  homework: string;
  brushSize: number;
  textSize: number;
  highlighterOpacity: number;
  undoTrigger: number;
  redoTrigger: number;
  quiz: QuizState;
}

export type LayoutMode = 'single' | 'split' | 'focus-1' | 'focus-2';

export interface PresentationLayoutConfig {
  canvasWidth: number | 'auto';
  canvasHeight: number | 'auto';
  zoomLevel: number;
  alignX: 'left' | 'center' | 'right';
  alignY: 'top' | 'center' | 'bottom';
  padding: number;
  showSidebar: boolean;
  showToolbar: boolean;
  showStudentPanel: boolean;
  showHeader: boolean;
  contentMode: 'single' | 'dual' | 'pdf' | 'whiteboard' | 'quran';
}

