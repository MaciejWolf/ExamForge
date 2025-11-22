export type Tag = {
  id: string;
  name: string;
};

export type Answer = {
  id: string;
  text: string;
};

export type Question = {
    id: string;
    text: string;
    answers: Answer[];
    correctAnswerId: string;
    tags: Tag[];
    createdAt: Date;
    updatedAt: Date;
};