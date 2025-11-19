# Backend Architecture Design

## 1. High-level Overview

Backend is an Express + TypeScript API organized into two main domains:

1. **`testDesign`**
   Responsible for authoring and configuring tests:
   - Question pools
   - Questions
   - Test templates

2. **`testAssessment`**
   Responsible for delivering, running, and evaluating tests:
   - Test sessions
   - Participants / runs
   - Answers, statistics, reports

The assessment domain depends on the design domain (read-only).
The design domain does not depend on assessment.

---

## 2. Project Structure

```text
src/
  app.ts                  # Express app (no listen)
  server.ts               # App startup (listen)

  config/
    env.ts                # Environment loading and validation
    swagger.ts            # OpenAPI/Swagger setup
    supabase.ts           # Supabase client setup

  middleware/
    auth.ts               # Authentication (Supabase JWT)
    errorHandler.ts       # Global error handler

  modules/
    auth/
      auth.routes.ts      # /api/auth/*

    testDesign/
      design.types.ts     # Question, QuestionPool, TestTemplate, etc.
      design.repository.ts# In-memory persistence + seeding for design data
      design.service.ts   # Business logic for design
      design.routes.ts    # /api/design/* endpoints

    testAssessment/
      assessment.types.ts     # TestSession, TestRun, Participant, etc.
      assessment.repository.ts# In-memory persistence for assessment data
      assessment.service.ts   # Business logic for assessment
      assessment.routes.ts    # /api/assessment/* endpoints
```

---

## 3. Modules and Responsibilities

### 3.1 `testDesign` module

**Responsibility:** Define what tests are and how they are built.

* Owns:

  * `QuestionPool`
  * `Question`
  * `Answer`
  * `TestTemplate`
* Operations:

  * CRUD for question pools and questions
  * CRUD for test templates
  * Validation:

    * Questions have valid number of answers
    * Exactly one correct answer
    * Templates reference valid pools / questions
  * Template resolution:

    * Given a template, determine which questions it uses (rules, counts, etc.)

#### `design.types.ts`

Defines domain types for design:

* `QuestionPool`
* `Question`
* `Answer`
* `TestTemplate`
* Optional:

  * `TemplateSection`
  * Design-specific DTOs (e.g., `CreateTemplateDTO`)

No session/participant types appear here.

#### `design.repository.ts`

In-memory persistence and seeding for design data.

* Keeps arrays/maps of:

  * pools
  * questions
  * templates
* Functions (examples):

  * `getPoolsByExaminer(examinerId)`
  * `getPoolById(poolId, examinerId)`
  * `createPool(data)`
  * `updatePool(poolId, examinerId, data)`
  * `deletePool(poolId, examinerId)`
  * `getTemplateById(templateId, examinerId)`
  * `listTemplates(examinerId)`
  * `createTemplate(data)`
  * `updateTemplate(templateId, examinerId, data)`
  * `deleteTemplate(templateId, examinerId)`
* Contains seeding helpers for demo data; these are internal to the module.

#### `design.service.ts`

Business logic on top of the repository.

* Example responsibilities:

  * Validate pool/question/template payloads
  * Enforce invariants (1 correct answer, 2–6 answers, etc.)
  * Materialize a template into a stable, self-contained test content package:
    * `materializeTemplate({ templateId, variantCount }) → Promise<TestContentPackage>`
    * Returns a frozen snapshot of all questions and answers, including correct answer markers.
    * This package is then used by the assessment module, which needs no further calls to design.
  * Map repository errors to domain errors (e.g. not found, invalid reference)

All write operations to design data go through this service.

#### `design.routes.ts`

HTTP layer for design endpoints, mounted under `/api/design`.

Example routes:

```text
GET    /api/design/pools
POST   /api/design/pools
GET    /api/design/pools/:poolId
PUT    /api/design/pools/:poolId
DELETE /api/design/pools/:poolId

GET    /api/design/pools/:poolId/questions
POST   /api/design/pools/:poolId/questions
PUT    /api/design/pools/:poolId/questions/:questionId
DELETE /api/design/pools/:poolId/questions/:questionId

GET    /api/design/templates
POST   /api/design/templates
GET    /api/design/templates/:templateId
PUT    /api/design/templates/:templateId
DELETE /api/design/templates/:templateId
```

Routes:

* Parse request
* Call `design.service`
* Handle success/validation errors
* Let global error handler deal with uncaught errors

---

### 3.2 `testAssessment` module

**Responsibility:** Perform and evaluate tests created by the design module.

