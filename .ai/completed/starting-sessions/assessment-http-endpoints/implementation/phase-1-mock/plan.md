# Phase 1: Mock Implementation (GET /sessions)

Goal: Implement the HTTP adapter layer for the Assessment module with a mock implementation for listing sessions.

## Tasks
- [x] create-http-adapter
  - Create `backend/src/assessment/http.ts`
  - Define basic router structure
- [x] implement-mock-list-sessions
  - Define `GET /sessions` endpoint
  - Adapt mock data from `backend_old` to match new `TestSession` domain model
  - Return hardcoded mock list of sessions
- [x] wire-router-to-app
  - Mount assessment router in `backend/src/index.ts`
  - Verify endpoint accessibility

## Context
- **Target file:** `backend/src/assessment/http.ts`
- **Reference:** `backend/src/design/http.ts`
- **Mock Data Source:** `backend_old/src/services/mockData.ts` (needs adaptation)
- **Domain Model:** `backend/src/assessment/types/testSession.ts`

## Mock Data

```typescript
// Hardcoded mock data adapted from backend_old
const mockSessions: TestSession[] = [
  {
    id: "1",
    templateId: "template-1", // "Math & Physics Combined Test"
    examinerId: "examiner-1",
    timeLimitMinutes: 60,
    startTime: new Date('2025-11-15T09:00:00Z'),
    endTime: new Date('2025-11-15T10:00:00Z'),
    status: 'completed',
    createdAt: new Date('2025-11-15T08:00:00Z'),
    updatedAt: new Date('2025-11-15T10:00:00Z'),
  },
  {
    id: "2",
    templateId: "template-2", // "Science Comprehensive Exam"
    examinerId: "examiner-1",
    timeLimitMinutes: 45,
    startTime: new Date('2025-11-14T10:00:00Z'),
    endTime: new Date('2025-11-14T10:45:00Z'),
    status: 'open', // Was 'active'
    createdAt: new Date('2025-11-14T09:00:00Z'),
    updatedAt: new Date('2025-11-14T09:00:00Z'),
  },
  {
    id: "3",
    templateId: "template-3", // "Computer Science Basics"
    examinerId: "examiner-1",
    timeLimitMinutes: 90,
    startTime: new Date('2025-11-13T14:00:00Z'),
    endTime: new Date('2025-11-13T15:30:00Z'),
    status: 'completed',
    createdAt: new Date('2025-11-13T13:00:00Z'),
    updatedAt: new Date('2025-11-13T15:30:00Z'),
  },
  {
    id: "4",
    templateId: "template-4", // "General Knowledge Test"
    examinerId: "examiner-1",
    timeLimitMinutes: 30,
    startTime: new Date('2025-11-12T11:00:00Z'),
    endTime: new Date('2025-11-12T11:30:00Z'),
    status: 'open', // Was 'active'
    createdAt: new Date('2025-11-12T10:00:00Z'),
    updatedAt: new Date('2025-11-12T10:00:00Z'),
  },
];

export const createAssessmentRouter = (): Router => {
  const router = Router();

  router.get('/sessions', (req: Request, res: Response) => {
    res.status(200).json(mockSessions);
  });

  return router;
};
```