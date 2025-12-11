# implement-report-data-service

Goal:
Create service layer functions to fetch real test session data from the database and calculate statistics and question analysis for the session report.

Context:
- Builds on hardcoded endpoint created in previous task
- Uses Drizzle ORM to query database
- Follows vertical slice architecture with pure functions

## Data to Fetch

### From Database:
- Test session details (session, template info)
- All participants for the session
- All test instances (started sessions)
- All test responses (answers)
- Questions and correct answers from question bank

### To Calculate:
- Per-participant scores and status
- Aggregate statistics (average, highest, lowest scores)
- Completion counts by status
- Per-question analysis (correct response rates)

## Files to Create

**Create:**
- `backend/src/assessment/services/sessionReport.ts` - Core report generation logic
- `backend/src/assessment/services/sessionReport.test.ts` - Unit tests
- `backend/src/assessment/db/queries/sessionReportQueries.ts` - Database queries
- `backend/src/assessment/db/queries/sessionReportQueries.test.ts` - Query tests

## Service Functions

### `generateSessionReport(sessionId: string)`
Main orchestrator function that:
1. Fetches session and template data
2. Fetches all participants and their test instances
3. Fetches all responses for completed/in-progress tests
4. Calculates participant scores
5. Generates aggregate statistics
6. Calculates per-question analysis
7. Returns complete `TestSessionReport`

### Supporting Functions:
- `calculateParticipantScore(responses, questions)` - Score calculation
- `calculateStatistics(participants)` - Aggregate stats
- `analyzeQuestionPerformance(responses, questions)` - Per-question analysis
- `mapParticipantStatus(testInstance)` - Determine participant status

## Database Queries

### `getSessionWithTemplate(sessionId)`
- Join session with template and template details
- Return session metadata with template name

### `getSessionParticipants(sessionId)`
- Fetch all participants for session
- Include test instance if started
- Include responses if in-progress or completed

### `getSessionQuestions(sessionId)`
- Get all questions used across session's test instances
- Include correct answer information
- Deduplicate questions (same question shown to multiple participants)

## Edge Cases to Handle
- Session not found
- Session with no participants
- Participants who haven't started
- In-progress tests (partial responses)
- Questions with no responses yet

Tasks:
- [ ] create-database-queries
- [ ] implement-score-calculation
- [ ] implement-statistics-calculation
- [ ] implement-question-analysis
- [ ] create-orchestrator-function
- [ ] write-comprehensive-tests

Dependencies:
- Depends on: [../create-hardcoded-report-endpoint/plan.md](../create-hardcoded-report-endpoint/plan.md)
- Requires seeded test data for testing

## Acceptance Criteria
- [ ] All service functions are pure and testable
- [ ] Database queries use Drizzle ORM properly
- [ ] Statistics match actual participant data
- [ ] Question analysis accurately reflects responses
- [ ] Handles all edge cases gracefully
- [ ] 100% test coverage for core logic
- [ ] Performance: generates report in < 200ms for 100 participants
