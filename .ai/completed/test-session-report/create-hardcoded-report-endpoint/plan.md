# create-hardcoded-report-endpoint

Goal:
Create the GET `/api/assessment/sessions/:sessionId/report` endpoint that returns a fully hardcoded `TestSessionReport` object to verify frontend/backend compatibility before implementing real data logic.

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

## Implementation Details

### Frontend Types Fix (fix-frontend-types-snake-case)
Convert snake_case properties to camelCase in frontend types to match TypeScript conventions:

**Participant interface:**
- `session_id` → `sessionId`
- `access_code` → `accessCode`
- `started_at` → `startedAt`
- `completed_at` → `completedAt`
- `time_taken_minutes` → `timeTakenMinutes`
- `total_score` → `totalScore`
- `max_score` → `maxScore`

**SessionStatistics interface:**
- `average_score` → `averageScore`
- `highest_score` → `highestScore`
- `lowest_score` → `lowestScore`
- `completion_rate` → `completionRate`
- `completed_count` → `completedCount`
- `in_progress_count` → `inProgressCount`
- `not_started_count` → `notStartedCount`
- `total_participants` → `totalParticipants`

**QuestionAnalysis interface:**
- `question_id` → `questionId`
- `question_number` → `questionNumber`
- `question_content` → `questionContent`
- `correct_answer` → `correctAnswer`
- `correct_responses` → `correctResponses`
- `total_responses` → `totalResponses`
- `correct_percentage` → `correctPercentage`
- `participants_count` → `participantsCount`

**ParticipantAnswer interface:**
- `question_id` → `questionId`
- `selected_answer_id` → `selectedAnswerId`
- `is_correct` → `isCorrect`
- `points_earned` → `pointsEarned`
- `points_possible` → `pointsPossible`

**Files to check for usages:**
- `frontend/src/services/types.ts` - Update type definitions
- `frontend/src/pages/examiner/TestSessionLaunchPage.tsx` - Check for property access
- Any other components using these types

### Handler (getSessionReport.ts)
- Extract `sessionId` from request params
- Return hardcoded report with realistic sample data:
  - 3-5 participants with varying statuses (completed, in_progress, not_started)
  - 3-4 questions with analysis
  - Aggregate statistics that match participant data
  - Use the incoming `sessionId` in the response

### Types (sessionReport.ts)
- Define all TypeScript interfaces matching frontend expectations:
  - `SessionStatistics`
  - `QuestionAnalysis`
  - `TestSessionReport`

### Route (routes.ts)
- Add: `router.get('/sessions/:sessionId/report', getSessionReport)`
- Place after existing session routes

### Tests
- Test successful report retrieval (200)
- Test with different sessionIds (should return same structure)
- Verify response matches `TestSessionReport` shape

Tasks:
- [ ] [fix-frontend-types](fix-frontend-types/plan.md)
- [ ] [implement-backend-endpoint](implement-backend-endpoint/plan.md)
- [ ] verify-with-frontend

## Acceptance Criteria
- [X] Endpoint responds with 200 and hardcoded report data
- [X] Response matches `TestSessionReport` TypeScript interface
- [X] Frontend page successfully displays the hardcoded data
- [X] All tests pass
- [X] Follows vertical slice architecture pattern
