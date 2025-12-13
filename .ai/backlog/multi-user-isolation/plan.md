# Multi-User Data Isolation

Goal:
Implement Row Level Security (RLS) to ensure questions, templates, and sessions are tied to the authoring user. Users should only see and manage their own data.

Context:
- Database already updated with `owner_id` columns and RLS policies enabled.
- Need to update Domain Objects and Repositories to handle `ownerId`.
- Seed scripts need to support `ownerId` injection using the Service Role Key.
- `SUPABASE_SERVICE_ROLE_KEY` has been added to the environment.

Tasks:
- [X] [authentication-middleware](./authentication-middleware/plan.md)
- [X] [per-request-supabase-client](./per-request-supabase-client/plan.md)
- [X] [repository-owner-tracking](./repository-owner-tracking/plan.md) (Updated: Map domain ownerId to DB column)
- [X] [seed-script-authentication](./seed-script-authentication/plan.md) (Updated: Use Service Role & CLI args)
- [ ] [integration-testing](./integration-testing/plan.md)

Dependencies:
- Database RLS policies already configured (completed)
