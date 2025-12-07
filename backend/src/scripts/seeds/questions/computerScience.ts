import { QuestionSeed } from '../types';

export const computerScience: QuestionSeed[] = [
  {
    id: 'cs-fund-1',
    category: 'Computer Science Fundamentals',
    text: 'What does HTML stand for?',
    answers: [
      { text: 'HyperText Markup Language', isCorrect: true },
      { text: 'High-Level Text Markup Language', isCorrect: false },
      { text: 'Hyperlink and Text Markup Language', isCorrect: false },
      { text: 'Home Tool Markup Language', isCorrect: false },
    ],
    tags: ['computer-science', 'fundamentals', 'web'],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'cs-fund-2',
    category: 'Computer Science Fundamentals',
    text: 'What is the time complexity of binary search?',
    answers: [
      { text: 'O(n)', isCorrect: false },
      { text: 'O(log n)', isCorrect: true },
      { text: 'O(n²)', isCorrect: false },
      { text: 'O(1)', isCorrect: false },
    ],
    tags: ['computer-science', 'fundamentals', 'algorithms', 'complexity'],
    createdAt: new Date('2024-02-11'),
  },
  {
    id: 'cs-fund-3',
    category: 'Computer Science Fundamentals',
    text: 'What is a variable that stores a memory address called?',
    answers: [
      { text: 'Array', isCorrect: false },
      { text: 'Pointer', isCorrect: true },
      { text: 'Reference', isCorrect: false },
      { text: 'Index', isCorrect: false },
    ],
    tags: ['computer-science', 'fundamentals', 'memory'],
    createdAt: new Date('2024-02-12'),
  },
  {
    id: 'cs-fund-4',
    category: 'Computer Science Fundamentals',
    text: 'What does API stand for?',
    answers: [
      { text: 'Application Programming Interface', isCorrect: true },
      { text: 'Automated Program Integration', isCorrect: false },
      { text: 'Advanced Programming Interface', isCorrect: false },
      { text: 'Application Process Integration', isCorrect: false },
    ],
    tags: ['computer-science', 'fundamentals', 'api'],
    createdAt: new Date('2024-02-13'),
  },
  {
    id: 'cs-fund-5',
    category: 'Computer Science Fundamentals',
    text: 'Which data structure follows LIFO (Last In First Out) principle?',
    answers: [
      { text: 'Queue', isCorrect: false },
      { text: 'Stack', isCorrect: true },
      { text: 'Array', isCorrect: false },
      { text: 'Linked List', isCorrect: false },
    ],
    tags: ['computer-science', 'fundamentals', 'data-structures'],
    createdAt: new Date('2024-02-14'),
  },
];
