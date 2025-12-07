import { QuestionSeed } from '../types';

export const chemistryFoundations: QuestionSeed[] = [
  {
    id: 'chem-found-1',
    category: 'Chemistry Foundations',
    text: 'What is the chemical symbol for water?',
    answers: [
      { text: 'H2O', isCorrect: true },
      { text: 'CO2', isCorrect: false },
      { text: 'NaCl', isCorrect: false },
      { text: 'O2', isCorrect: false },
    ],
    tags: ['chemistry', 'foundations', 'compounds'],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'chem-found-2',
    category: 'Chemistry Foundations',
    text: 'What is the atomic number of carbon?',
    answers: [
      { text: '6', isCorrect: true },
      { text: '12', isCorrect: false },
      { text: '14', isCorrect: false },
      { text: '8', isCorrect: false },
    ],
    tags: ['chemistry', 'foundations', 'atomic-number'],
    createdAt: new Date('2024-02-02'),
  },
  {
    id: 'chem-found-3',
    category: 'Chemistry Foundations',
    text: 'What is the pH of a neutral solution?',
    answers: [
      { text: '5', isCorrect: false },
      { text: '7', isCorrect: true },
      { text: '9', isCorrect: false },
      { text: '14', isCorrect: false },
    ],
    tags: ['chemistry', 'foundations', 'pH'],
    createdAt: new Date('2024-02-03'),
  },
  {
    id: 'chem-found-4',
    category: 'Chemistry Foundations',
    text: "What is the most abundant gas in Earth's atmosphere?",
    answers: [
      { text: 'Oxygen', isCorrect: false },
      { text: 'Nitrogen', isCorrect: true },
      { text: 'Carbon dioxide', isCorrect: false },
      { text: 'Argon', isCorrect: false },
    ],
    tags: ['chemistry', 'foundations', 'atmosphere'],
    createdAt: new Date('2024-02-04'),
  },
  {
    id: 'chem-found-5',
    category: 'Chemistry Foundations',
    text: 'What type of bond is formed when electrons are shared between atoms?',
    answers: [
      { text: 'Ionic bond', isCorrect: false },
      { text: 'Covalent bond', isCorrect: true },
      { text: 'Hydrogen bond', isCorrect: false },
      { text: 'Metallic bond', isCorrect: false },
    ],
    tags: ['chemistry', 'foundations', 'bonding'],
    createdAt: new Date('2024-02-05'),
  },
];
