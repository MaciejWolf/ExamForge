# seed-active-sessions

Goal:
Create seed data for active test sessions (currently running) with multiple test instances using deterministic question selection.

Context:
- Active sessions have startTime in the past and endTime in the future
- Each session should have 3-5 test instances (different participants)
- Uses assessment module's `startSession` use case internally

Tasks:
- [ ] create-session-seed-data
    - [ ] Create `backend/src/scripts/seeds/sessions/activeSessions.ts`
    - [ ] Define 2-3 active session seeds with metadata (dates, template refs, participants)
    - [ ] Use existing seeded templates as references
- [ ] implement-session-seeding
    - [ ] Update `backend/src/scripts/seed.ts` to seed sessions after templates
    - [ ] Configure assessment module with deterministic materializeTemplate
    - [ ] Call startSession for each session seed
    - [ ] Map participant identifiers to deterministic seeds
- [ ] add-logging
    - [ ] Log session creation with IDs and access codes
    - [ ] Display summary of seeded active sessions

Dependencies:
- Depends on: [../deterministic-randomization/plan.md](../deterministic-randomization/plan.md)
