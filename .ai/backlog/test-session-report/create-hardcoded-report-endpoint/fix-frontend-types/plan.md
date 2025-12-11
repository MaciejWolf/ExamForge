# fix-frontend-types

Goal:
Convert snake_case properties to camelCase in frontend types to match TypeScript conventions and prepare for backend integration.

## Type Changes Required

### Participant interface
- `session_id` → `sessionId`
- `access_code` → `accessCode`
- `started_at` → `startedAt`
- `completed_at` → `completedAt`
- `time_taken_minutes` → `timeTakenMinutes`
- `total_score` → `totalScore`
- `max_score` → `maxScore`

### SessionStatistics interface
- `average_score` → `averageScore`
- `highest_score` → `highestScore`
- `lowest_score` → `lowestScore`
- `completion_rate` → `completionRate`
- `completed_count` → `completedCount`
- `in_progress_count` → `inProgressCount`
- `not_started_count` → `notStartedCount`
- `total_participants` → `totalParticipants`

### QuestionAnalysis interface
- `question_id` → `questionId`
- `question_number` → `questionNumber`
- `question_content` → `questionContent`
- `correct_answer` → `correctAnswer`
- `correct_responses` → `correctResponses`
- `total_responses` → `totalResponses`
- `correct_percentage` → `correctPercentage`
- `participants_count` → `participantsCount`

### ParticipantAnswer interface
- `question_id` → `questionId`
- `selected_answer_id` → `selectedAnswerId`
- `is_correct` → `isCorrect`
- `points_earned` → `pointsEarned`
- `points_possible` → `pointsPossible`

## Files to Modify

**Primary:**
- `frontend/src/services/types.ts` - Update type definitions

**Check for usages and update property access:**
- `frontend/src/pages/examiner/TestSessionLaunchPage.tsx`
- `frontend/src/services/testSessions.ts`
- Any other components using these types

## Acceptance Criteria
- [ ] All type definitions use camelCase
- [ ] All code using these types is updated
- [ ] No TypeScript errors
- [ ] No linter warnings
