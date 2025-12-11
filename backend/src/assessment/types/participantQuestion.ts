import { Answer } from '../../design/types/question';

// Sanitized question type for participants (without correctAnswerId)
export type ParticipantQuestion = {
  id: string;
  text: string;
  answers: Answer[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ParticipantSection = {
  poolId: string;
  poolName: string;
  points: number;
  questions: ParticipantQuestion[];
};

export type ParticipantTestContent = {
  id: string;
  templateId: string;
  sections: ParticipantSection[];
  createdAt: Date;
};
