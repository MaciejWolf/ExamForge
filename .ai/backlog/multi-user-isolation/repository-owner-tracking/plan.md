# repository-owner-tracking

Goal:
Update repositories to automatically set `owner_id` when saving entities, ensuring RLS policies work correctly.

Context:
Database now has `owner_id UUID REFERENCES auth.users(id)` columns on `questions`, `templates`, and `test_sessions` tables. RLS policies use `auth.uid() = owner_id` to enforce isolation.

Current implementation analysis:
```typescript
// backend/src/design/repository.ts
// Currently saves only { id, data } without owner_id
save: async (question: Question) => {
  const doc = mapQuestionToDocument(question); // { id, data }
  const { data, error } = await supabase
    .from('questions')
    .upsert(doc)
    .select()
    .single();
  // ...
}
```

With RLS enabled and `WITH CHECK (auth.uid() = owner_id)`, inserts will fail unless `owner_id` matches the authenticated user's ID.

Required changes:
- Get the authenticated user's ID from the Supabase client
- Include `owner_id` in the document structure when saving
- Ensure queries still work (RLS automatically filters by owner_id)

Tasks:
- [ ] Update `createSupabaseQuestionRepository` save method to include `owner_id`
- [ ] Update `createSupabaseTemplateRepository` save method to include `owner_id`
- [ ] Update `createSupabaseSessionRepository` save method to include `owner_id`
- [ ] Update `createSupabaseTestInstanceRepository` - determine ownership model for instances
- [ ] Verify that read operations still work (RLS filters automatically)

Necessary updates:
- `backend/src/design/repository.ts`: Update both question and template save methods
- `backend/src/assessment/repository.ts`: Update session and test instance save methods

Example implementation:
```typescript
// Updated save method
save: async (question: Question) => {
  // Get the authenticated user from the client
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Authenticated user required");

  const doc = {
    id: question.id,
    owner_id: user.id, // Add top-level owner_id
    data: question,
  };

  const { data, error } = await supabase
    .from('questions')
    .upsert(doc)
    .select()
    .single();
  // ...
}
```

Open questions:
- Should test_instances have their own owner_id, or inherit from the session?
- Do we need to migrate existing data to have owner_ids?
- Should we add indexes on owner_id columns for performance?

Risks:
- Existing data without owner_id will be inaccessible until migrated
- Need to ensure seed scripts also set owner_id correctly
