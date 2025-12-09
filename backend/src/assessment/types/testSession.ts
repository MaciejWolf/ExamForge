import { TestContentPackage } from '../../design/types/testContentPackage';

export type TestSession = {
  id: string;
  templateId: string;
  examinerId: string;
  timeLimitMinutes: number;
  startTime: Date;
  endTime: Date;
  status: 'open' | 'completed' | 'aborted';
  createdAt: Date;
  updatedAt: Date;
};
