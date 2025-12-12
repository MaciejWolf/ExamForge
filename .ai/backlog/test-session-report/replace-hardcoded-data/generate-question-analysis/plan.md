# generate-question-analysis

Goal:
Generate per-question performance analysis by aggregating answer data across all completed participants.

Context:
- Most complex task: requires analyzing all participants' test content
- Different participants may have different questions (due to pool materialization)
- Need to aggregate correctness data across all participants
- Only include data from completed participants

Fields to populate:
- `questionAnalysis[].questionId` (from test content)
- `questionAnalysis[].questionNumber` (sequential ordering)
- `questionAnalysis[].questionContent` (question text)
- `questionAnalysis[].correctAnswer` (from question data)
- `questionAnalysis[].points` (from pool configuration)
- `questionAnalysis[].correctResponses` (count of correct answers)
- `questionAnalysis[].totalResponses` (count of total answers)
- `questionAnalysis[].correctPercentage` (correctResponses / totalResponses * 100)
- `questionAnalysis[].participantsCount` (count who answered this question)

Tasks:
- [ ] Collect all questions from completed participants' test content
- [ ] Handle different participants having different questions
- [ ] Build unique question list across all test instances
- [ ] For each question: count correct and total responses
- [ ] Extract question content and correct answer
- [ ] Get points from pool configuration
- [ ] Calculate correctPercentage
- [ ] Assign question numbers (sequential ordering)
- [ ] Sort results by question number
- [ ] Update tests to verify question analysis

Challenges:
- Different participants may have different questions from pools
- Need to match questions across different test instances
- Question numbering may differ per participant's materialization
- How to determine "correct answer" text from question data?

Open questions:
- Should we only include questions that ALL participants had?
- Or any question that at least one completed participant had?
- How to handle question numbering when different participants have different questions?

Testing considerations:
- Test with all participants having same questions
- Test with participants having different questions (different materializations)
- Test correct/incorrect response counting
- Test percentage calculations including 0% and 100%
- Test with no completed participants (should return empty array)
