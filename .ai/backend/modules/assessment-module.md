# Assessment Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Perform and evaluate tests created by the design module.

## Owns

- `TestSession`
- `TestRun` (participant's test attempt)
- `Participant`
- `ParticipantAnswer`
- Statistics and report DTOs

## Operations

- Creating sessions from templates (single call to design module via `materializeTemplate`)
- Managing participants and their tests
- Recording answers (using data stored during session creation)
- Computing statistics and reports (using data stored during session creation)

## Domain Types

- `TestSession`
- `TestRun` (or `ParticipantTest` / `Attempt`)
- `Participant`
- `ParticipantAnswer`
- `SessionStatistics`
- `QuestionStatistics`
- `ParticipantReport`
- Assessment-specific DTOs and error unions

## Key Use Cases

- `startSession` - Creates session from template (calls design module once)
- `createParticipant`, `getParticipant`, `listParticipants`
- `recordAnswer`, `getAnswers`
- `calculateStatistics` - Per session, question, and participant
- `generateReport` - Build reports and DTOs

## API Routes

```text
POST   /api/assessment/sessions
GET    /api/assessment/sessions
GET    /api/assessment/sessions/:sessionId
DELETE /api/assessment/sessions/:sessionId

GET    /api/assessment/sessions/:sessionId/participants
POST   /api/assessment/sessions/:sessionId/participants

POST   /api/assessment/sessions/:sessionId/participants/:participantId/answers
GET    /api/assessment/sessions/:sessionId/participants/:participantId/answers

GET    /api/assessment/sessions/:sessionId/report
GET    /api/assessment/sessions/:sessionId/questions/statistics
```

## Cross-Module Interaction

The assessment module depends on the design module (read-only). When starting a session, it calls `designModule.materializeTemplate()` to obtain a frozen `TestContentPackage`. See `backend-architecture.md` for details on cross-module interactions.

