export type Tag = string;

export type Answer = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
