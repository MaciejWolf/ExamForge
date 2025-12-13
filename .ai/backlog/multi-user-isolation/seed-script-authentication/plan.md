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
5.  Pass `ownerId` to `configureDesignModule`.
6.  `configureDesignModule` passes `ownerId` to Repository factories.
7.  Repositories map `explicitOwnerId` to the `owner_id` database column (Already implemented).

Tasks:
- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables.
- [x] Update `backend/src/scripts/seed.ts` to read email from CLI.
- [x] Implement `getUserIdByEmail` helper using Admin API in `seed.ts`.
- [x] Update `backend/src/design/index.ts` (`configureDesignModule`) to accept `ownerId` in config and pass it to repositories.
- [x] Update `seedQuestions`, `seedTestTemplates`, etc. in `seed.ts` to accept `ownerId` and pass it to `configureDesignModule`.
- [x] Update Repositories to map `ownerId` to DB column `owner_id` (Already implemented in `backend/src/design/repository.ts`).

Necessary updates:
- `backend/src/scripts/seed.ts`
- `backend/src/design/index.ts`

Example implementation:

```typescript
// backend/src/design/index.ts
export type DesignModuleConfig = {
  // ...
  ownerId?: string; // New config option
};

export const configureDesignModule = (config: DesignModuleConfig = {}) => {
  const repo = config.supabaseClient
    ? createSupabaseQuestionRepository(config.supabaseClient, config.ownerId) // Pass ownerId
    : createInMemoryQuestionRepository();
  // ...
}
```

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

const seedQuestions = async (supabaseClient: SupabaseClient, ownerId: string) => {
    const designModule = configureDesignModule({
        supabaseClient,
        ownerId, // Pass to module
    });
    // ...
}
```
