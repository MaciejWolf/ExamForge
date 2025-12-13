# per-request-supabase-client

Goal:
Refactor the application to create user-scoped Supabase clients per request instead of using a singleton client, enabling RLS to work correctly.

Context:
Currently `backend/src/index.ts` creates one global Supabase client at startup. With RLS, we need a client per request that includes the user's JWT token so `auth.uid()` in RLS policies resolves correctly.

Current implementation analysis:
```typescript
// backend/src/lib/supabase.ts - needs to accept accessToken parameter
export const createSupabaseClient = (config: SupabaseConfig = {}): SupabaseClient => {
  // Currently no way to pass access token
  return createClient(supabaseUrl, supabaseAnonKey);
};

// backend/src/index.ts - creates modules once at startup
const supabaseClient = createSupabaseClient({ supabaseUrl, supabaseAnonKey });
const app = createApp({ designModuleConfig: { supabaseClient } });
```

Required architecture:
- Each request needs its own Supabase client with the user's token
- Modules (designModule, assessmentModule) need to be instantiated per-request
- Token extracted by auth middleware needs to be passed to client factory

Tasks:
- [ ] Update `lib/supabase.ts` to accept optional `accessToken` parameter
- [ ] Refactor `index.ts` to use middleware that creates request-scoped clients
- [ ] Update module instantiation to happen per-request instead of at startup
- [ ] Attach scoped modules to request object for route handlers to use
- [ ] Update route handlers (`design/http.ts`, `assessment/http.ts`) to use request-attached modules

Necessary updates:
- `backend/src/lib/supabase.ts`: Add `accessToken?: string` parameter and pass to client options
- `backend/src/index.ts`: Move module creation from startup to request middleware
- `backend/src/design/http.ts`: Change from `module` parameter to `req.designModule`
- `backend/src/assessment/http.ts`: Change from `module` parameter to `req.assessmentModule`

Example implementation:
```typescript
// Updated lib/supabase.ts
export const createSupabaseClient = (config: SupabaseConfig = {}, accessToken?: string): SupabaseClient => {
  const options: any = {};
  if (accessToken) {
    options.global = { headers: { Authorization: `Bearer ${accessToken}` } };
  }
  return createClient(supabaseUrl, supabaseAnonKey, options);
};

// Updated index.ts middleware
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const scopedClient = createSupabaseClient({ supabaseUrl, supabaseAnonKey }, token);
  req.designModule = configureDesignModule({ supabaseClient: scopedClient });
  req.assessmentModule = configureAssessmentModule({ supabaseClient: scopedClient });
  next();
});
```

Risks:
- Performance impact of creating modules per request (likely negligible)
- Need to ensure all routes consistently use request-scoped modules
