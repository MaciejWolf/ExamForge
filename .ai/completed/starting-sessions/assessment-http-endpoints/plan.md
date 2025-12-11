# assessment-http-endpoints

Goal:
Create the HTTP adapter layer for the assessment module and integrate it into the main Express application. This exposes the existing startSession and listSessions use cases as REST endpoints accessible to the frontend.

Tasks:
- [ ] implementation
- [ ] integration-tests

Context:
- Reference implementation: `backend/src/design/http.ts`
- Follow vertical slice pattern: http.ts should only import from module's index.ts
- Use Result pattern for error handling
- Main app file: `backend/src/index.ts`
- Pattern: Similar to how design module is wired in index.ts
- Assessment module needs materializeTemplate function from design module
- Target files: 
  - `backend/src/assessment/http.ts` (new file)
  - `backend/src/index.ts` (modify)
- Target API path: `/api/assessment/sessions`

Open questions:
- Should we use middleware for request validation or inline validation?
- Do we need pagination for listSessions endpoint now or later?

