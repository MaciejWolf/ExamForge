export type QuestionSeed = {
  id?: string;
  text: string;
  answers: Array<{ text: string; isCorrect?: boolean }>;
  tags: string[];
  createdAt: Date;
  category: string;
};

export type TestTemplateSeed = {
  name: string;
  description?: string;
  pools: Array<{
    name: string;
    questionsToDraw: number;
    pointsPerQuestion: number;
    questionSeedIds: string[];
  }>;
};
