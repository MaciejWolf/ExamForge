import { QuestionSeed } from '../types';

export const biologyCells: QuestionSeed[] = [
  {
    id: 'bio-cells-1',
    category: 'Biology Cell Structure',
    text: 'What is the powerhouse of the cell?',
    answers: [
      { text: 'Nucleus', isCorrect: false },
      { text: 'Mitochondria', isCorrect: true },
      { text: 'Ribosome', isCorrect: false },
      { text: 'Golgi apparatus', isCorrect: false },
    ],
    tags: ['biology', 'cell-structure', 'cell'],
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'bio-cells-2',
    category: 'Biology Cell Structure',
    text: "Which organelle contains the cell's genetic material?",
    answers: [
      { text: 'Mitochondria', isCorrect: false },
      { text: 'Nucleus', isCorrect: true },
      { text: 'Endoplasmic reticulum', isCorrect: false },
      { text: 'Lysosome', isCorrect: false },
    ],
    tags: ['biology', 'cell-structure', 'cell', 'dna'],
    createdAt: new Date('2024-02-21'),
  },
  {
    id: 'bio-cells-3',
    category: 'Biology Cell Structure',
    text: 'What is the function of ribosomes?',
    answers: [
      { text: 'Energy production', isCorrect: false },
      { text: 'Protein synthesis', isCorrect: true },
      { text: 'DNA replication', isCorrect: false },
      { text: 'Waste removal', isCorrect: false },
    ],
    tags: ['biology', 'cell-structure', 'protein-synthesis'],
    createdAt: new Date('2024-02-22'),
  },
  {
    id: 'bio-cells-4',
    category: 'Biology Cell Structure',
    text: 'Which type of cell lacks a nucleus?',
    answers: [
      { text: 'Eukaryotic cell', isCorrect: false },
      { text: 'Prokaryotic cell', isCorrect: true },
      { text: 'Plant cell', isCorrect: false },
      { text: 'Animal cell', isCorrect: false },
    ],
    tags: ['biology', 'cell-structure', 'cell-types'],
    createdAt: new Date('2024-02-23'),
  },
];
