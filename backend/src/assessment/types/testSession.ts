import { TestContentPackage } from '../../design/types/testContentPackage';

export type TestSession = {
  id: string;
  templateId: string;
  status: 'open' | 'completed' | 'aborted';
  content: TestContentPackage;
  createdAt: Date;
  updatedAt: Date;
};
