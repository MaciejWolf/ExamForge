# integration-testing

Goal:
Verify that multi-user isolation works correctly: users can only see their own data, and data from different users is properly isolated.

Context:
After implementing authentication middleware, per-request clients, and repository changes, we need to ensure the entire system works correctly.

Test scenarios needed:
1. User1 creates questions/templates/sessions
2. User2 creates questions/templates/sessions  
3. User1 lists questions → should only see their own
4. User2 lists questions → should only see their own
5. User1 tries to get User2's question by ID → should return 404 or empty
6. Seed script creates data for specific user → data is owned by that user

Tasks:
- [ ] Create test user accounts (user1@test.com, user2@test.com)
- [ ] Test question isolation between users
- [ ] Test template isolation between users
- [ ] Test session isolation between users
- [ ] Test seed script with email parameter
- [ ] Verify RLS policies are enforced (try direct Supabase queries)
- [ ] Test frontend login + data access flow
- [ ] Document any RLS policy issues or edge cases

Necessary updates:
- May need to add integration tests to `backend/src/tests/integration/`
- May need to update existing tests to include authentication context

Test approach:
```typescript
// Example test structure
describe('Multi-user isolation', () => {
  let user1Client: SupabaseClient;
  let user2Client: SupabaseClient;
  
  beforeAll(async () => {
    // Create and authenticate test users
    user1Client = await authenticateAs('user1@test.com');
    user2Client = await authenticateAs('user2@test.com');
  });

  it('should isolate questions between users', async () => {
    // User1 creates a question
    const q1 = await createQuestion(user1Client, { text: 'User1 question' });
    
    // User2 creates a question
    const q2 = await createQuestion(user2Client, { text: 'User2 question' });
    
    // User1 lists questions
    const user1Questions = await listQuestions(user1Client);
    expect(user1Questions).toContain(q1);
    expect(user1Questions).not.toContain(q2);
    
    // User2 lists questions
    const user2Questions = await listQuestions(user2Client);
    expect(user2Questions).toContain(q2);
    expect(user2Questions).not.toContain(q1);
  });
});
```

Open questions:
- Should we test with service role key to verify RLS is actually enforced?
- Do we need to test anonymous access (no token) scenarios?
- Should we add monitoring/logging for RLS policy violations?

Dependencies:
- All previous tasks must be completed
- Requires test users in Supabase Auth
