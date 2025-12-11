# frontend-test-taking

Goal:
Implement frontend interface for test participants to enter access codes and take tests. Includes landing page with access code input and test view for answering questions.

## Tasks
- [ ] access-code-entry
- [ ] test-view
- [ ] api-integration

## Context

**access-code-entry:**
- Landing page component for participants
- Form to input access code
- Validation and error handling
- Navigation to test on successful validation

**test-view:**
- Component to display test questions
- Answer input/selection interface
- Timer display if time-limited
- Submit/finish test functionality

**api-integration:**
- Connect to backend validation endpoint
- Call start-test-session on test load
- Call finish-test-session on test submission
- Handle API errors and loading states

## Dependencies
- Depends on: [../backend/plan.md](../backend/plan.md) (backend must be implemented first)
