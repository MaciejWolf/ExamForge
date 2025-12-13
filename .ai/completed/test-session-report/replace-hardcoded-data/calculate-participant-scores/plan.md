# calculate-participant-scores

Goal:
Calculate real scores for each participant based on their test instance answers and test content.

Context:
- TestInstance contains testContent (TestContentPackage) with questions and correct answers
- TestContentPackage does NOT store participant answers - only frozen test content
- Participant answers are not yet implemented in the system (need to be added to TestInstance)
- Scores should only be calculated for completed participants
- Time taken calculated from timestamp difference

MVP Decision:
- Answers will be submitted WITH the finishTestSession request (not incrementally during test)
- This simplifies MVP implementation - one atomic operation for completion + answers + scoring
- Future enhancement: Add incremental submitAnswer for auto-save functionality

Fields to populate:
- `participant.totalScore` (sum of points earned)
- `participant.maxScore` (sum of points possible)
- `participant.timeTakenMinutes` (calculated from startedAt/completedAt)

Subplans:
- [X] [persist-answers/](persist-answers/plan.md) - Implement answer collection, submission, and storage (backend + frontend)
- [X] [calculate-scores/](calculate-scores/plan.md) - Implement scoring logic based on persisted answers

Resolved Questions:
- ✅ How are answers stored in TestContentPackage?
  → They're NOT stored in TestContentPackage. TestContentPackage only contains frozen test content with questions and correct answers.
  → Participant answers need to be stored separately in TestInstance.

- ✅ Does TestContentPackage have pointsEarned per answer or do we calculate it?
  → We CALCULATE pointsEarned by comparing participant answers against TestContentPackage correct answers.
  → Points per question = section.points / number of questions in section
  → ParticipantAnswer.pointsEarned is calculated, not stored with submitted answers

- ✅ Should answers be submitted incrementally during test or all at once when finishing?
  → MVP: Submit all answers WITH finishTestSession request (simpler, atomic operation)
  → Future: Can add incremental submitAnswer use case for auto-save functionality
  → This keeps MVP simple while allowing future enhancement for better UX

Implementation Details:

Function Signature:
```typescript
finishTestSession(testInstanceId: string, answers: Record<string, string>): Promise<Result<TestInstance, AssessmentError>>
```

Data Model:
- TestInstance needs: `answers?: Record<string, string>` (questionId → answerId mapping)
- Score calculation: Compare answers[questionId] with question.correctAnswerId
- Point distribution: Each section has section.points distributed evenly across questions

Flow:
1. Receive answers as function parameter
2. Validate test instance state (started, not completed)
3. Persist answers to testInstance.answers
4. Calculate scores by comparing with testInstance.testContent
5. Set completedAt, totalScore, maxScore
6. Save everything atomically

Testing considerations:

For finishTestSession with answers:
- Test finishing test with all correct answers → correct totalScore and maxScore
- Test finishing test with all incorrect answers → 0 totalScore, correct maxScore
- Test finishing test with mixed correct/incorrect answers
- Test points distributed evenly across questions in a section
- Test timeTakenMinutes calculation with different durations
- Test edge case: finishing with empty answers object
- Test edge case: finishing with partial answers (some questions unanswered)
- Test validation: cannot finish test that's not started
- Test validation: cannot finish test that's already completed
- Test answers are persisted to TestInstance
- Test atomic operation: answers + completion + scores all saved together
