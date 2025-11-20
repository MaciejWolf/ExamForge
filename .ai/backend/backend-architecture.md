# Backend Architecture Design

## 1. High-level Overview

Backend is an Express + TypeScript API organized into two main domains:

1. **`design`**
   Responsible for authoring and configuring tests:
   - Question pools
   - Questions
   - Test templates

2. **`assessment`**
   Responsible for delivering, running, and evaluating tests:
   - Test sessions
   - Participants / runs
   - Answers, statistics, reports

The assessment domain depends on the design domain (read-only).
The design domain does not depend on assessment.

## 3. Modules and Responsibilities

The backend is organized into two main modules:

1. **`design`** - Responsible for authoring and configuring tests
   - See [design-module.md](./design-module.md) for detailed module architecture

2. **`assessment`** - Responsible for delivering, running, and evaluating tests
   - See [assessment-module.md](./assessment-module.md) for detailed module architecture

---

## 4. Cross-module Interactions

Design and Assessment modules interact exactly once when a session starts. The only cross-module call is from Assessment to Design to materialize a template into concrete test content. This call uses only design-oriented parameters, so no assessment concerns leak across.

### 4.1 Method Contract

```ts
designModule.materializeTemplate({
  templateId,
  variantCount,   // optional; design meaning: "how many distinct forms this template should generate"
}) → Promise<Result<TestContentPackage, DesignError>>
```

### 4.2 Returned Value

A stable, frozen structure that represents all test content needed for later assessment:

```ts
type TestContentPackage = {
  templateId: string;
  forms: Array<{
    formId: string;     // ID within the package
    questions: Array<{
      questionId: string;
      text: string;
      points: number;
      answers: Array<{
        answerId: string;
        text: string;
        isCorrect: boolean;
      }>
    }>
  }>;
};
```

### 4.3 Ownership Boundary

| Concern                                          | Owner      | Visible to other module                   |
| ------------------------------------------------ | ---------- | ----------------------------------------- |
| How test forms are composed                      | Design     | Returned in `TestContentPackage`          |
| How many participants, access codes, exam window | Assessment | Not visible to design                     |
| Actual time limit chosen by examiner             | Assessment | Design may provide only recommended value |
| Reporting & scoring                              | Assessment | Uses snapshot only                        |

### 4.4 Runtime Sequence

1. `Assessment` → `designModule.materializeTemplate({ templateId, variantCount })`
2. `Assessment` stores returned `TestContentPackage` as the session snapshot.
3. All subsequent operations use the assessment snapshot only:
   - Question rendering
   - Answer evaluation
   - Scoring
   - Reporting

### 4.5 Benefits

- **Single cross-module interaction**
- **No assessment concerns leaking into design**
- **Frozen snapshot: later design edits do not affect existing sessions**
- **Design can evolve internally (new template types, new composition rules) without modifying assessment**

This boundary ensures design stays volatile while assessment stays stable.

---

## 5. Application Layer

### 5.1 `app.ts`

- Create Express app
- Apply global middlewares (JSON parsing, CORS, auth, Swagger UI, error handler)
- Mount routers:
  ```ts
  app.use('/api/auth', authRouter);
  app.use('/api/design', designRouter);
  app.use('/api/assessment', assessmentRouter);
  ```

### 5.2 `server.ts`

- Load environment variables
- Import `app` from `app.ts`
- Start `app.listen(PORT)`

### 5.3 `config/`

- `env.ts` – Environment variable loading and validation
- `swagger.ts` – OpenAPI/Swagger setup
- `supabase.ts` – Supabase client configuration

### 5.4 `middleware/`

- `auth.ts` – Supabase-based authentication; provides `req.user`
- `errorHandler.ts` – Centralized error handling; maps domain errors to HTTP status codes
