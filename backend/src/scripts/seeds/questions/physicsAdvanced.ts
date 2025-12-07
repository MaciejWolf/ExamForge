import { QuestionSeed } from '../types';

export const physicsAdvanced: QuestionSeed[] = [
  {
    id: 'physics-adv-1',
    category: 'Physics Advanced',
    text: 'What is the speed of light in vacuum?',
    answers: [
      { text: '3 × 10^8 m/s', isCorrect: true },
      { text: '3 × 10^6 m/s', isCorrect: false },
      { text: '3 × 10^10 m/s', isCorrect: false },
      { text: '3 × 10^5 m/s', isCorrect: false },
    ],
    tags: ['physics', 'advanced', 'constants'],
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'physics-adv-2',
    category: 'Physics Advanced',
    text: "What is Newton's second law of motion?",
    answers: [
      { text: 'F = ma', isCorrect: true },
      { text: 'E = mc²', isCorrect: false },
      { text: 'PV = nRT', isCorrect: false },
      { text: 'V = IR', isCorrect: false },
    ],
    tags: ['physics', 'advanced', 'mechanics'],
    createdAt: new Date('2024-01-21'),
  },
  {
    id: 'physics-adv-3',
    category: 'Physics Advanced',
    text: 'What is the unit of electric current?',
    answers: [
      { text: 'Volt', isCorrect: false },
      { text: 'Ampere', isCorrect: true },
      { text: 'Ohm', isCorrect: false },
      { text: 'Watt', isCorrect: false },
    ],
    tags: ['physics', 'advanced', 'electricity'],
    createdAt: new Date('2024-01-22'),
  },
  {
    id: 'physics-adv-4',
    category: 'Physics Advanced',
    text: 'What is the formula for kinetic energy?',
    answers: [
      { text: 'KE = ½mv²', isCorrect: true },
      { text: 'KE = mgh', isCorrect: false },
      { text: 'KE = mv', isCorrect: false },
      { text: 'KE = ½mv', isCorrect: false },
    ],
    tags: ['physics', 'advanced', 'energy'],
    createdAt: new Date('2024-01-23'),
  },
  {
    id: 'physics-adv-5',
    category: 'Physics Advanced',
    text: 'What is the acceleration due to gravity on Earth?',
    answers: [
      { text: '9.8 m/s²', isCorrect: true },
      { text: '10 m/s²', isCorrect: false },
      { text: '8.9 m/s²', isCorrect: false },
      { text: '11 m/s²', isCorrect: false },
    ],
    tags: ['physics', 'advanced', 'gravity'],
    createdAt: new Date('2024-01-24'),
  },
];
