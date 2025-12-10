# implementation

Goal:
Implement the HTTP adapter layer and wire it into the Express application.

Tasks:
- [ ] create-http-adapter-file
- [ ] implement-start-session-endpoint
- [ ] implement-list-sessions-endpoint
- [ ] map-errors-to-http-status
- [ ] add-request-validation
- [ ] configure-assessment-module
- [ ] create-assessment-router
- [ ] mount-router-in-app
- [ ] verify-cors-configuration

Context:
- Target file: `backend/src/assessment/http.ts`
- Reference: `backend/src/design/http.ts`
- Mount point: `backend/src/index.ts`
- Follow vertical slice pattern: only import from module's index.ts
- Use Result pattern for error handling


