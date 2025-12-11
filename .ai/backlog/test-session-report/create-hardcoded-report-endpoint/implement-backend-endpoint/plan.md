# implement-backend-endpoint

Goal:
Create the backend endpoint that returns hardcoded `TestSessionReport` data to verify frontend/backend compatibility.

## Expected Response Structure

```typescript
TestSessionReport {
  session: {
    id: string
    templateId: string
    templateName: string
    examinerId: string
    timeLimitMinutes: number
    status: 'active' | 'completed' | 'cancelled' | 'in_progress' | 'expired'
    createdAt: string (ISO 8601)
  }
  participants: Participant[] // with scores, status, timestamps
  statistics: SessionStatistics // avg/high/low scores, completion counts
  questionAnalysis: QuestionAnalysis[] // per-question performance data
}
```

## Files to Create/Modify

**Create:**
- `backend/src/assessment/handlers/getSessionReport.ts` - Handler function
- `backend/src/assessment/handlers/getSessionReport.test.ts` - Unit tests
- `backend/src/assessment/types/sessionReport.ts` - TypeScript types

**Modify:**
- `backend/src/assessment/routes.ts` - Add route registration

## Implementation Tasks

### Task: create-types
**File:** `backend/src/assessment/types/sessionReport.ts`

Define all TypeScript interfaces matching frontend expectations:
- `SessionStatistics`
- `QuestionAnalysis`
- `ParticipantAnswer`
- `Participant` (if not already defined)
- `TestSessionReport`

Use camelCase for all properties to match TypeScript conventions.

Dependencies:
- Depends on: [../fix-frontend-types/plan.md](../fix-frontend-types/plan.md)

---

### Task: create-handler-with-hardcoded-data
**File:** `backend/src/assessment/handlers/getSessionReport.ts`

**Implementation details:**
- Extract `sessionId` from request params
- Return hardcoded report with realistic sample data:
  - 3-5 participants with varying statuses (completed, in_progress, not_started)
  - 3-4 questions with analysis
  - Aggregate statistics that match participant data
  - Use the incoming `sessionId` in the response

**Tests file:** `backend/src/assessment/handlers/getSessionReport.test.ts`
- Test successful report retrieval (200)
- Test with different sessionIds (should return same structure)
- Verify response matches `TestSessionReport` shape

Dependencies:
- Depends on: create-types

---

### Task: add-route
**File:** `backend/src/assessment/routes.ts`

- Add: `router.get('/sessions/:sessionId/report', getSessionReport)`
- Place after existing session routes

Dependencies:
- Depends on: create-handler-with-hardcoded-data

---

## Tasks
- [ ] create-types
- [ ] create-handler-with-hardcoded-data
- [ ] add-route

## Acceptance Criteria
- [ ] Endpoint responds with 200 and hardcoded report data
- [ ] Response matches `TestSessionReport` TypeScript interface
- [ ] All tests pass
- [ ] Follows vertical slice architecture pattern
