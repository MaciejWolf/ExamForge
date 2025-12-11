# finish-test-session

Goal:
Implement endpoint for participants to finish their test session, recording completion timestamp and finalizing submission.

## Tasks
- [ ] implement-endpoint
- [ ] unit-tests

## Context

**implement-endpoint:**
- Records endDate timestamp on test instance
- Marks test session as completed
- Calculates test duration
- Finalizes answer submission
- Follow vertical slice architecture pattern

**unit-tests:**
- Unit tests for finish session endpoint
- Test success case: valid session completion
- Test validation: session not started
- Test validation: already finished
- Test validation: invalid access code
- Follow vertical slice testing patterns

**Test Cases (Given/When/Then):**

1.  **Successful Completion**
    *   **Given** a test instance that has been started (has `startedAt`)
    *   **And** the test instance has not been completed yet (`completedAt` is undefined)
    *   **When** the participant requests to finish the test with a valid `accessCode`
    *   **Then** the test instance should be updated with the current server timestamp as `completedAt`
    *   **And** the result should be successful (returning completion details)

2.  **Validation: Not Started**
    *   **Given** a test instance that has **not** been started (`startedAt` is undefined)
    *   **When** the participant requests to finish the test
    *   **Then** the operation should fail
    *   **And** the error should indicate `TestNotStarted`

3.  **Validation: Already Finished**
    *   **Given** a test instance that has already been completed (`completedAt` is present)
    *   **When** the participant requests to finish the test again
    *   **Then** the operation should fail
    *   **And** the error should indicate `TestAlreadyFinished`
    4.  **Validation: Test Instance Not Found**
        *   **Given** there is no test instance for the provided test ID
        *   **When** the participant requests to finish the test
        *   **Then** the operation should fail
        *   **And** the error should indicate `TestInstanceNotFound`
