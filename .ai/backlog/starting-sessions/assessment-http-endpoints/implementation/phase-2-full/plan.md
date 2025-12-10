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

## Dependencies
- Depends on: [../phase-1-mock/plan.md](../phase-1-mock/plan.md)

