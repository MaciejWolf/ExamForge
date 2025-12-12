import { TestContentPackage } from '../../design/types/testContentPackage';

export type TestInstance = {
    id: string;                    // System UUID
    sessionId: string;             // Reference to the session
    identifier: string;            // Human-readable (e.g., "John Doe")
    accessCode: string;            // Unique access code
    testContent: TestContentPackage; // Unique, materialized test content
    startedAt?: Date;
    completedAt?: Date;
    totalScore?: number;
    answers?: Record<string, string>; // questionId → answerId
    createdAt: Date;
};
