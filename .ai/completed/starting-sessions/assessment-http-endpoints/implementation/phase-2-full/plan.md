# Phase 2: Full Implementation & DB Integration

Goal: Move from mock implementation to full database integration for the Assessment module HTTP layer.

## Tasks
- [ ] connect-real-repository
  - Replace mock data in `GET /sessions` with calls to `module.listSessions`
- [ ] implement-start-session
  - Add `POST /sessions` endpoint
  - Connect to `module.startSession`
- [ ] add-request-validation
  - Validate request bodies and query params
- [ ] map-errors-to-http-status
  - Implement error handling for domain errors
- [ ] verify-cors-configuration
- [ ] update-frontend-integration
  - Update `CreateSessionRequest` interface in `frontend/src/services/api.ts` to match backend expectation:
    ```typescript
    export interface CreateSessionRequest {
      templateId: string;
      examinerId: string; // Added field
      timeLimitMinutes: number;
      participantIdentifiers: string[]; // Renamed from 'participants'
      startTime: Date;
      endTime: Date;
    }
    ```
  - Update `TestSessionLaunchPage` to use fixed 'test-examiner' ID and handle response format:
    ```typescript
    // In handleSubmit:
    const response = await testSessionsApi.create({
      templateId: selectedTemplateId,
      examinerId: 'test-examiner', // Hardcoded
      timeLimitMinutes,
      participantIdentifiers: parsedParticipants, // Updated property name
      startTime: startDateTime,
      endTime: endDateTime,
    });
    
    // Fetch full session details since create only returns ID
    // Note: Assuming backend returns { sessionId: string }
    // Ideally we should implement a fetch here
    ```
  - Implement "fetch after create" pattern in `TestSessionLaunchPage` (call `getById` after `create` returns ID) if backend response remains minimal.

## Dependencies
- Depends on: [../phase-1-mock/plan.md](../phase-1-mock/plan.md)
