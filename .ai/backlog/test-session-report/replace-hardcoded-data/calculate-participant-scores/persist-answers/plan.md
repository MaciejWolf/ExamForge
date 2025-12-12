# persist-answers

Goal:
Implement the complete flow for collecting, submitting, and persisting participant answers when finishing a test session.

Context:
- Answers are submitted WITH the finishTestSession request (MVP: not incrementally)
- TestInstance needs an `answers` field to store the questionId → answerId mapping
- Frontend needs to collect answers during the test and send them on completion
- This is a prerequisite for score calculation

MVP Decision:
- Answers submitted all at once when finishing test (simpler, atomic operation)
- Future enhancement: Add incremental submitAnswer for auto-save functionality

Tasks:

Backend - Data Model & Types:
- [x] Add `answers` field to TestInstance type (Record<string, string> - questionId → answerId)
- [x] Update TestInstanceRepository interface to support answer storage

Backend - Use Case:
- [x] Update finishTestSession signature to accept answers parameter: `finishTestSession(testInstanceId: string, answers: Record<string, string>)`
- [x] Add validation for answers parameter (optional but should be object if provided)
- [x] Persist answers to TestInstance.answers field when finishing test
- [x] Ensure atomic operation: answers + completion status saved together

Backend - Tests:
- [x] Add test: finishing test with valid answers persists them to TestInstance
- [x] Add test: finishing test with empty answers object
- [x] Add test: finishing test with partial answers (some questions unanswered)
- [x] Add test: answers are persisted atomically with completion status
- [x] Update existing finishTestSession tests to handle new parameter

Frontend - Answer Collection:
- [x] Identify test-taking component(s) that render questions (QuestionListPage.tsx)
- [x] Add state management for collecting answers during test (questionId → answerId) - using `useState<Record<string, string>>({})`
- [x] Implement answer selection handlers (store answer when participant selects) - `handleAnswerSelect` implemented
- [x] Ensure answers are maintained across all test sections - component-level state covers all sections

Frontend - Submission:
- [x] Update finishTestSession API call to include answers in request body (currently only logs to console)
- [x] Handle loading/error states during submission
- [x] Navigate to TestCompletionPage after successful submission

Implementation Details:

Function Signature (Backend):
```typescript
finishTestSession(
  testInstanceId: string, 
  answers: Record<string, string>
): Promise<Result<TestInstance, AssessmentError>>
```

Data Model:
```typescript
type TestInstance = {
  // ... existing fields
  answers?: Record<string, string>; // questionId → answerId
}
```

API Contract (Frontend → Backend):
```typescript
POST /api/test-instances/:id/finish
{
  answers: {
    "question-id-1": "answer-id-a",
    "question-id-2": "answer-id-b"
  }
}
```

Testing considerations:
- Backend tests use repository mock to verify answers are persisted
- Test edge cases: empty answers, partial answers, missing answers

Current Implementation Status:
- ✅ Frontend answer collection is fully implemented in QuestionListPage.tsx
- ✅ Includes validation for unanswered questions before submission
- ✅ Includes confirmation dialog for incomplete tests
- ✅ Includes visual highlighting of unanswered questions
- ⏳ Frontend submission logic needs to call actual API (currently placeholder)
- ⏳ Backend persistence layer needs to be implemented
- ⏳ Backend tests need to be written
