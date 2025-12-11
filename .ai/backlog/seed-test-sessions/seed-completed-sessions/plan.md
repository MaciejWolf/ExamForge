# seed-completed-sessions

Goal:
Create seed data for completed/past test sessions with deterministic content for testing historical views and analytics.

Context:
- Completed sessions have both dates in the past and status='completed'
- Also includes aborted sessions (status='aborted')
- Should represent various scenarios (all completed, some aborted, etc.)

Tasks:
- [ ] create-completed-session-seeds
    - [ ] Create `backend/src/scripts/seeds/sessions/completedSessions.ts`
    - [ ] Define 3-4 completed session scenarios with past dates
    - [ ] Include 1 aborted session for edge case testing
- [ ] integrate-with-seed-script
    - [ ] Add completed sessions to main seed script
    - [ ] Ensure proper date ordering (oldest first)
    - [ ] Log summary of completed sessions

Dependencies:
- Depends on: [../deterministic-randomization/plan.md](../deterministic-randomization/plan.md)
