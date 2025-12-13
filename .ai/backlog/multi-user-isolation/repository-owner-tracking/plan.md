# repository-owner-tracking

Goal:
Update repositories to map an explicitly provided `ownerId` (injected at repository creation time) to the `owner_id` database column. This supports Seed Scripts setting explicit ownership while keeping Domain Models pure.

Context:
Database now has `owner_id` columns with `default auth.uid()`.
- **User Request**: `auth.uid()` provides the ID implicitly via the DB default.
- **Seed Script**: The script provides an explicit ID. This ID will be passed to the Repository Factory.
- **Domain Purity**: Domain objects (`Question`, `Template`) should NOT contain infrastructure concerns like `ownerId`.
- **TestInstances (Shared Resource)**: 
    - Created by Examiner (Owner).
    - Updated by Candidate (Non-Owner).
    - **Critical**: Updates by Candidates must NOT overwrite `owner_id`. If `explicitOwnerId` is undefined, the repository must NOT send the field to the DB, allowing the existing value to persist.

Strategy: **Context-Based Repository Injection**
We will inject the `ownerId` into the Repository Factory. The Repository will then attach this ID to the `Document<T>` when saving, BUT ONLY IF explicitly provided.

Required changes:
1.  Update `Document<T>` to include `owner_id?: string`.
2.  Update Repository Factories (e.g., `createSupabaseQuestionRepository`) to accept an optional `explicitOwnerId: string`.
3.  Update Repositories to map this injected `explicitOwnerId` to the `owner_id` field on the `Document` during `save`.
    - **Crucial**: If `explicitOwnerId` is undefined, do NOT include `owner_id` in the object sent to Supabase. This ensures `upsert` doesn't overwrite existing ownership with `null`.

Tasks:
- [ ] Update `Document<T>` in `backend/src/design/repository.ts` and `backend/src/assessment/repository.ts` to include `owner_id?: string`.
- [ ] Update `createSupabaseQuestionRepository` to accept `explicitOwnerId`.
    - [ ] Ensure `owner_id` is only added to payload if `explicitOwnerId` is defined.
- [ ] Update `createSupabaseTemplateRepository` to accept `explicitOwnerId`.
    - [ ] Ensure `owner_id` is only added to payload if `explicitOwnerId` is defined.
- [ ] Update `createSupabaseSessionRepository` to accept `explicitOwnerId`.
    - [ ] Ensure `owner_id` is only added to payload if `explicitOwnerId` is defined.
- [ ] Update `createSupabaseTestInstanceRepository` to accept `explicitOwnerId`.
    - [ ] Ensure `owner_id` is only added to payload if `explicitOwnerId` is defined.

Example implementation:

**Repository Type:**
```typescript
export type Document<T> = {
  id: string;
  data: T;
  owner_id?: string; // Optional
};
```

**Repository Factory & Implementation:**
```typescript
// repository.ts
export const createSupabaseQuestionRepository = (
  supabase: SupabaseClient, 
  explicitOwnerId?: string // <--- Injected here
): QuestionRepository => {
  
  // Helper to map with owner
  const mapQuestionToDocument = (question: Question): Document<Question> => {
    const doc: Document<Question> = {
      id: question.id,
      data: question,
    };
    
    // CRITICAL: Only set if explicitly provided. 
    // If undefined, we omit the key so Postgres keeps existing value (on update) or uses default (on insert).
    if (explicitOwnerId) {
        doc.owner_id = explicitOwnerId;
    }
    
    return doc;
  };

  return {
    save: async (question: Question) => {
      const doc = mapQuestionToDocument(question);
      // ... upsert doc ...
    },
    // ...
  };
};
```
