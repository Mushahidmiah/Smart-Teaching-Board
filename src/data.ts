import type { QuizQuestion, StudentProfile } from './types';

export const SAMPLE_QUIZ: QuizQuestion[] = [
  { id: '1', type: 'identify-letter', question: 'Identify this letter:', content: 'ج', answer: 'Jeem', topic: 'Letters' },
  { id: '2', type: 'identify-harakat', question: 'What is the vowel on this letter?', content: 'بُ', answer: 'Damma', topic: 'Harakat' },
  { id: '3', type: 'identify-tajweed', question: 'Identify the Tajweed rule:', content: 'مِنْ شَرِّ', answer: 'Ikhfa', topic: 'Tajweed' },
  { id: '4', type: 'multiple-choice', question: 'Which of these is a heavy letter?', content: '', options: ['س', 'ص', 'ت', 'د'], answer: 'ص', topic: 'Letters' },
  { id: '5', type: 'read-word', question: 'Read the following word:', content: 'مَسْجِد', answer: '(Teacher verifies reading)', topic: 'Reading' },
  { id: '6', type: 'true-false', question: 'True or False: The letter "ق" is a throat letter.', content: '', options: ['True', 'False'], answer: 'False', topic: 'Letters' },
  { id: '7', type: 'fill-blank', question: 'Fill in the missing character:', content: 'بِـ _ ـمِ اللَّهِ', answer: 'س', topic: 'Reading' }
];

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'Ahmad Abdullah',
    age: 10,
    course: 'Noorani Qaida',
    level: 'Beginner',
    teacher: 'Ustadh Ali',
    classTime: 'Mon, Wed, Fri - 4:00 PM',
    activePdfId: 'pdf-1',
    currentPage: 1,
    lesson: 'Lesson 4: Harakat',
    notes: 'Struggling with Kasrah, needs more practice on heavy letters.',
    homework: 'Revise page 5 and 6 at least 3 times.',
    progress: 35
  },
  {
    id: 'student-2',
    name: 'Sarah Rahman',
    age: 12,
    course: 'Quran Recitation',
    level: 'Intermediate',
    teacher: 'Ustadh Ali',
    classTime: 'Tue, Thu - 5:00 PM',
    activePdfId: null,
    currentPage: 1,
    lesson: 'Surah Al-Fatiha',
    notes: 'Good Tajweed, keep practicing Ikhfa rules.',
    homework: 'Memorize the first 5 ayahs of Surah Al-Baqarah.',
    progress: 75
  },
  {
    id: 'student-3',
    name: 'Yusuf Kareem',
    age: 8,
    course: 'Noorani Qaida',
    level: 'Beginner',
    teacher: 'Ustadh Ali',
    classTime: 'Sat, Sun - 10:00 AM',
    activePdfId: 'pdf-1',
    currentPage: 8,
    lesson: 'Lesson 8: Sukoon',
    notes: 'Very enthusiastic, quick learner.',
    homework: 'Complete writing practice for isolated letters.',
    progress: 60
  }
];
