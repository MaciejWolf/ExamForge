# seed-future-sessions

Goal:
Create seed data for scheduled/future test sessions to test upcoming session views and scheduling features.

Context:
- Future sessions have both startTime and endTime in the future
- Status should be 'open' (scheduled but not started)
- Used for testing calendar views, reminders, etc.

## Future Sessions to Seed

### Session 1: Tomorrow Morning
- **Template**: General Science Assessment
- **Scheduled**: Tomorrow at 9:00 AM - 11:00 AM (2 hours)
- **Time Limit**: 120 minutes
- **Examiner**: examiner-001
- **Participants**: 5 students
  - Alice Johnson (seed: alice-sci-future-001)
  - Bob Martinez (seed: bob-sci-future-001)
  - Carol Wong (seed: carol-sci-future-001)
  - David Smith (seed: david-sci-future-001)
  - Emma Davis (seed: emma-sci-future-001)
- **Status**: open (scheduled)
- **Purpose**: Test near-future session views, reminder notifications

### Session 2: Next Week Afternoon
- **Template**: STEM Fundamentals
- **Scheduled**: 7 days from now at 2:00 PM - 4:30 PM (2.5 hours)
- **Time Limit**: 150 minutes
- **Examiner**: examiner-002
- **Participants**: 3 students
  - Frank Lee (seed: frank-stem-future-001)
  - Grace Kim (seed: grace-stem-future-001)
  - Henry Brown (seed: henry-stem-future-001)
- **Status**: open (scheduled)
- **Purpose**: Test weekly calendar view, advance scheduling

### Session 3: Next Month Morning
- **Template**: Modern History Challenge
- **Scheduled**: 30 days from now at 8:00 AM - 12:00 PM (4 hours)
- **Time Limit**: 240 minutes
- **Examiner**: examiner-003
- **Participants**: 4 students
  - Isabel Garcia (seed: isabel-hist-future-001)
  - Jack Wilson (seed: jack-hist-future-001)
  - Karen Taylor (seed: karen-hist-future-001)
  - Leo Anderson (seed: leo-hist-future-001)
- **Status**: open (scheduled)
- **Purpose**: Test monthly view, long-term scheduling, distant future sessions

## Notes
- All participants will have completion percentage of 0 (not started)
- No startTimeOffset needed (sessions haven't started)
- Seeds follow pattern: `{name}-{template}-future-001`
- Times are calculated relative to "now" to keep sessions perpetually in the future
- Varied scheduling ranges (1 day, 7 days, 30 days) provide comprehensive test coverage

Tasks:
- [x] create-future-session-seeds
    - [x] Create `backend/src/scripts/seeds/sessions/futureSessions.ts`
    - [x] Define 3 future session scenarios with future dates
    - [x] Vary time ranges (tomorrow, next week, next month)
- [x] integrate-with-seed-script
    - [x] Add future sessions to main seed script
    - [x] Log summary of future sessions with scheduled times

Dependencies:
- Depends on: [../deterministic-randomization/plan.md](../deterministic-randomization/plan.md)
