import seedrandom from 'seedrandom';
import { createHash } from 'crypto';

/**
 * Creates a hash of a string for use as a seed.
 * Uses SHA-256 and returns a hex string.
 */
export const hashString = (input: string): string => {
  return createHash('sha256').update(input).digest('hex');
};

/**
 * Creates a seeded random number generator function from a seed string.
 * The same seed will always produce the same sequence of random numbers.
 */
export const createSeededRng = (seed: string): () => number => {
  const rng = seedrandom(seed);
  return () => rng();
};

/**
 * Seeded version of Fisher-Yates shuffle algorithm.
 * Shuffles an array deterministically based on a seed.
 */
export const seededShuffle = <T>(items: T[], seed: string): T[] => {
  const shuffled = [...items];
  const rng = createSeededRng(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * Seeded version of random selection.
 * Selects a specified number of items from an array deterministically based on a seed.
 * Uses Fisher-Yates shuffle and returns the first N items.
 */
export const seededSelect = <T>(items: T[], count: number, seed: string): T[] => {
  const shuffled = seededShuffle(items, seed);
  return shuffled.slice(0, count);
};
