import { mathematicsBasic } from './questions/mathematicsBasic';
import { physicsAdvanced } from './questions/physicsAdvanced';
import { chemistryFoundations } from './questions/chemistryFoundations';
import { computerScience } from './questions/computerScience';
import { historyWWII } from './questions/historyWWII';
import { biologyCells } from './questions/biologyCells';
import { testTemplates } from './testTemplates';

export {
  mathematicsBasic,
  physicsAdvanced,
  chemistryFoundations,
  computerScience,
  historyWWII,
  biologyCells,
};

export const allQuestions = [
  ...mathematicsBasic,
  ...physicsAdvanced,
  ...chemistryFoundations,
  ...computerScience,
  ...historyWWII,
  ...biologyCells,
];

export { testTemplates };
