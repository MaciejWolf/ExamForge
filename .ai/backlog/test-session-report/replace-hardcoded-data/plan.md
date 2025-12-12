# replace-hardcoded-data

Goal:
Gradually replace hardcoded report data with real database data, implementing one section at a time to maintain system stability while adding functionality incrementally.

Context:
- Hardcoded endpoint already working and verified with frontend
- Database has `test_sessions`, `test_instances` tables with real data
- Each task builds on the previous one, allowing testing at each step
- Frontend expects `TestSessionReport` type from `frontend/src/services/types.ts`

Tasks:
- [X] [fetch-basic-session-data](./fetch-basic-session-data/plan.md)
- [X] [fetch-participants-data](./fetch-participants-data/plan.md)
- [X] [calculate-participant-scores](./calculate-participant-scores/plan.md)
- [ ] [calculate-session-statistics](./calculate-session-statistics/plan.md)
- [ ] [generate-question-analysis](./generate-question-analysis/plan.md)

Dependencies:
- Each task depends on the previous one being completed
- Requires existing test session data in database (seeded or real)
