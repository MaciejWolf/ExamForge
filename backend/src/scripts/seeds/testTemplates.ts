import { TestTemplateSeed } from './types';
import { biologyCells } from './questions/biologyCells';
import { chemistryFoundations } from './questions/chemistryFoundations';
import { historyWWII } from './questions/historyWWII';
import { physicsAdvanced } from './questions/physicsAdvanced';
import { mathematicsBasic } from './questions/mathematicsBasic';
import { computerScience } from './questions/computerScience';

// Helper function to safely extract question IDs
const getQuestionIds = (questions: Array<{ id?: string }>): string[] => {
  return questions.map(q => q.id).filter((id): id is string => !!id);
};

export const testTemplates: TestTemplateSeed[] = [
  {
    name: 'General Science Assessment',
    description: 'A broad test covering the three core science subjects.',
    pools: [
      {
        name: 'Life Sciences',
        questionsToDraw: 3,
        points: 10,
        questionSeedIds: getQuestionIds(biologyCells),
      },
      {
        name: 'Physical Sciences',
        questionsToDraw: 6,
        points: 10,
        questionSeedIds: [
          ...getQuestionIds(chemistryFoundations),
          ...getQuestionIds(physicsAdvanced),
        ],
      },
    ],
  },
  {
    name: 'STEM Fundamentals',
    description: 'A rigorous test focusing on logic, calculation, and computing concepts.',
    pools: [
      {
        name: 'Math Core',
        questionsToDraw: 10,
        points: 5,
        questionSeedIds: getQuestionIds(mathematicsBasic),
      },
      {
        name: 'CS Concepts',
        questionsToDraw: 15,
        points: 5,
        questionSeedIds: getQuestionIds(computerScience),
      },
    ],
  },
  {
    name: 'Modern History Challenge',
    description: 'A deep dive into the history of World War II.',
    pools: [
      {
        name: 'World War II Knowledge',
        questionsToDraw: 10,
        points: 10,
        questionSeedIds: getQuestionIds(historyWWII),
      },
    ],
  },
  {
    name: 'The Polymath General Knowledge',
    description: 'A diverse mix of all available categories to test well-rounded knowledge.',
    pools: [
      {
        name: 'Quantitative Reasoning',
        questionsToDraw: 5,
        points: 5,
        questionSeedIds: getQuestionIds(mathematicsBasic),
      },
      {
        name: 'Scientific Literacy',
        questionsToDraw: 5,
        points: 5,
        questionSeedIds: [
          ...getQuestionIds(biologyCells),
          ...getQuestionIds(chemistryFoundations),
          ...getQuestionIds(physicsAdvanced),
        ],
      },
      {
        name: 'Humanities & Tech',
        questionsToDraw: 5,
        points: 5,
        questionSeedIds: [
          ...getQuestionIds(historyWWII),
          ...getQuestionIds(computerScience),
        ],
      },
    ],
  },
];
