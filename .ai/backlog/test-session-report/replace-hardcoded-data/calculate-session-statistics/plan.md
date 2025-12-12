# calculate-session-statistics

Goal:
Calculate aggregate statistics from real participant data, handling all edge cases properly.

Context:
- Statistics are calculated from the participant list
- Only completed participants should be included in score calculations
- Need to handle edge cases like no participants or no completed participants

Fields to populate:
- `statistics.totalParticipants` (count of all participants)
- `statistics.completedCount`, `inProgressCount`, `notStartedCount` (counts by status)
- `statistics.completionRate` (completedCount / totalParticipants)
- `statistics.averageScore` (mean of completed participants' scores)
- `statistics.highestScore`, `lowestScore` (min/max of completed scores)

Tasks:
- [x] Count participants by status
- [x] Calculate totalParticipants count
- [x] Calculate completionRate as completedCount / totalParticipants
- [x] Filter completed participants for score calculations
- [x] Calculate averageScore from completed participants only
- [x] Find highestScore and lowestScore from completed participants
- [x] Handle edge case: no participants
- [x] Handle edge case: no completed participants
- [x] Update tests to verify statistics calculations
- [x] Keep question analysis hardcoded

Edge cases to handle:
- Empty participant list: all counts should be 0
- No completed participants: averageScore, highestScore, lowestScore should be 0
- Single completed participant: averageScore = that participant's score
- Division by zero in completionRate

Testing considerations:
- Test with all participants completed
- Test with no completed participants
- Test with mixed statuses
- Test with empty participant list
- Test with single participant
