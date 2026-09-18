import React from 'react';
import { BookOpen, MonitorPlay, Settings, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onEnterPresentationMode: () => void;
  onMenuClick?: () => void;
}

export function Header({ onEnterPresentationMode, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 shadow-sm relative">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 text-gray-600 hover:text-brand-dark-green hover:bg-gray-100 rounded-md transition-colors"
            title="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="w-10 h-10 bg-brand-dark-green rounded-lg flex items-center justify-center text-brand-gold shadow-sm shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-base sm:text-lg text-brand-dark-green leading-tight truncate">Quran Study Circle</h1>
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide uppercase truncate">Smart Teaching Board</p>
        </div>
        
        <div className="ml-4 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full hidden lg:flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-brand-gold" />
          <span className="text-[10px] font-bold text-brand-dark-green tracking-wider uppercase">Hafiz Mushahid</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">Online Class</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-6 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-sm font-semibold text-gray-700">Class Live</span>
        </div>

        <button onClick={onEnterPresentationMode} className="flex items-center gap-1 sm:gap-2 bg-brand-secondary-green hover:bg-brand-dark-green transition-colors text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium shadow-sm">
          <MonitorPlay className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Presentation Mode</span>
          <span className="sm:hidden">Present</span>
        </button>

        <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

        <button className="hidden sm:block text-gray-500 hover:text-brand-dark-green transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        <button className="hidden sm:flex w-9 h-9 bg-gray-100 rounded-full items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
