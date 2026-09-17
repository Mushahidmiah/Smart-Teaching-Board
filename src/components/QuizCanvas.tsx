import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, XCircle, CheckCircle2, RotateCcw, ArrowRight, Play } from 'lucide-react';
import type { WorkspaceState } from '../types';

interface QuizCanvasProps {
  workspace: WorkspaceState;
  updateWorkspace: (updates: Partial<WorkspaceState>) => void;
  isPresentationMode?: boolean;
}

export function QuizCanvas({ workspace, updateWorkspace, isPresentationMode = false }: QuizCanvasProps) {
  const { quiz } = workspace;
  const [animKey, setAnimKey] = useState(0);

  // Trigger animations
  useEffect(() => {
    if (quiz.feedbackAnim !== 'none') {
      setAnimKey(prev => prev + 1);
      
      // Reset animation state after playing
      const timer = setTimeout(() => {
        updateWorkspace({
          quiz: { ...quiz, feedbackAnim: 'none' }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [quiz.feedbackAnim]);

  const handleStart = () => {
    updateWorkspace({
      quiz: { ...quiz, status: 'active', currentIndex: 0, score: 0, wrongAnswers: {}, showAnswer: false, feedbackAnim: 'none' }
    });
  };

  const handleAnswer = (isCorrect: boolean) => {
    const currentQ = quiz.questions[quiz.currentIndex];
    
    if (isCorrect) {
      updateWorkspace({
        quiz: { ...quiz, score: quiz.score + 1, feedbackAnim: 'correct' }
      });
    } else {
      updateWorkspace({
        quiz: { 
          ...quiz, 
          feedbackAnim: 'wrong',
          wrongAnswers: { 
            ...quiz.wrongAnswers, 
            [currentQ.topic]: (quiz.wrongAnswers[currentQ.topic] || 0) + 1 
          }
        }
      });
    }
  };

  const handleNext = () => {
    if (quiz.currentIndex < quiz.questions.length - 1) {
      updateWorkspace({
        quiz: { ...quiz, currentIndex: quiz.currentIndex + 1, showAnswer: false, feedbackAnim: 'none' }
      });
    } else {
      updateWorkspace({
        quiz: { ...quiz, status: 'finished', feedbackAnim: 'none' }
      });
    }
  };

  if (quiz.status === 'idle') {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 relative ${isPresentationMode ? 'bg-gray-900' : 'bg-[#F8F9FA]'}`}>
        <div className={`w-full max-w-2xl rounded-2xl p-10 flex flex-col items-center text-center shadow-xl border ${isPresentationMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mb-6">
            <Star className="w-10 h-10 text-brand-gold" />
          </div>
          <h2 className={`text-3xl font-bold mb-4 ${isPresentationMode ? 'text-white' : 'text-gray-800'}`}>Interactive Learning Quiz</h2>
          <p className={`text-lg mb-8 ${isPresentationMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Test your knowledge on Arabic letters, Harakat, and Tajweed rules.
          </p>
          
          {!isPresentationMode && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-4 bg-brand-dark-green text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5" />
              Start Quiz
            </button>
          )}
          {isPresentationMode && (
            <p className="text-brand-gold animate-pulse text-lg font-medium">Waiting for teacher to start...</p>
          )}
        </div>
      </div>
    );
  }

  if (quiz.status === 'finished') {
    const totalQ = quiz.questions.length;
    const percentage = Math.round((quiz.score / totalQ) * 100);
    const areasToPractice = Object.entries(quiz.wrongAnswers)
      .sort(([, a], [, b]) => b - a)
      .map(([topic]) => topic);

    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-8 relative ${isPresentationMode ? 'bg-gray-900' : 'bg-[#F8F9FA]'}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-2xl rounded-2xl p-10 flex flex-col items-center text-center shadow-xl border ${isPresentationMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-800'}`}
        >
          <h2 className="text-3xl font-bold mb-8">Quiz Completed!</h2>
          
          <div className="flex items-center justify-center gap-8 mb-10 w-full flex-wrap">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-gray-400 mb-2">{totalQ}</div>
              <div className="text-sm uppercase tracking-wider opacity-70 font-semibold">Questions</div>
            </div>
            <div className="w-px h-16 bg-gray-300/30"></div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-brand-gold mb-2">{quiz.score}</div>
              <div className="text-sm uppercase tracking-wider opacity-70 font-semibold">Correct</div>
            </div>
            <div className="w-px h-16 bg-gray-300/30"></div>
            <div className="flex flex-col items-center">
              <div className="text-5xl font-bold text-brand-secondary-green mb-2">{percentage}%</div>
              <div className="text-sm uppercase tracking-wider opacity-70 font-semibold">Score</div>
            </div>
          </div>

          {areasToPractice.length > 0 && (
            <div className={`w-full p-6 rounded-xl text-left mb-8 ${isPresentationMode ? 'bg-gray-900/50' : 'bg-orange-50/50'}`}>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                Areas to Practice
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {areasToPractice.map(topic => (
                  <li key={topic} className="opacity-80 font-medium">{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {!isPresentationMode && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[quiz.currentIndex];

  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden ${isPresentationMode ? 'bg-black' : 'bg-[#F8F9FA]'}`}>
      {/* Background Animation Overlays */}
      <AnimatePresence>
        {quiz.feedbackAnim === 'correct' && (
          <motion.div
            key={`star-${animKey}`}
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0], rotate: 0 }}
            transition={{ duration: 1.5, times: [0, 0.4, 1] }}
            className="absolute z-0 text-yellow-400 pointer-events-none drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
          >
            <Star size={300} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ 
          opacity: 1, 
          x: quiz.feedbackAnim === 'wrong' ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: quiz.feedbackAnim === 'wrong' ? 0.4 : 0.3 }}
        className={`w-full max-w-3xl rounded-2xl flex flex-col relative z-10 shadow-2xl border ${isPresentationMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
      >
        <div className={`p-4 border-b flex justify-between items-center ${isPresentationMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <span className={`text-sm font-semibold uppercase tracking-wider ${isPresentationMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Question {quiz.currentIndex + 1} of {quiz.questions.length}
          </span>
          <span className={`text-sm font-semibold uppercase tracking-wider ${isPresentationMode ? 'text-brand-gold' : 'text-brand-dark-green'}`}>
            {currentQuestion.topic}
          </span>
        </div>

        <div className="p-10 flex flex-col items-center text-center min-h-[300px] justify-center">
          <h3 className={`text-2xl md:text-3xl font-bold mb-8 ${isPresentationMode ? 'text-white' : 'text-gray-800'}`}>
            {currentQuestion.question}
          </h3>

          {currentQuestion.content && (
            <div className={`text-7xl font-arabic mb-10 leading-normal py-4 ${isPresentationMode ? 'text-brand-gold' : 'text-brand-dark-green'}`} dir="rtl">
              {currentQuestion.content}
            </div>
          )}

          {currentQuestion.options && (
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-4">
              {currentQuestion.options.map((opt, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl text-xl font-bold flex items-center justify-center border-2 ${
                    isPresentationMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  } ${
                    quiz.showAnswer && opt === currentQuestion.answer
                      ? isPresentationMode ? 'border-green-400 bg-green-400/20 text-green-400' : 'border-green-500 bg-green-500/10 text-green-600'
                      : ''
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          )}

          {quiz.showAnswer && !currentQuestion.options && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 p-6 rounded-xl border w-full max-w-lg ${isPresentationMode ? 'bg-green-400/10 border-green-400/30' : 'bg-green-50/50 border-green-100'}`}
            >
              <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${isPresentationMode ? 'text-green-400' : 'text-green-600'}`}>Answer</div>
              <div className={`text-2xl font-bold ${isPresentationMode ? 'text-white' : 'text-gray-800'}`}>{currentQuestion.answer}</div>
            </motion.div>
          )}
        </div>

        {/* Teacher Controls - Hidden in Presentation Mode */}
        {!isPresentationMode && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex items-center justify-between">
            <button
              onClick={() => updateWorkspace({ quiz: { ...quiz, showAnswer: !quiz.showAnswer } })}
              className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {quiz.showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => handleAnswer(false)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={() => handleAnswer(true)}
                className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Correct
              </button>
              <div className="w-px h-10 bg-gray-300 mx-2"></div>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-brand-dark-green text-white hover:bg-opacity-90 font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {quiz.currentIndex < quiz.questions.length - 1 ? 'Next' : 'Finish'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
