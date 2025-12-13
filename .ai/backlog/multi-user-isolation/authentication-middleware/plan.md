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

Tasks:
- [ ] Create `backend/src/middleware/auth.ts`
- [ ] Implement `requireAuth` middleware that extracts Bearer token
- [ ] Attach token to request object for downstream use
- [ ] Add TypeScript types for authenticated requests (extend Express Request type)
- [ ] Apply middleware to protected routes in `backend/src/index.ts`

Necessary updates:
- `backend/src/index.ts`: Apply middleware to `/api/design` and `/api/assessment` routes
- Create new file: `backend/src/middleware/auth.ts`

Open questions:
- Should we validate the token in middleware, or defer to Supabase client?
- Do we need different middleware for optional vs required auth?
