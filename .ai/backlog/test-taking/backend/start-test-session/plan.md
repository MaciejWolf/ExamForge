# start-test-session (Participant Start)

Goal: Implement logic for participants to start their test instance (using `accessCode`), recording the start timestamp and enforcing validation rules.

## Approach
- **Pattern**: Test-First / TDD (Red-Green-Refactor)
- **Component**: `startTestInstance` use case (distinct from `startSession` which creates the session)
- **Scope**: Domain logic first, API endpoint last.

## Tasks

### Phase 1: TDD Domain Logic
- [x] **tdd-setup**
    - Create empty `useCases/startTestInstance.ts`
    - Create `tests/startTestInstance.test.ts`
    - Setup mock dependencies (`TestInstanceRepository`, `SessionRepository`, `Clock`)
- [x] **test-case-1-successful-start**
    - *Test*: Given valid access code and open session, when `startTestInstance` is called, then `startedAt` is updated to current time.
    - *Implement*: Basic fetch instance -> update timestamp -> save logic.
- [X] **test-case-2-already-started**
    - *Test*: Given instance with existing `startedAt`, when called, return `TestAlreadyStarted` error.
    - *Implement*: Add check for `instance.startedAt`.
- [X] **test-case-3-not-open-yet**
    - *Test*: Given session `startTime` in future, when called, return `TestNotOpenYet` error.
    - *Implement*: Fetch session -> check `now < startTime`.
- [X] **test-case-4-expired**
    - *Test*: Given session `endTime` in past, when called, return `TestExpired` error.
    - *Implement*: Check `now > endTime`.
- [ ] **test-case-5-invalid-code**
    - *Test*: Given non-existent access code, return `InvalidAccessCode` error.
    - *Implement*: Handle null/undefined from repository lookup.
- [X] **test-case-6-session-closed**
    - *Test*: Given session status is `completed` or `aborted`, return `SessionClosed` error.
    - *Implement*: Check `session.status !== 'open'`.

### Phase 2: Integration
- [ ] **implement-endpoint**
    - Create controller/route (e.g., `POST /api/assessment/start`)
    - Extract `accessCode` from request body
    - Invoke `startTestInstance` use case
    - Return success or map errors to HTTP status codes

## Context

**Use Case:** `startTestInstance`
- Records `startedAt` timestamp on test instance
- Called when participant begins taking the test
- Should prevent starting if already started, expired, or session is closed
- Follow vertical slice architecture pattern
