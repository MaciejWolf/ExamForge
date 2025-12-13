# seed-script-authentication

Goal:
Update the seed script to accept an email parameter, authenticate as that user, and create all seed data owned by that user.

Context:
Current seed script uses hardcoded examiner IDs like `'examiner-001'` which aren't real UUIDs from `auth.users`. With RLS enabled, the script needs to authenticate as a real user.

Current implementation analysis:
```typescript
// backend/src/scripts/seed.ts
// Currently uses anonymous client
const supabaseClient = createSupabaseClient({ supabaseUrl, supabaseAnonKey });

// Hardcoded examiner IDs in seed data
// backend/src/scripts/seeds/sessions/activeSessions.ts
examinerId: 'examiner-001', // Not a real UUID!
```

Command line usage:
```bash
# Current (no parameters)
npm run seed

# Desired
npm run seed -- admin1@gmail.com
```

Required architecture:
1. Read email from `process.argv[2]`
2. Use Supabase Admin API to create/find the user
3. Sign in as that user to get an access token
4. Create Supabase client with that token
5. Replace hardcoded examiner IDs with the real user ID

Tasks:
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables (for admin operations)
- [ ] Create `getOrCreateTestUser(email)` helper function
- [ ] Create `getAuthenticatedUserClient(email)` function that returns client + userId
- [ ] Update seed script to read email from command line args
- [ ] Update `seedActiveSessions` to accept `examinerId` parameter
- [ ] Update `seedCompletedSessions` to accept `examinerId` parameter  
- [ ] Update `seedFutureSessions` to accept `examinerId` parameter
- [ ] Replace hardcoded `sessionSeed.examinerId` with passed-in userId

Necessary updates:
- `backend/src/scripts/seed.ts`: Major refactor to add authentication
- `backend/src/scripts/seeds/sessions/activeSessions.ts`: Keep as-is (data only)
- `.env`: Add `SUPABASE_SERVICE_ROLE_KEY` variable

Example implementation:
```typescript
// Helper to create/authenticate user
const getAuthenticatedUserClient = async (email: string) => {
  const adminClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const defaultPassword = 'Password123!';

  // Find or create user
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  let user = users.find(u => u.email === email);

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true
    });
    if (error) throw error;
    user = data.user;
  }

  // Sign in to get token
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signInData, error } = await authClient.auth.signInWithPassword({
    email,
    password: defaultPassword
  });

  if (error || !signInData.session) throw error;

  return {
    client: createSupabaseClient({ supabaseUrl, supabaseAnonKey }, signInData.session.access_token),
    userId: user.id
  };
};

// Usage in seed()
const seed = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run seed -- user@example.com');
    process.exit(1);
  }

  const { client: userClient, userId } = await getAuthenticatedUserClient(email);
  await seedQuestions(userClient);
  await seedActiveSessions(userClient, templateMap, userId); // Pass userId!
};
```

Open questions:
- Should we allow seeding for multiple users in one run?
- What default password should we use for test users?
- Should we clean the database before seeding, or append?

Dependencies:
- Requires `per-request-supabase-client` to be implemented (need updated createSupabaseClient)
