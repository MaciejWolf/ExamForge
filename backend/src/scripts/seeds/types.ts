export type QuestionSeed = {
  id?: string;
  text: string;
  answers: Array<{ text: string; isCorrect?: boolean }>;
  tags: string[];
  createdAt: Date;
  category: string;
};
