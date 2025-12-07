import { QuestionSeed } from '../types';

export const mathematicsBasic: QuestionSeed[] = [
  {
    id: 'math-basic-1',
    category: 'Mathematics Basic',
    text: 'What is 2+2?',
    answers: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false },
      { text: '6', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'arithmetic'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'math-basic-2',
    category: 'Mathematics Basic',
    text: 'Solve: 3x = 15',
    answers: [
      { text: '3', isCorrect: false },
      { text: '5', isCorrect: true },
      { text: '12', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'algebra'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'math-basic-3',
    category: 'Mathematics Basic',
    text: 'What is the value of π (pi)?',
    answers: [
      { text: '3.14', isCorrect: true },
      { text: '2.71', isCorrect: false },
      { text: '1.41', isCorrect: false },
      { text: '4.13', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'constants'],
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'math-basic-4',
    category: 'Mathematics Basic',
    text: 'What is the square root of 64?',
    answers: [
      { text: '6', isCorrect: false },
      { text: '7', isCorrect: false },
      { text: '8', isCorrect: true },
      { text: '9', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'square-root'],
    createdAt: new Date('2024-01-17'),
  },
  {
    id: 'math-basic-5',
    category: 'Mathematics Basic',
    text: 'Calculate: 15 × 4',
    answers: [
      { text: '50', isCorrect: false },
      { text: '60', isCorrect: true },
      { text: '70', isCorrect: false },
      { text: '80', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'multiplication'],
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'math-basic-6',
    category: 'Mathematics Basic',
    text: "What is the area of a circle with radius 5? (Use π = 3.14)",
    answers: [
      { text: '31.4', isCorrect: false },
      { text: '78.5', isCorrect: true },
      { text: '15.7', isCorrect: false },
      { text: '25', isCorrect: false },
    ],
    tags: ['mathematics', 'basic', 'geometry', 'area'],
    createdAt: new Date('2024-01-19'),
  },
];
