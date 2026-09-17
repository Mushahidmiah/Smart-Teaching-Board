import React from 'react';
import { BookOpen, Clock, TrendingUp, ChevronRight, User } from 'lucide-react';
import type { StudentProfile } from '../types';

interface StudentsViewProps {
  students: StudentProfile[];
  onOpenInWorkspace: (student: StudentProfile, workspaceId: 'w1' | 'w2') => void;
}

export function StudentsView({ students, onOpenInWorkspace }: StudentsViewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 mt-2">Manage your classroom and track student progress.</p>
          </div>
          <button className="bg-brand-dark-green text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-colors shadow-sm">
            + Add Student
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-light-green rounded-full flex items-center justify-center text-brand-dark-green">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                    <span className="text-xs font-medium text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full">
                      {student.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{student.course} • {student.lesson}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{student.classTime}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center mb-1.5 text-xs font-medium">
                    <span className="text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Progress</span>
                    <span className="text-brand-dark-green">{student.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-dark-green rounded-full" 
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => onOpenInWorkspace(student, 'w1')}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  Open in Left
                </button>
                <button 
                  onClick={() => onOpenInWorkspace(student, 'w2')}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                >
                  Open in Right
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
