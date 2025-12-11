# Feature: seed-test-sessions

Goal:
Extend seed script to create test sessions (active, completed, future) with deterministic question selection, ensuring repeatable test content across seed runs.

Context:
- Currently only questions and templates are seeded
- Test instances use random question selection (non-deterministic)
- Need predictable test content for development/testing
- Future: will add completed test instances with specific scores

Tasks:
- [X] [deterministic-randomization](./deterministic-randomization/plan.md)
- [X] [seed-active-sessions](./seed-active-sessions/plan.md)
- [X] [seed-completed-sessions](./seed-completed-sessions/plan.md)
- [X] [seed-future-sessions](./seed-future-sessions/plan.md)

Dependencies:
- Requires existing question and template seeds
