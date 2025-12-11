# backend-test-access

Goal:
Implement backend API endpoints for test participants to validate access codes, start test sessions, and finish test sessions. Focus on tracking test instance lifecycle with startDate and endDate.

## Tasks
- [ ] validate-access-code
- [ ] [start-test-session](start-test-session/plan.md)
- [ ] [finish-test-session](finish-test-session/plan.md)

## Context

**validate-access-code:**
- Endpoint to validate participant's access code
- Returns test details if valid (template info, time limits, etc.)
- Returns error if code is invalid or test is not available

**start-test-session:**
- See [start-test-session/plan.md](start-test-session/plan.md)

**finish-test-session:**
- See [finish-test-session/plan.md](finish-test-session/plan.md)
