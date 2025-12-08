import { Question } from './question';

export type TestContentPackage = {
  id: string;
  templateId: string;
  sections: MaterializedSection[];
  createdAt: Date;
};

export type MaterializedSection = {
  poolId: string;
  poolName: string;
  points: number;
  questions: Question[]; // Frozen snapshots
};
