# Multi-User Data Isolation

Goal:
Implement Row Level Security (RLS) to ensure questions, templates, and sessions are tied to the authoring user. Users should only see and manage their own data.

Context:
- Database already updated with `owner_id` columns and RLS policies enabled
- Current implementation uses a singleton Supabase client, which won't work with RLS
- Need to create per-request clients using user JWT tokens
- Seed scripts use hardcoded examiner IDs that need to be replaced with real user UUIDs

Tasks:
- [ ] [authentication-middleware](./authentication-middleware/plan.md)
- [ ] [per-request-supabase-client](./per-request-supabase-client/plan.md)
- [ ] [repository-owner-tracking](./repository-owner-tracking/plan.md)
- [ ] [seed-script-authentication](./seed-script-authentication/plan.md)
- [ ] [integration-testing](./integration-testing/plan.md)

Dependencies:
- Database RLS policies already configured (completed)
