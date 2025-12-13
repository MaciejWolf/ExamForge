# seed-script-authentication

Goal:
Update the seed script to accept an email parameter, resolve the user ID using the Supabase Admin API, and create seed data owned by that user using the Service Role Key (bypassing RLS).

Context:
Current seed script uses hardcoded examiner IDs and the anonymous client. With RLS enabled, we need to explicitly set `owner_id` for inserted rows. Using the Service Role Key allows us to bypass RLS restrictions during seeding, but we must manually provide the correct `owner_id`.

Current implementation analysis:
```typescript
// backend/src/scripts/seed.ts
// Currently uses anonymous client
const supabaseClient = createSupabaseClient({ supabaseUrl, supabaseAnonKey });
```

Command line usage:
```bash
# Desired
npm run seed -- user1@gmail.com
```

Required architecture:
1.  Read email from `process.argv[2]`.
2.  Use `SUPABASE_SERVICE_ROLE_KEY` to create an Admin/Service Role Supabase client.
3.  Use `supabaseAdmin.auth.admin.listUsers()` to find the user by email.
4.  Pass the resolved `ownerId` to seed functions.
5.  Seed functions must pass `ownerId` down to Use Cases/Repositories.
6.  Repositories must map `ownerId` from the domain object to the `owner_id` database column.

Tasks:
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables.
- [ ] Update `backend/src/scripts/seed.ts` to read email from CLI.
- [ ] Implement `getUserIdByEmail` helper using Admin API.
- [ ] Update `seedQuestions`, `seedTestTemplates`, etc., to accept `ownerId`.
- [ ] Update Domain Types (`Question`, `CreateQuestionCommand`) to include `ownerId`.
- [ ] Update Repositories to map `ownerId` to DB column `owner_id`.

Necessary updates:
- `backend/src/scripts/seed.ts`
- `backend/src/design/types/question.ts` (and other domain types)
- `backend/src/design/useCases/createQuestion.ts`
- `backend/src/design/repository.ts`

Example implementation:

```typescript
// backend/src/scripts/seed.ts

// 1. Helper to find user by email using Admin API
const getUserIdByEmail = async (supabaseAdmin: ReturnType<typeof createSupabaseClient>, email: string) => {
  console.log(`🔍 Looking up user: ${email}...`);
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  
  const user = users.find(u => u.email === email);
  if (!user) throw new Error(`User with email ${email} not found!`);
  
  return user.id;
};

// 2. Main seed function
const seed = async () => {
  const targetEmail = process.argv[2];
  if (!targetEmail) {
    console.error('Usage: npm run seed -- user@example.com');
    process.exit(1);
  }

  // Use Service Role Key to bypass RLS and act as Admin
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createSupabaseClient({
    supabaseUrl,
    supabaseAnonKey: supabaseServiceKey,
  });

  const ownerId = await getUserIdByEmail(supabaseAdmin, targetEmail);

  // Pass ownerId to seed functions
  await seedQuestions(supabaseAdmin, ownerId);
  // ...
};
```
