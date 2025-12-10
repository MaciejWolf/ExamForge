# authentication-middleware

Goal:
Secure the assessment endpoints with Supabase JWT authentication. Extract the examiner ID from the authenticated user and pass it to the use cases.

Tasks:
- [ ] create-auth-middleware
- [ ] extract-examiner-from-jwt
- [ ] apply-middleware-to-assessment-routes
- [ ] handle-auth-errors
- [ ] update-use-cases-to-use-authenticated-examiner

Context:
- Supabase provides JWT tokens via `Authorization: Bearer <token>` header
- Middleware should verify token with Supabase client
- Target file: `backend/src/middleware/auth.ts` (new file)
- Current issue: Frontend sends examinerId but it should come from authenticated session

Risks:
- Need to ensure Supabase client is properly initialized
- Token verification might add latency to requests

Dependencies:
- Depends on: [../assessment-http-endpoints/plan.md](../assessment-http-endpoints/plan.md)

