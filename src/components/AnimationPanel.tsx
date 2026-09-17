import React from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, X, FastForward, Type, Highlighter, ArrowRightLeft, Palette, MousePointer2, Circle, CheckCircle2, XCircle, Star, Activity } from 'lucide-react';
import type { AnimationType } from '../types';

interface AnimationPanelProps {
  activeAnim: AnimationType;
  setActiveAnim: (anim: AnimationType) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  speed: number;
  setSpeed: (speed: number) => void;
  onReplay: () => void;
  onClose: () => void;
}

const animationOptions: { id: AnimationType; label: string; icon: React.ElementType }[] = [
  { id: 'letter-focus', label: 'Letter Focus', icon: Type },
  { id: 'harakat', label: 'Harakat', icon: Highlighter },
  { id: 'madd', label: 'Madd Stretch', icon: ArrowRightLeft },
  { id: 'tajweed', label: 'Tajweed', icon: Palette },
  { id: 'arrow', label: 'Arrow', icon: MousePointer2 },
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'correct', label: 'Correct', icon: CheckCircle2 },
  { id: 'wrong', label: 'Try Again', icon: XCircle },
  { id: 'star', label: 'Reward Star', icon: Star },
  { id: 'pulse', label: 'Pulse', icon: Activity },
];

export function AnimationPanel({ activeAnim, setActiveAnim, isPlaying, setIsPlaying, speed, setSpeed, onReplay, onClose }: AnimationPanelProps) {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-4 right-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-brand-gold" />
          Animation Controls
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
        {animationOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              setActiveAnim(opt.id);
              setIsPlaying(true);
              onReplay();
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
              activeAnim === opt.id
                ? 'bg-brand-dark-green text-white border-brand-dark-green shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-secondary-green hover:bg-green-50'
            }`}
          >
            <opt.icon className={`w-5 h-5 mb-1.5 ${activeAnim === opt.id ? 'text-brand-gold' : 'text-gray-400'}`} />
            <span className="text-center leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-brand-dark-green text-white flex items-center justify-center hover:bg-brand-secondary-green transition-colors shadow-sm"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
          </button>
          <button
            onClick={onReplay}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
            title="Replay"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>

          <button
            onClick={() => setSpeed(speed === 1 ? 0.5 : speed === 0.5 ? 2 : 1)}
            className="flex items-center gap-1 px-3 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
            title="Animation Speed"
          >
            <FastForward className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-bold w-4">{speed}x</span>
          </button>
        </div>

        <button
          onClick={() => setActiveAnim('none')}
          className="w-full py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
        >
          Remove Animation
        </button>
      </div>
    </motion.div>
  );
}
