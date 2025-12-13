# fetch-participants-data

Goal:
Get real participant list from test_instances table and map to participant objects with proper status derivation.

Context:
- TestInstance contains participant information
- Need to derive participant status from timestamps
- TestInstance has more fields than Participant type needs
- Keep scores undefined for now (next task)

Fields to populate:
- `participant.id`, `sessionId`, `identifier`, `accessCode`
- `participant.status` (derived from timestamps)
- `participant.startedAt`, `completedAt`
- `participant.createdAt`
- Leave `totalScore`, `maxScore`, `timeTakenMinutes` undefined for now

Status derivation logic:
- `not_started`: no startedAt
- `in_progress`: has startedAt but no completedAt
- `completed`: has completedAt
- `timed_out`: has startedAt, no completedAt, and time limit exceeded

Tasks:
- [x] Add TestInstanceRepository.findBySessionId call
- [x] Map TestInstance fields to Participant type
- [x] Implement status derivation logic from timestamps
- [x] Handle time limit check for timed_out status
- [x] Update tests to verify participant list fetching
- [x] Keep statistics and question analysis hardcoded

Testing considerations:
- Test with sessions having 0, 1, and multiple participants
- Test all status derivation scenarios
- Verify all participant fields map correctly
- Test timed_out detection with session time limit
