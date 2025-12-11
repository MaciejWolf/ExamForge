# seed-future-sessions

Goal:
Create seed data for scheduled/future test sessions to test upcoming session views and scheduling features.

Context:
- Future sessions have both startTime and endTime in the future
- Status should be 'open' (scheduled but not started)
- Used for testing calendar views, reminders, etc.

Tasks:
- [ ] create-future-session-seeds
    - [ ] Create `backend/src/scripts/seeds/sessions/futureSessions.ts`
    - [ ] Define 2-3 future session scenarios with future dates
    - [ ] Vary time ranges (tomorrow, next week, next month)
- [ ] integrate-with-seed-script
    - [ ] Add future sessions to main seed script
    - [ ] Log summary of future sessions with scheduled times

Dependencies:
- Depends on: [../deterministic-randomization/plan.md](../deterministic-randomization/plan.md)
