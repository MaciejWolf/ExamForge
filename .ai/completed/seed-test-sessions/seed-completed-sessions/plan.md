# seed-completed-sessions

Goal:
Create seed data for completed/past test sessions with deterministic content for testing historical views and analytics.

Context:
- Completed sessions have both dates in the past and status='completed'
- Also includes aborted sessions (status='aborted')
- Should represent various scenarios (all completed, some aborted, etc.)

## Sessions to Seed

### Session 1: General Science Assessment (Completed - 7 days ago)
- **Template**: General Science Assessment
- **Duration**: 2 hours (120 minutes)
- **Examiner**: examiner-001
- **Date**: 7 days ago, 9:00 AM - 11:00 AM
- **Status**: Completed
- **Participants**: 4 students, all finished
  - Alice Johnson (seed: alice-sci-past-001) - Started on time, 100% complete
  - Bob Martinez (seed: bob-sci-past-001) - Started 10 min late, 100% complete
  - Carol Wong (seed: carol-sci-past-001) - Started on time, 100% complete
  - David Smith (seed: david-sci-past-001) - Started 20 min late, 100% complete

### Session 2: STEM Fundamentals (Completed - 3 days ago)
- **Template**: STEM Fundamentals
- **Duration**: 2.5 hours (150 minutes)
- **Examiner**: examiner-002
- **Date**: 3 days ago, 1:00 PM - 3:30 PM
- **Status**: Completed
- **Participants**: 3 students, all finished
  - Emma Davis (seed: emma-stem-past-001) - Started on time, 100% complete
  - Frank Lee (seed: frank-stem-past-001) - Started on time, 100% complete
  - Grace Kim (seed: grace-stem-past-001) - Started 5 min late, 100% complete

### Session 3: Modern History Challenge (Completed - 5 days ago)
- **Template**: Modern History Challenge
- **Duration**: 4 hours (240 minutes)
- **Examiner**: examiner-003
- **Date**: 5 days ago, 8:00 AM - 12:00 PM
- **Status**: Completed
- **Participants**: 5 students, all finished
  - Jack Wilson (seed: jack-hist-past-001) - Started on time, 100% complete
  - Karen Taylor (seed: karen-hist-past-001) - Started on time, 100% complete
  - Leo Anderson (seed: leo-hist-past-001) - Started 30 min late, 100% complete
  - Maria Chen (seed: maria-hist-past-001) - Started on time, 100% complete
  - Noah Patel (seed: noah-hist-past-001) - Started 15 min late, 100% complete

### Session 4: The Polymath General Knowledge (Aborted - 2 days ago)
- **Template**: The Polymath General Knowledge
- **Duration**: 3 hours (180 minutes, but aborted after ~90 minutes)
- **Examiner**: examiner-001
- **Date**: 2 days ago, 10:00 AM - 1:00 PM (scheduled), aborted at 11:30 AM
- **Status**: Aborted (technical difficulties)
- **Participants**: 4 students, varied completion when aborted
  - Oliver Scott (seed: oliver-poly-abort-001) - Started on time, 65% complete when aborted
  - Penelope Reed (seed: penelope-poly-abort-001) - Started on time, 70% complete when aborted
  - Quinn Morgan (seed: quinn-poly-abort-001) - Started 10 min late, 55% complete when aborted
  - Rachel Foster (seed: rachel-poly-abort-001) - Started on time, 60% complete when aborted

## Notes
- All completed sessions have 100% completion for all participants
- The aborted session shows partial completion (55-70%) representing realistic interruption
- Seeds are unique and distinct from active session seeds to prevent collision
- Dates are relative to current time for consistent test behavior
- Participant names are unique across all sessions (active and completed)

Tasks:
- [x] create-completed-session-seeds
    - [x] Create `backend/src/scripts/seeds/sessions/completedSessions.ts`
    - [x] Define 3-4 completed session scenarios with past dates
    - [x] Include 1 aborted session for edge case testing
- [x] integrate-with-seed-script
    - [x] Add completed sessions to main seed script
    - [x] Ensure proper date ordering (oldest first)
    - [x] Log summary of completed sessions

Dependencies:
- Depends on: [../deterministic-randomization/plan.md](../deterministic-randomization/plan.md)
