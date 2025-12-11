# Feature: starting-sessions

Goal:
Enable examiners to start test sessions with full backend-frontend integration. Connect the existing assessment module's business logic to REST endpoints, secure them with authentication, and ensure the frontend can successfully launch and manage test sessions.

Tasks:
- [ ] [assessment-http-endpoints](./assessment-http-endpoints/plan.md)
- [ ] [authentication-middleware](./authentication-middleware/plan.md)

Context:
- Backend business logic already exists in `backend/src/assessment/` (startSession, listSessions use cases)
- Frontend UI already exists in `frontend/src/pages/examiner/TestSessionLaunchPage.tsx`
- Following vertical slice architecture pattern (see `.cursor/rules/vertical-slice-architecture.mdc`)
- Design module already has working HTTP layer as reference (`backend/src/design/http.ts`)

Dependencies:
- Supabase authentication must be available
- Design module's `materializeTemplate` use case is required by assessment module

