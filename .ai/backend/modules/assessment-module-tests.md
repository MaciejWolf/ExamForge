# Assessment Module Test Plan

This document outlines the detailed unit test plan for the Assessment Module use cases.

## Test Strategy

- **Level**: Unit Tests (focus on Use Case logic).
- **Mocking**:
  - Repositories are in-memory and are internal to the module (see `src/design/index.ts`).
  - External dependencies (Design Module) are mocked.
- **Location**: Tests are co-located with use cases (e.g., `src/assessment/useCases/startSession.spec.ts`) or in a dedicated `tests` folder if preferred by the current pattern.
- **Naming**: `[useCase].spec.ts`

## Use Cases & Scenarios

### 1. `startSession`

**Description**: Creates a new test session based on a template.

- **Dependencies**:
  - `DesignModule.materializeTemplate(templateId)`
  - `SessionRepository.save(session)`

**Test Cases**:

- **[Success] Create Session**
  - **Arrange**: Mock `designModule.materializeTemplate` to return a valid `TestContentPackage`.
  - **Act**: Call `startSession(templateId)`.
  - **Assert**:
    - `materializeTemplate` was called with correct ID.
    - New `TestSession` created with the materialized content.
    - Session status is `OPEN` (or equivalent).
    - Session is saved to repository.
    - Returns the created session DTO.

- **[Failure] Template Not Found**
  - **Arrange**: Mock `designModule.materializeTemplate` to throw `TemplateNotFoundError`.
  - **Act**: Call `startSession(invalidId)`.
  - **Assert**: Throws `TemplateNotFoundError`.

- **[Failure] Repository Error**
  - **Arrange**: Mock repository save to throw error.
  - **Act**: Call `startSession` with valid data.
  - **Assert**: Throws internal error / Repository error.

- **[Failure] Insufficient Questions**
  - **Arrange**: Mock `designModule.materializeTemplate` to return `InsufficientQuestions` error result.
  - **Act**: Call `startSession(templateId)`.
  - **Assert**: Throws `InsufficientQuestionsError` (propagating details).

### 2. `getSession`

**Description**: Retrieves a test session by ID.

**Test Cases**:

- **[Success] Get Existing Session**
  - **Arrange**: Repository contains a session with ID `S1`.
  - **Act**: Call `getSession('S1')`.
  - **Assert**: Returns correct session object.

- **[Failure] Session Not Found**
  - **Arrange**: Repository is empty.
  - **Act**: Call `getSession('NonExistent')`.
  - **Assert**: Throws `SessionNotFoundError`.

### 3. `listSessions`

**Description**: Lists all test sessions.

**Test Cases**:

- **[Success] List All**
  - **Arrange**: Repository has 3 sessions.
  - **Act**: Call `listSessions()`.
  - **Assert**: Returns array of 3 sessions.

- **[Success] Empty List**
  - **Arrange**: Repository is empty.
  - **Act**: Call `listSessions()`.
  - **Assert**: Returns empty array.

### 4. `deleteSession`

**Description**: Deletes a test session.

**Test Cases**:

- **[Success] Delete Existing**
  - **Arrange**: Repository has session `S1`.
  - **Act**: Call `deleteSession('S1')`.
  - **Assert**:
    - Repository no longer contains `S1`.
    - Returns success/void.

- **[Failure] Not Found**
  - **Arrange**: Repository empty.
  - **Act**: Call `deleteSession('S1')`.
  - **Assert**: Throws `SessionNotFoundError` (or returns silently if idempotent, generally throw if strict).

### 5. `createParticipant`

**Description**: Adds a participant (candidate) to a specific session.

**Test Cases**:

- **[Success] Add Participant**
  - **Arrange**: Session `S1` exists.
  - **Act**: Call `createParticipant('S1', { email: 'test@example.com', name: 'John' })`.
  - **Assert**:
    - Participant is saved to repository (linked to S1).
    - Returns new participant details (including ID/Access Token).

- **[Failure] Session Not Found**
  - **Arrange**: Session `S1` does not exist.
  - **Act**: Call `createParticipant('S1', ...)`.
  - **Assert**: Throws `SessionNotFoundError`.

- **[Failure] Validation Error**
  - **Act**: Call with invalid email or missing name.
  - **Assert**: Throws validation error.

### 6. `getParticipant`

**Description**: Retrieves participant details.

**Test Cases**:

- **[Success] Get Existing**
  - **Arrange**: Participant `P1` exists.
  - **Act**: Call `getParticipant('P1')`.
  - **Assert**: Returns participant DTO.

- **[Failure] Not Found**
  - **Act**: Call `getParticipant('BadID')`.
  - **Assert**: Throws `ParticipantNotFoundError`.

### 7. `listParticipants`

**Description**: Lists participants for a given session.

**Test Cases**:

- **[Success] List for Session**
  - **Arrange**: Session `S1` has 2 participants.
  - **Act**: Call `listParticipants('S1')`.
  - **Assert**: Returns count of 2.

- **[Failure] Session Not Found**
  - **Arrange**: Session `S1` does not exist.
  - **Act**: Call `listParticipants('S1')`.
  - **Assert**: Throws `SessionNotFoundError`.

### 8. `recordAnswer`

**Description**: Records an answer for a participant.

**Test Cases**:

- **[Success] Record Valid Answer**
  - **Arrange**: Participant `P1` exists. Question `Q1` is part of their session.
  - **Act**: Call `recordAnswer('P1', 'Q1', { selectedOptionId: 'A' })`.
  - **Assert**:
    - Answer is saved in repository.
    - Returns confirmation.

- **[Failure] Invalid Question**
  - **Arrange**: Question `Q_Bad` is NOT in the session package.
  - **Act**: Call `recordAnswer`.
  - **Assert**: Throws `InvalidQuestionError`.

- **[Failure] Participant Not Found**
  - **Act**: Call with invalid participant ID.
  - **Assert**: Throws `ParticipantNotFoundError`.

- **[Failure] Session Closed** (Optional Business Rule)
  - **Arrange**: Session is marked as `FINISHED` or `CLOSED`.
  - **Act**: Call `recordAnswer`.
  - **Assert**: Throws `SessionClosedError`.

### 9. `getAnswers`

**Description**: Retrieves all answers for a participant.

**Test Cases**:

- **[Success] Retrieve Answers**
  - **Arrange**: Participant `P1` has recorded 5 answers.
  - **Act**: Call `getAnswers('P1')`.
  - **Assert**: Returns array of 5 answers.

### 10. `calculateStatistics`

**Description**: Computes stats for sessions and questions.

**Test Cases**:

- **[Success] Session Statistics**
  - **Arrange**: Session `S1` has 10 participants. 8 passed, 2 failed (mocked answer data).
  - **Act**: Call `calculateStatistics` (scoped to ID or generic).
  - **Assert**: Returns correct pass rate, avg score, etc.

- **[Success] Question Statistics**
  - **Arrange**: Question `Q1` answered by 50 participants.
  - **Act**: Request stats.
  - **Assert**: Returns correct distribution of options selected.

### 11. `generateReport`

**Description**: Builds comprehensive reports.

**Test Cases**:

- **[Success] Generate Session Report**
  - **Arrange**: Completed session with participants and answers.
  - **Act**: Call `generateReport('S1')`.
  - **Assert**: Returns aggregations, charts data (structure), list of top performers, etc.
