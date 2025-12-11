import { seededSelect, seededShuffle } from '../../../shared/seededRandom';

/**
 * Creates a deterministic random selector function from a base seed.
 * Each call to the returned function uses a unique sub-seed derived from the base seed
 * and a call counter, ensuring deterministic but varied selection.
 * 
 * @param baseSeed - The base seed string (e.g., hash of session ID)
 * @returns A function that matches the randomSelector signature
 */
export const createSeededRandomSelector = (
  baseSeed: string
): <T>(items: T[], count: number) => T[] => {
  let callCounter = 0;
  
  return <T>(items: T[], count: number): T[] => {
    const subSeed = `${baseSeed}-select-${callCounter++}`;
    return seededSelect(items, count, subSeed);
  };
};

/**
 * Creates a deterministic answer shuffler function from a base seed.
 * Each call to the returned function uses a unique sub-seed derived from the base seed
 * and a call counter, ensuring deterministic but varied shuffling.
 * 
 * @param baseSeed - The base seed string (e.g., hash of session ID)
 * @returns A function that matches the answerShuffler signature
 */
export const createSeededAnswerShuffler = (
  baseSeed: string
): <T>(items: T[]) => T[] => {
  let callCounter = 0;
  
  return <T>(items: T[]): T[] => {
    const subSeed = `${baseSeed}-shuffle-${callCounter++}`;
    return seededShuffle(items, subSeed);
  };
};
