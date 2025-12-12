# fetch-basic-session-data

Goal:
Replace hardcoded session fields with real data from database, fetching session and template information.

Context:
- Current implementation returns hardcoded session data
- Need to fetch from `test_sessions` table
- Need to lookup template name from templates repository
- This is the simplest replacement - direct database reads

Fields to populate:
- `session.id` (already using parameter)
- `session.templateId` (from test_sessions)
- `session.templateName` (from templates via repository)
- `session.examinerId` (from test_sessions)
- `session.timeLimitMinutes` (from test_sessions)
- `session.status` (from test_sessions with mapping)
- `session.createdAt` (from test_sessions)

Tasks:
- [ ] Add SessionRepository dependency to getSessionReport
- [ ] Add TemplateRepository dependency for template name lookup
- [ ] Fetch session by ID and handle not found case
- [ ] Fetch template name by templateId
- [ ] Update tests to verify session data fetching
- [ ] Keep rest of report hardcoded for now

