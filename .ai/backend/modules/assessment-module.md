# Assessment Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Perform and evaluate tests created by the design module.

## Use Cases

- `startSession` - Creates session from template (calls design module once via `materializeTemplate`)
- `getSession` - Retrieves a test session by ID
- `listSessions` - Lists all test sessions
- `deleteSession` - Deletes a test session
- `createParticipant` - Creates a new participant for a session
- `getParticipant` - Retrieves a participant by ID
- `listParticipants` - Lists all participants for a session
- `recordAnswer` - Records a participant's answer to a question
- `getAnswers` - Retrieves all answers for a participant
- `calculateStatistics` - Computes statistics per session, question, and participant
- `generateReport` - Builds reports and DTOs for a session

## Contracts

### Domain Types

- `TestSession` - Represents a test session created from a template
- `TestRun` (or `ParticipantTest` / `Attempt`) - Represents a participant's test attempt
- `Participant` - Represents a participant in a test session
- `ParticipantAnswer` - Represents a participant's answer to a question
- `SessionStatistics` - Statistics aggregated at the session level
- `QuestionStatistics` - Statistics aggregated at the question level
- `ParticipantReport` - Report for a specific participant
- Assessment-specific DTOs and error unions

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

## Dependencies

The assessment module depends on the design module (read-only). When starting a session, it calls `designModule.materializeTemplate()` to obtain a frozen `TestContentPackage`.

See `backend-architecture.md` for details on cross-module interactions.

