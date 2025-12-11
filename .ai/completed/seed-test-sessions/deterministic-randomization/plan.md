# deterministic-randomization

Goal:
Make question selection and answer shuffling deterministic by implementing seeded random number generation, ensuring the same questions are selected every time the database is seeded.

Context:
- `materializeTemplate` currently uses Math.random() via `defaultRandomSelector` and `defaultShuffler`
- Need deterministic behavior without changing the existing API
- `materializeTemplate` already accepts optional `randomSelector` and `answerShuffler` parameters

**📌 NOTE:**
This plan does NOT create test sessions. It only sets up the infrastructure for deterministic randomization. Actual test session creation happens in the `seed-active-sessions` and `seed-completed-sessions` plans, which depend on this implementation.

Tasks:
- [X] add-seeded-rng-utility
    - [X] Install `seedrandom` package
    - [X] Create utility in `backend/src/shared/seededRandom.ts`
    - [X] Export seeded versions of array shuffle and selection functions
- [X] create-deterministic-helpers
    - [X] Create `backend/src/design/useCases/shared/deterministicHelpers.ts`
    - [X] Implement seeded randomSelector that takes a seed parameter
    - [X] Implement seeded answerShuffler that takes a seed parameter
- [X] update-seed-script
    - [X] Modify seed script to use deterministic helpers when creating test instances
    - [X] Use a hash of the session ID as the seed
