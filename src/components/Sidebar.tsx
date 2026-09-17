import React from 'react';
import { Book, FileText, Users, Bookmark, FileStack, LayoutDashboard, Bot } from 'lucide-react';
import type { ViewTab } from '../types';

const navItems: { icon: React.ElementType; label: string; id: ViewTab }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Book, label: 'Al-Quran', id: 'quran' },
  { icon: FileText, label: 'Noorani Qaida', id: 'qaida' },
  { icon: Bookmark, label: 'Tajweed Rules', id: 'tajweed' },
  { icon: FileStack, label: 'My PDFs', id: 'pdfs' },
  { icon: Users, label: 'Students', id: 'students' },
  { icon: Bot, label: 'AI Assistant', id: 'ai-assistant' },
];

export function Sidebar({ activeTab, setActiveTab }: { activeTab: ViewTab, setActiveTab: (tab: ViewTab) => void }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="flex-1 overflow-y-auto py-6">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Classroom Hub</h2>
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-brand-dark-green text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-brand-dark-green'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-brand-gold' : 'text-gray-400 group-hover:text-brand-dark-green'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">Next Lesson</p>
          <p className="text-sm font-bold text-brand-dark-green">Student: Ahmad A.</p>
          <p className="text-xs text-gray-500 mt-1">Surah Al-Baqarah (1-5)</p>
          <p className="text-xs text-gray-400 mt-1">Starts in 15 mins</p>
        </div>
      </div>
    </aside>
  );
}
