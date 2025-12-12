# calculate-scores

Goal:
Calculate real scores for each participant based on their submitted answers and test content.

Context:
- TestInstance contains testContent (TestContentPackage) with questions and correct answers
- TestInstance now has answers field (from persist-answers subplan)
- Scores should only be calculated for completed participants
- Points per question = section.points / number of questions in section

Dependencies:
- Depends on: [../persist-answers/plan.md](../persist-answers/plan.md)

Fields to populate:
- `participant.totalScore` (sum of points earned)
- `participant.maxScore` (sum of points possible)
- `participant.timeTakenMinutes` (calculated from startedAt/completedAt)

Tasks:

Score Calculation Logic:
- [x] Understand TestContentPackage structure and answer data
- [x] Implement totalScore calculation by comparing answers with correctAnswerId
- [x] Calculate points per question (section.points / questions in section)
- [x] Sum points earned for all correct answers
- [x] Implement maxScore calculation (sum of section.points across all sections)
- [x] Implement timeTakenMinutes calculation (completedAt - startedAt)

Integration with finishTestSession:
- [x] Add score calculation after answers are persisted
- [x] Only calculate scores for completed participants
- [x] Store totalScore, maxScore, timeTakenMinutes in TestInstance
- [x] Keep statistics and question analysis hardcoded (out of scope)

Testing:
- [x] Test: all correct answers → totalScore equals maxScore
- [x] Test: all incorrect answers → totalScore is 0, maxScore is correct
- [x] Test: mixed correct/incorrect answers → partial score
- [x] Test: points distributed evenly across questions in a section
- [x] Test: timeTakenMinutes calculation with different durations
- [x] Test: edge case - empty answers → totalScore is 0
- [x] Test: edge case - partial answers → only answered questions scored
- [x] Test: scores are calculated and persisted atomically

Resolved Questions:
- ✅ How are answers stored in TestContentPackage?
  → They're NOT stored in TestContentPackage. TestContentPackage only contains frozen test content with questions and correct answers.
  → Participant answers are stored in TestInstance.answers.

- ✅ Does TestContentPackage have pointsEarned per answer or do we calculate it?
  → We CALCULATE pointsEarned by comparing participant answers against TestContentPackage correct answers.
  → Points per question = section.points / number of questions in section
  → ParticipantAnswer.pointsEarned is calculated, not stored with submitted answers

Implementation Details:

Scoring Algorithm:
```typescript
// For each section in testContent:
//   pointsPerQuestion = section.points / section.questions.length
//   For each question in section:
//     if (answers[question.id] === question.correctAnswerId):
//       totalScore += pointsPerQuestion

// maxScore = sum of all section.points
```

Time Calculation:
```typescript
// timeTakenMinutes = (completedAt - startedAt) / (1000 * 60)
```

Flow in finishTestSession:
1. Validate and persist answers (from persist-answers)
2. Calculate totalScore by comparing answers with testContent
3. Calculate maxScore from testContent sections
4. Calculate timeTakenMinutes from timestamps
5. Update TestInstance with all calculated values
6. Save everything atomically

Testing considerations:
- Use test fixtures with known point values and correct answers
- Test edge cases: no answers, partial answers, all correct, all wrong
- Verify atomic operation: scores saved together with completion
- Verify timeTakenMinutes handles different time ranges correctly