* Owns:

  * `TestSession`
  * `TestRun` (participant's test attempt)
  * `Participant`
  * `ParticipantAnswer`
  * Statistics and report DTOs
* Operations:

  * Creating sessions from templates (single call to design module via `generateTests`)
  * Managing participants and their tests
  * Recording answers (using data stored during session creation)
  * Computing statistics and reports (using data stored during session creation)

#### `assessment.types.ts`

Defines assessment domain types:

* `TestSession`
* `TestRun` (or `ParticipantTest` / `Attempt`)
* `Participant`
* `ParticipantAnswer`
* `SessionStatistics`
* `QuestionStatistics`
* `ParticipantReport`
* Any assessment-specific DTOs

No template/question/pool definitions appear here (they are imported from `testDesign` when needed, or referenced by ID).

#### `assessment.repository.ts`

In-memory persistence for assessment data.

* Keeps arrays/maps of:

  * sessions
  * participants
  * runs/tests
  * answers
* Functions (examples):

  * `createSession(data)`
  * `getSessionById(sessionId, examinerId)`
  * `listSessionsByExaminer(examinerId)`
  * `createParticipant(sessionId, data)`
  * `recordAnswer(sessionId, participantId, answerData)`
  * `getParticipantAnswers(sessionId, participantId)`
  * `storeStatistics(sessionId, statistics)` (optional; or compute on the fly)

No design mutation (never creates or updates templates/pools/questions).

#### `assessment.service.ts`

Business logic for assessment. Calls `testDesign` service **only once** when starting sessions.

Example responsibilities:

* Start session from template:

  ```ts
  startSession(templateId, participantCount, examinerId, options) {
    // Determine how many unique test forms are needed.
    // This could be based on participantCount or other session options.
    const variantCount = calculateVariantCount(participantCount, options);

    // Single call to design module to get all necessary content.
    const testContentPackage = await designService.materializeTemplate({
      templateId,
      variantCount,
    });
    
    // Store the frozen TestContentPackage in the session.
    // This snapshot contains all questions, answers, and correct answer info.
    // No further calls to the design module will be needed for this session.
    const session = await assessmentRepository.createSession({
        ...options,
        testContentPackage,
    });

    // ... create participants and associate them with forms from the package ...
  }
  ```

* Manage participants and their runs/tests:

  * Create participant entries
  * Associate each run with a pre-generated test (from session creation)

* Record answers:

  * Validate session/run/question/answer IDs
  * Mark correctness using correct answer IDs stored during session creation
  * No calls to design module - all data is already available

* Calculate statistics:

  * Per session
  * Per question
  * Per participant
  * Uses data stored during session creation

* Build reports and DTOs for the API

`assessment.service` does not change templates/pools/questions and does not call design module after session creation.

#### `assessment.routes.ts`

HTTP layer for assessment endpoints, mounted under `/api/assessment`.

Example routes:

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

Routes:

* Parse input, call `assessment.service`
* Return DTOs to the client

---

## 4. Cross-module Interactions

Design and assessment modules interact exactly once when a session starts. The only cross-module call is from assessment to design to materialize a template into concrete test content. This call uses only design-oriented parameters, so no assessment concerns leak across.

### 4.1 Method Contract

```ts
design.materializeTemplate({
  templateId,
  variantCount,   // optional; design meaning: "how many distinct forms this template should generate"
}) → Promise<TestContentPackage>
```

### 4.2 Returned Value

A stable, frozen structure that represents all test content needed for later assessment:

```ts
interface TestContentPackage {
  templateId: string;
  forms: Array<{
    formId: string;     // ID within the package
    questions: Array<{
      questionId: string;
      text: string;
      points: number;
      answers: Array<{
        answerId: string;
        text: string;
        isCorrect: boolean;
      }>
    }>
  }>;
}
```

### 4.3 Ownership Boundary

| Concern                                          | Owner      | Visible to other module                   |
| ------------------------------------------------ | ---------- | ----------------------------------------- |
| How test forms are composed                      | Design     | Returned in `TestContentPackage`          |
| How many participants, access codes, exam window | Assessment | Not visible to design                     |
| Actual time limit chosen by examiner             | Assessment | Design may provide only recommended value |
| Reporting & scoring                              | Assessment | Uses snapshot only                        |

### 4.4 Runtime Sequence

1.  `Assessment` → `design.materializeTemplate({ templateId, variantCount })`
2.  `Assessment` stores returned `TestContentPackage` as the session snapshot.
3.  All subsequent operations use the assessment snapshot only:
    *   Question rendering
    *   Answer evaluation
    *   Scoring
    *   Reporting

### 4.5 Benefits

*   **Single cross-module interaction**
*   **No assessment concerns leaking into design**
*   **Frozen snapshot: later design edits do not affect existing sessions**
*   **Design can evolve internally (new template types, new composition rules) without modifying assessment**

This is the correct boundary for your goals: design stays volatile, assessment stays stable.

---

## 5. Application Layer (app, server, middleware, config)

### 5.1 `app.ts`

* Create Express app
* Apply global middlewares:

  * JSON body parsing
  * CORS
  * Auth (if global)
  * Swagger UI
  * Error handler
* Mount routers:

  ```ts
  app.use('/api/auth', authRouter);
  app.use('/api/design', designRouter);
  app.use('/api/assessment', assessmentRouter);
  ```

### 5.2 `server.ts`

* Load environment variables
* Import `app` from `app.ts`
* Start `app.listen(PORT)`

### 5.3 `config/`

* `env.ts` – central place to read and validate environment variables.
* `swagger.ts` – generates swagger spec from all `src/**/*.ts` or specific routes.
* `supabase.ts` – central Supabase client using backend-style env names.

### 5.4 `middleware/`

* `auth.ts` – Supabase-based authentication; provides `req.user` or similar.
* `errorHandler.ts` – centralized error handling; maps domain errors to HTTP status codes.
