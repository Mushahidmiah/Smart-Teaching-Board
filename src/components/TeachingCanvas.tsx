import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Star, ArrowDown } from 'lucide-react';
import { AnimationPanel } from './AnimationPanel';
import { DrawingOverlay } from './DrawingOverlay';
import type { AnimationType, WorkspaceState } from '../types';

interface TeachingCanvasProps {
  workspace: WorkspaceState;
  updateWorkspace?: (updates: Partial<WorkspaceState>) => void;
  setShowAnimations: (show: boolean) => void;
  isPresentationMode?: boolean;
}

export function TeachingCanvas({ workspace, updateWorkspace, setShowAnimations, isPresentationMode = false }: TeachingCanvasProps) {
  const [activeAnim, setActiveAnim] = useState<AnimationType>('none');
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  
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

  const handleReplay = () => {
    setAnimKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  const dur = (base: number) => base / speed;

  return (
    <div className={`flex-1 overflow-hidden flex items-center justify-center p-8 relative ${isPresentationMode ? 'bg-black' : 'bg-[#F8F9FA]'}`}>
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-4xl rounded-2xl flex flex-col items-center relative min-h-[500px] overflow-hidden ${isPresentationMode ? 'bg-gray-900 border border-gray-800 shadow-2xl' : 'bg-white shadow-2xl border border-gray-100'}`}
      >
        <div className="p-10 flex flex-col items-center w-full h-full relative z-0">
          {/* Ornament Top */}
          <div className="mb-6 opacity-70">
            <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 0L70 15L60 30L50 15L60 0Z" fill="#D4AF37"/>
              <path d="M30 10L35 15L30 20L25 15L30 10Z" fill="#D4AF37"/>
              <path d="M90 10L95 15L90 20L85 15L90 10Z" fill="#D4AF37"/>
              <line x1="0" y1="15" x2="120" y2="15" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 4"/>
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 w-full flex flex-col items-center text-center mt-2 relative">
            
            <h2 className={`font-arabic text-5xl md:text-6xl leading-loose mb-16 ${isPresentationMode ? 'text-brand-gold drop-shadow-lg' : 'text-brand-dark-green'}`} dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h2>

            <div className="flex items-center justify-center gap-16 md:gap-24" key={animKey}>
              {/* Box 1: Letter Focus & Harakat */}
              <div className="flex flex-col items-center justify-center relative w-32 h-32">
                {activeAnim === 'arrow' && isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur(0.5), repeat: Infinity, repeatType: 'reverse' }}
                    className="absolute -top-12 text-brand-gold z-20"
                  >
                    <ArrowDown size={32} />
                  </motion.div>
                )}
                
                <div className="relative">
                  {activeAnim === 'circle' && isPlaying && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, duration: dur(0.8) }}
                      className="absolute inset-0 border-4 border-[#ef4444] rounded-full pointer-events-none z-10"
                      style={{ width: '150%', height: '150%', top: '-25%', left: '-25%' }}
                    />
                  )}
                  
                  <motion.div
                    animate={{
                      scale: activeAnim === 'letter-focus' && isPlaying ? 1.4 : 1,
                      x: activeAnim === 'wrong' && isPlaying ? [-10, 10, -10, 10, 0] : 0,
                      color: activeAnim === 'wrong' && isPlaying ? '#ef4444' : 'inherit'
                    }}
                    transition={{ duration: dur(0.4) }}
                    className={`relative z-10 font-arabic text-7xl flex items-center justify-center ${isPresentationMode ? 'text-white' : 'text-brand-text'}`}
                    dir="rtl"
                  >
                    <span>ب</span>
                    <motion.span
                      animate={{
                        color: activeAnim === 'harakat' && isPlaying ? '#ef4444' : 'inherit',
                        textShadow: activeAnim === 'harakat' && isPlaying ? '0px 0px 10px rgba(239,68,68,0.5)' : 'none',
                      }}
                      transition={{ duration: dur(0.4), repeat: activeAnim === 'harakat' ? Infinity : 0, repeatType: 'reverse' }}
                    >
                      َ
                    </motion.span>
                  </motion.div>
                </div>

                {activeAnim === 'correct' && isPlaying && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: dur(0.6) }}
                    className="absolute -top-4 -right-8 text-green-500 z-20"
                  >
                    <CheckCircle2 size={36} fill="white" />
                  </motion.div>
                )}
              </div>

              {/* Box 2: Madd Stretch */}
              <div className="flex flex-col items-center justify-center relative w-32 h-32">
                {activeAnim === 'star' && isPlaying && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', duration: dur(0.8) }}
                    className="absolute -top-12 text-yellow-400 z-20"
                  >
                    <Star size={48} fill="currentColor" />
                  </motion.div>
                )}
                <motion.div
                  animate={{
                    scaleX: activeAnim === 'madd' && isPlaying ? 1.6 : 1,
                    scaleY: activeAnim === 'pulse' && isPlaying ? [1, 1.1, 1] : 1,
                    scale: activeAnim === 'pulse' && isPlaying ? [1, 1.1, 1] : 1,
                  }}
                  style={{ originX: 1 }}
                  transition={{ duration: dur(1.5), repeat: (activeAnim === 'madd' || activeAnim === 'pulse') ? Infinity : 0, repeatType: 'reverse' }}
                  className={`font-arabic text-7xl inline-block relative z-10 ${isPresentationMode ? 'text-white' : 'text-brand-text'}`}
                  dir="rtl"
                >
                  مَا
                </motion.div>
              </div>

              {/* Box 3: Tajweed */}
              <div className="flex flex-col items-center justify-center relative h-32 px-4">
                <motion.div
                  animate={{
                    backgroundColor: activeAnim === 'tajweed' && isPlaying ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                    scale: activeAnim === 'letter-focus' && isPlaying ? 0.9 : 1,
                    opacity: activeAnim === 'letter-focus' && isPlaying ? 0.3 : 1
                  }}
                  transition={{ duration: dur(0.5) }}
                  className={`font-arabic text-7xl px-4 py-2 rounded-lg transition-colors z-10 ${isPresentationMode ? 'text-white' : 'text-brand-text'}`}
                  dir="rtl"
                >
                  الرَّحِيمِ
                </motion.div>
              </div>
            </div>
          </div>

          {/* Ornament Bottom */}
          <div className="mt-8 opacity-70">
            <svg width="120" height="30" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M60 0L70 15L60 30L50 15L60 0Z" fill="#D4AF37"/>
              <line x1="0" y1="15" x2="120" y2="15" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 4"/>
            </svg>
          </div>
        </div>
        
        {dimensions.width > 0 && dimensions.height > 0 && (
          <DrawingOverlay 
            width={dimensions.width} 
            height={dimensions.height} 
            activeTool={workspace.activeTool} 
            pageIndex={workspace.currentPage}
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
            autoConvertHandwriting={workspace.autoConvertHandwriting}
            convertTrigger={workspace.convertTrigger}
            onFocusRegion={updateWorkspace ? (rect) => {
              if (workspace.focusMode === 'zoom') {
                setShowAnimations(false);
                updateWorkspace({ currentFocus: rect });
              }
            } : undefined}
          />
        )}
      </motion.div>

      {/* Animation Panel Overlay */}
      <AnimatePresence>
        {workspace.showAnimations && (
          <AnimationPanel 
            activeAnim={activeAnim}
            setActiveAnim={setActiveAnim}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            speed={speed}
            setSpeed={setSpeed}
            onReplay={handleReplay}
            onClose={() => setShowAnimations(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
