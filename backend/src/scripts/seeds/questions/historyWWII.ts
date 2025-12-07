import { QuestionSeed } from '../types';

export const historyWWII: QuestionSeed[] = [
  {
    id: 'hist-ww2-1',
    category: 'History World War II',
    text: 'In which year did World War II end?',
    answers: [
      { text: '1944', isCorrect: false },
      { text: '1945', isCorrect: true },
      { text: '1946', isCorrect: false },
      { text: '1947', isCorrect: false },
    ],
    tags: ['history', 'world-war-ii'],
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'hist-ww2-2',
    category: 'History World War II',
    text: 'Which event is considered the start of World War II in Europe?',
    answers: [
      { text: 'Invasion of Poland', isCorrect: true },
      { text: 'Attack on Pearl Harbor', isCorrect: false },
      { text: 'Battle of Britain', isCorrect: false },
      { text: 'D-Day', isCorrect: false },
    ],
    tags: ['history', 'world-war-ii', 'europe'],
    createdAt: new Date('2024-02-16'),
  },
  {
    id: 'hist-ww2-3',
    category: 'History World War II',
    text: 'Who was the leader of Nazi Germany during World War II?',
    answers: [
      { text: 'Benito Mussolini', isCorrect: false },
      { text: 'Adolf Hitler', isCorrect: true },
      { text: 'Joseph Stalin', isCorrect: false },
      { text: 'Winston Churchill', isCorrect: false },
    ],
    tags: ['history', 'world-war-ii', 'leaders'],
    createdAt: new Date('2024-02-17'),
  },
  {
    id: 'hist-ww2-4',
    category: 'History World War II',
    text: 'Which battle is considered the turning point of World War II in the Pacific?',
    answers: [
      { text: 'Battle of Midway', isCorrect: true },
      { text: 'Battle of Guadalcanal', isCorrect: false },
      { text: 'Battle of Iwo Jima', isCorrect: false },
      { text: 'Battle of Okinawa', isCorrect: false },
    ],
    tags: ['history', 'world-war-ii', 'pacific'],
    createdAt: new Date('2024-02-18'),
  },
];
