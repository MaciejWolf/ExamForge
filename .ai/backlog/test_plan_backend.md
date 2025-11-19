# Backend Test Plan

This document outlines the testing strategy for the ExamForge backend, based on the [Backend Architecture](backend-architecture.md).

## 1. Testing Strategy Overview

The testing strategy focuses on ensuring the reliability of the two main domains: `testDesign` and `testAssessment`.

*   **Unit Tests**: Focus on business logic within services and domain models in isolation.
*   **Integration Tests (API)**: Verify individual API endpoints work as expected, connecting Controller -> Service -> Repository. These run against a test database.
*   **End-to-End (E2E) Tests**: Validate complete user workflows (scenarios) involving multiple API calls in sequence, treating the backend as a "black box".

## 2. Unit Testing

### 2.1 `testDesign` Module
*   **Services**: `design.service.ts`
    *   **`createPool`, `updatePool`**: Verify validation logic (e.g., required fields).
    *   **`createTemplate`**: Verify template structure validation.
    *   **`materializeTemplate`**:
        *   Verify it correctly selects questions based on template rules.
        *   Verify it returns a `TestContentPackage` with the correct structure.
        *   Verify it handles insufficient questions in a pool gracefully (or throws expected errors).

### 2.2 `testAssessment` Module
*   **Services**: `assessment.service.ts`
    *   **`startSession`**:
        *   Mock `designService.materializeTemplate`.
        *   Verify it creates a session with the returned `TestContentPackage`.
        *   Verify it generates the correct number of variants/forms.
    *   **`recordAnswer`**:
        *   Verify it correctly matches participant answers to the session's frozen content.
        *   Verify it prevents changing answers if not allowed (if applicable).
    *   **Scoring Logic**:
        *   Verify score calculation based on `TestContentPackage` correct answers.
        *   Test edge cases (partial credit, no answers, etc. - if supported).

## 3. Integration Testing

Integration tests will spin up the Express app and hit the API endpoints.

### 3.1 Design API (`/api/design`)
*   **Flow: Create Test Content**
    1.  `POST /api/design/pools`: Create a question pool.
    2.  `POST /api/design/pools/:id/questions`: Add questions to the pool.
    3.  `POST /api/design/templates`: Create a test template referencing the pool.
    4.  `GET /api/design/templates/:id`: Verify the template is retrievable.

### 3.2 Assessment API (`/api/assessment`)
*   **Flow: Run a Session**
    *   *Prerequisite*: Seed data via Design API (or internal service calls).
    1.  `POST /api/assessment/sessions`: Start a session using the created template.
    2.  `POST /api/assessment/sessions/:id/participants`: Add a participant.
    3.  `GET /api/assessment/sessions/:id/participants/:pid/test`: Retrieve the test form for the participant.
    4.  `POST .../answers`: Submit answers.
    5.  `GET .../report`: Verify the report generation.

## 4. End-to-End (E2E) Tests

E2E tests simulate real usage scenarios by chaining multiple API requests to complete a full workflow.

*   **Scenario: The "Happy Path"**
    1.  **Examiner** logs in (mocked auth or test user).
    2.  **Examiner** creates a Pool "Math 101".
    3.  **Examiner** adds 5 questions to "Math 101".
    4.  **Examiner** creates a Template "Midterm" using "Math 101".
    5.  **Examiner** starts a Session for "Midterm".
    6.  **Student** (simulated) joins the session.
    7.  **Student** submits answers.
    8.  **Examiner** views the report and sees the correct score.

## 5. Test Tools & Infrastructure

*   **Test Runner**: Vitest (fast, modern, native ESM support).
*   **API Testing**: Supertest (works well with Vitest).
*   **Mocks**: Vitest built-in mocking.
*   **CI/CD**: Run all unit and integration tests on every PR.
