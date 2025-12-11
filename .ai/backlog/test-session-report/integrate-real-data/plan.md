# integrate-real-data

Goal:
Replace the hardcoded data in the getSessionReport handler with real service calls to fetch and generate reports from database data.

Context:
- Handler skeleton exists from first task
- Service layer functions exist from previous task
- This task connects the two layers

## Integration Steps

### 1. Update Handler
Modify `backend/src/assessment/handlers/getSessionReport.ts`:
- Import report service functions
- Remove hardcoded data
- Call `generateSessionReport(sessionId)`
- Handle service errors appropriately

### 2. Error Handling
Add proper HTTP error responses:
- 404: Session not found
- 403: User doesn't own this session (authorization)
- 500: Server error during report generation

### 3. Add Authorization
Verify examiner owns the session:
- Extract examinerId from auth token
- Query to verify session belongs to examiner
- Return 403 if unauthorized

### 4. Response Mapping
Ensure service data maps correctly to HTTP response:
- Transform dates to ISO 8601 strings
- Map database field names to frontend expectations
- Handle null/undefined values

## Files to Modify

**Modify:**
- `backend/src/assessment/handlers/getSessionReport.ts` - Replace hardcoded data
- `backend/src/assessment/handlers/getSessionReport.test.ts` - Update tests for real logic

**Create:**
- `backend/src/assessment/handlers/getSessionReport.integration.test.ts` - Integration tests

## Integration Tests

Test with real database (using test database):
- Create session with participants in test DB
- Call endpoint and verify correct report generation
- Test authorization (user can only see their own sessions)
- Test with various session states (active, completed, no participants)
- Test performance with larger datasets (50+ participants)

## Performance Considerations
- Consider caching for frequently accessed reports
- Optimize queries to minimize DB roundtrips
- Add database indexes if needed for query performance

Tasks:
- [ ] integrate-service-into-handler
- [ ] add-error-handling
- [ ] implement-authorization-check
- [ ] update-unit-tests
- [ ] create-integration-tests
- [ ] test-with-seeded-data
- [ ] verify-frontend-integration
- [ ] performance-testing

Dependencies:
- Depends on: [../implement-report-data-service/plan.md](../implement-report-data-service/plan.md)
- Requires authentication middleware

## Acceptance Criteria
- [ ] Handler calls service functions instead of returning hardcoded data
- [ ] Proper error handling for all failure cases
- [ ] Authorization check prevents unauthorized access
- [ ] All unit tests pass
- [ ] Integration tests pass with real database
- [ ] Frontend successfully displays real data from database
- [ ] Response time < 300ms for sessions with 50 participants
- [ ] No console errors or warnings in frontend
