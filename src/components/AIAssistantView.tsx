import React, { useState } from 'react';
import { Bot, Sparkles, BookOpen, AlertCircle, Loader2, ListChecks, Mail, Send } from 'lucide-react';
import type { StudentProfile } from '../types';

interface AIAssistantViewProps {
  students: StudentProfile[];
}

export function AIAssistantView({ students }: AIAssistantViewProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  
  // Explicit fields based on user request
  const [studentLevel, setStudentLevel] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [currentLesson, setCurrentLesson] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStudentSelect = (id: string) => {
    setSelectedStudent(id);
    const activeStudent = students.find(s => s.id === id);
    if (activeStudent) {
      setStudentLevel(activeStudent.level);
      setAge(activeStudent.age.toString());
      setCurrentLesson(activeStudent.lesson);
    } else {
      setStudentLevel('');
      setAge('');
      setCurrentLesson('');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentLevel,
          age,
          currentLesson,
          prompt
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from AI Assistant');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Error generating AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-gray-50">
      {/* Left panel: Input */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-light-green rounded-full flex items-center justify-center text-brand-dark-green shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Teacher Assistant</h2>
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Lesson Planner</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Important:</strong> AI is a helpful assistant, not a replacement for a qualified Quran/Tajweed instructor. Always verify generated rules and examples.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Student Context (Optional)</label>
            <select
              value={selectedStudent}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-dark-green focus:ring-1 focus:ring-brand-dark-green transition-colors"
            >
              <option value="">-- Manual Entry --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.course} - {s.level})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 10"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-dark-green focus:ring-1 focus:ring-brand-dark-green transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
              <input
                type="text"
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value)}
                placeholder="e.g. Beginner"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-dark-green focus:ring-1 focus:ring-brand-dark-green transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Lesson</label>
            <input
              type="text"
              value={currentLesson}
              onChange={(e) => setCurrentLesson(e.target.value)}
              placeholder="e.g. Noorani Qaida Lesson 4"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-brand-dark-green focus:ring-1 focus:ring-brand-dark-green transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Topic, Mistakes, or Focus Area</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Student is struggling with Madd. Needs a simple explanation and practice examples."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm min-h-[120px] resize-none focus:outline-none focus:border-brand-dark-green focus:ring-1 focus:ring-brand-dark-green transition-colors placeholder:text-gray-400"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand-dark-green text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isLoading ? 'Generating...' : 'Generate Plan'}
          </button>
        </div>
      </div>

      {/* Right panel: Output */}
      <div className="flex-1 overflow-y-auto p-8">
        {!result && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 max-w-md mx-auto text-center">
            <Bot className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-500 mb-2">Ready to Assist</h3>
            <p className="text-sm">Enter a topic, mistake, or lesson plan request on the left. The AI Assistant will generate a concise, teacher-friendly guide.</p>
          </div>
        ) : isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 max-w-md mx-auto text-center">
            <Loader2 className="w-12 h-12 mb-4 text-brand-dark-green animate-spin" />
            <h3 className="text-lg font-bold text-gray-600 mb-2">Analyzing Request</h3>
            <p className="text-sm text-gray-500">Generating lesson plan, examples, and teacher notes...</p>
          </div>
        ) : result ? (
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Explanation */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-brand-dark-green mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Simple Explanation
              </h3>
              <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Examples */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark-green mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Practice Examples
                </h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-arabic text-xl" dir="rtl">
                  {result.examples}
                </div>
              </div>

              {/* Lesson Plan */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-brand-dark-green mb-3 flex items-center gap-2">
                  <ListChecks className="w-5 h-5" /> Short Lesson Plan
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">{result.lessonPlan}</p>
              </div>
            </div>

            {/* Quiz Questions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-brand-dark-green mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> 5-Question Quiz
              </h3>
              <ul className="space-y-3">
                {result.quiz?.map((q: string, i: number) => (
                  <li key={i} className="flex gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-brand-dark-green shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teacher Notes */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-amber-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Teacher Notes & Homework
                </h3>
                <div className="text-sm text-gray-700 space-y-3">
                  <p><strong>Notes:</strong> {result.teacherNotes}</p>
                  <div className="h-px w-full bg-gray-100 my-2"></div>
                  <p><strong>Homework:</strong> {result.homework}</p>
                </div>
              </div>

              {/* Guardian Message */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" /> Guardian Progress Message
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed italic bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  "{result.guardianMessage}"
                </p>
                <div className="mt-4 flex justify-end">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md transition-colors border border-blue-100">
                    <Send className="w-3.5 h-3.5" /> Copy Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
