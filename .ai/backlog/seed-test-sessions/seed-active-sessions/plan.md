# seed-active-sessions

Goal:
Create seed data for active test sessions (currently running) with multiple test instances using deterministic question selection.

Context:
- Active sessions have startTime in the past and endTime in the future
- Each session should have 3-5 test instances (different participants)
- Uses assessment module's `startSession` use case internally

## Session Seeds

### Session 1: Science Assessment - Morning Batch
- Template: "General Science Assessment"
- Start Time: Today at 9:00 AM (2 hours ago)
- End Time: Today at 11:00 AM (in progress)
- Duration: 2 hours
- Participants (4 test instances):
  - Alice Johnson (seed: alice-sci-001) - Started on time, 60% complete
  - Bob Martinez (seed: bob-sci-001) - Started 15 mins late, 45% complete
  - Carol Wong (seed: carol-sci-001) - Started on time, 75% complete
  - David Smith (seed: david-sci-001) - Started 30 mins late, 30% complete

### Session 2: STEM Fundamentals - Afternoon Session
- Template: "STEM Fundamentals"
- Start Time: Today at 1:00 PM (30 minutes ago)
- End Time: Today at 3:30 PM (2 hours remaining)
- Duration: 2.5 hours
- Participants (5 test instances):
  - Emma Davis (seed: emma-stem-001) - Started on time, 20% complete
  - Frank Lee (seed: frank-stem-001) - Started on time, 25% complete
  - Grace Kim (seed: grace-stem-001) - Started 5 mins late, 18% complete
  - Henry Brown (seed: henry-stem-001) - Started on time, 22% complete
  - Isabel Garcia (seed: isabel-stem-001) - Just started, 5% complete

### Session 3: History Challenge - Extended Session
- Template: "Modern History Challenge"
- Start Time: Today at 8:00 AM (3 hours ago)
- End Time: Today at 12:00 PM (1 hour remaining)
- Duration: 4 hours
- Participants (3 test instances):
  - Jack Wilson (seed: jack-hist-001) - Started on time, 85% complete
  - Karen Taylor (seed: karen-hist-001) - Started on time, 90% complete
  - Leo Anderson (seed: leo-hist-001) - Started 1 hour late, 55% complete

Notes:
- Each participant's seed value ensures deterministic question selection from their template's pools
- Completion percentages will be simulated by answering a proportional number of questions
- Start time offsets create realistic variation in progress
- Access codes are auto-generated per participant instance

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
