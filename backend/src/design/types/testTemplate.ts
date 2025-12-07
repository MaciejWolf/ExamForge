export type TestTemplate = {
  id: string;
  name: string;
  description?: string;
  pools: Pool[];
  createdAt: Date;
  updatedAt: Date;
};

export type Pool = {
  id: string;
  name: string;
  questionsToDraw: number;
  points: number;
  questionIds: string[];
};
