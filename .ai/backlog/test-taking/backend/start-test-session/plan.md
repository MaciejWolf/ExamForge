# start-test-session

Goal:
Implement endpoint for participants to start their test session, recording the start timestamp and preventing invalid starts.

## Tasks
- [ ] implement-endpoint
- [ ] unit-tests

## Context

**implement-endpoint:**
- Records startDate timestamp on test instance
- Called when participant begins taking the test
- Should prevent starting if already started or expired
- Follow vertical slice architecture pattern

**unit-tests:**
- Unit tests for start session endpoint using Vertical Slice patterns.

**Test Cases (Given/When/Then):**

1.  **Successful Start**
    *   **Given** a valid test session exists with an `open` status
    *   **And** the current time is within the session's `startTime` and `endTime` window
    *   **And** the participant's test instance has **not** been started yet (`startedAt` is undefined)
    *   **When** the participant requests to start the session with a valid `accessCode`
    *   **Then** the test instance should be updated with the current server timestamp as `startedAt`
    *   **And** the result should be successful (returning the test content or instance details)

2.  **Validation: Already Started**
    *   **Given** a test instance that has already been started (has a `startedAt` timestamp)
    *   **When** the participant requests to start the session again with the same `accessCode`
    *   **Then** the operation should fail
    *   **And** the error should indicate `TestAlreadyStarted`

3.  **Validation: Test Not Open Yet (Future)**
    *   **Given** a test session is scheduled for the future (current time < `startTime`)
    *   **When** the participant requests to start the session
    *   **Then** the operation should fail
    *   **And** the error should indicate `TestNotOpenYet`

4.  **Validation: Test Expired**
    *   **Given** a test session has ended (current time > `endTime`)
    *   **When** the participant requests to start the session
    *   **Then** the operation should fail
    *   **And** the error should indicate `TestExpired`

5.  **Validation: Invalid Access Code**
    *   **Given** no test instance exists for the provided `accessCode`
    *   **When** the participant requests to start a session with this code
    *   **Then** the operation should fail
    *   **And** the error should indicate `InvalidAccessCode` or `TestNotFound`

6.  **Validation: Session Cancelled/Closed**
    *   **Given** a test session exists but its status is `cancelled` or `closed`
    *   **When** the participant requests to start the session
    *   **Then** the operation should fail
    *   **And** the error should indicate `SessionClosed`
