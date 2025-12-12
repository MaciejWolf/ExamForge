# frontend-test-taking

Goal:
Implement frontend interface for test participants to enter access codes and take tests. Includes landing page with access code input and test view for answering questions.

## Tasks
- [x] access-code-entry
- [x] api-integration
- [x] question-list-view

## Context

**access-code-entry:**
- Landing page component for participants (StartPage.tsx)
- Connect Start Test button to API
- Navigation to questions list on successful validation

**api-integration:**
- Update core.ts to allow public API calls
- Create assessment service for participant actions
- Implement startTestInstance client function

**question-list-view:**
- Component to display test questions (read-only for now)
- Render question text and basic details
- No answer inputs or submission logic yet

## Dependencies
- Depends on: [../backend/plan.md](../backend/plan.md) (backend must be implemented first)
