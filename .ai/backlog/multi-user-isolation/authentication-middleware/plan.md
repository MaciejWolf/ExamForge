# authentication-middleware

Goal:
Create Express middleware to extract JWT tokens from Authorization headers and attach user context to requests.

Context:
Currently the backend has no authentication middleware. There's an old implementation in `backend_old/src/middleware/auth.ts` that can serve as reference.

Current implementation reference:
```typescript
// backend_old/src/middleware/auth.ts
export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = { id: user.id, email: user.email };
  next();
}
```

Analysis Conclusions:
- Frontend is ready: `apiRequest` in `frontend/src/services/core.ts` automatically sends Auth header when session exists.
- Frontend uses `skipAuth: true` for participant endpoints (`assessmentService`), so backend MUST NOT require auth for these specific routes.
- **Protected Routes:**
  - All `/api/design` routes
  - Most `/api/assessment` routes (sessions, reports, participant details)
- **Public Routes (Unprotected):**
  - `POST /api/assessment/start` (Participant starting a test)
  - `POST /api/assessment/instances/:id/finish` (Participant finishing a test)

Tasks:
- [ ] Create `backend/src/middleware/auth.ts`
- [ ] Implement `requireAuth` middleware that extracts Bearer token
- [ ] Attach token to request object for downstream use
- [ ] Add TypeScript types for authenticated requests (extend Express Request type)
- [ ] Apply middleware to `backend/src/index.ts`
    - [ ] Apply to all `/api/design` routes
    - [ ] Apply authentication middleware selectively inside `backend/src/assessment/http.ts` to protect only the necessary `/api/assessment` routes, making sure public endpoints (`POST /api/assessment/start` and `POST /api/assessment/instances/:id/finish`) remain unprotected.

Necessary updates:
- `backend/src/index.ts`: Apply middleware logic.
- Create new file: `backend/src/middleware/auth.ts`

Decisions:
- Validate token in middleware using `supabase.auth.getUser(token)` to reject invalid requests early (Fail Fast strategy).
