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
- [ ] add-seeded-rng-utility
    - [ ] Install `seedrandom` package
    - [ ] Create utility in `backend/src/shared/seededRandom.ts`
    - [ ] Export seeded versions of array shuffle and selection functions
- [ ] create-deterministic-helpers
    - [ ] Create `backend/src/design/useCases/shared/deterministicHelpers.ts`
    - [ ] Implement seeded randomSelector that takes a seed parameter
    - [ ] Implement seeded answerShuffler that takes a seed parameter
- [ ] update-seed-script
    - [ ] Modify seed script to use deterministic helpers when creating test instances
    - [ ] Use a hash of the session ID as the seed
