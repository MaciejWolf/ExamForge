# calculate-participant-scores

Goal:
Calculate real scores for each participant based on their test instance answers and test content.

Context:
- TestInstance contains testContent with questions and participant answers
- Need to analyze TestContentPackage structure to understand answer format
- Scores should only be calculated for completed participants
- Time taken calculated from timestamp difference

Fields to populate:
- `participant.totalScore` (sum of points earned)
- `participant.maxScore` (sum of points possible)
- `participant.timeTakenMinutes` (calculated from startedAt/completedAt)

Tasks:
- [ ] Understand TestContentPackage structure and answer data
- [ ] Implement score calculation logic from testContent
- [ ] Calculate totalScore by summing pointsEarned across answers
- [ ] Calculate maxScore by summing pointsPossible across questions
- [ ] Calculate timeTakenMinutes from completedAt - startedAt
- [ ] Only calculate scores for completed participants
- [ ] Update tests to verify score calculations
- [ ] Keep statistics and question analysis hardcoded

Open questions:
- How are answers stored in TestContentPackage?
- Does TestContentPackage have pointsEarned per answer or do we calculate it?

Testing considerations:
- Test score calculation with various answer patterns
- Test timeTakenMinutes calculation with different durations
- Test participants without completed status have undefined scores
- Test edge case: completed participant with no answers
