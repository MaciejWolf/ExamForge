# Design Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Define what tests are and how they are built.

## Owns

- `QuestionPool`
- `Question`
- `Answer`
- `TestTemplate`

## Operations

- CRUD for question pools and questions
- CRUD for test templates
- Validation:
  - Questions have valid number of answers
  - Exactly one correct answer
  - Templates reference valid pools / questions
- Template resolution:
  - Given a template, determine which questions it uses (rules, counts, etc.)
  - Materialize template into `TestContentPackage` (see Cross-module Interactions)

## Domain Types

- `QuestionPool`
- `Question`
- `Answer`
- `TestTemplate`
- `TemplateSection` (optional)
- Design-specific DTOs and error unions

## Key Use Cases

- `createPool`, `updatePool`, `deletePool`, `getPool`, `listPools`
- `createQuestion`, `updateQuestion`, `deleteQuestion`, `getQuestion`, `listQuestions`
- `createTemplate`, `updateTemplate`, `deleteTemplate`, `getTemplate`, `listTemplates`
- `materializeTemplate` - Converts template into frozen `TestContentPackage` for assessment module

## API Routes

```text
GET    /api/design/pools
POST   /api/design/pools
GET    /api/design/pools/:poolId
PUT    /api/design/pools/:poolId
DELETE /api/design/pools/:poolId

GET    /api/design/pools/:poolId/questions
POST   /api/design/pools/:poolId/questions
PUT    /api/design/pools/:poolId/questions/:questionId
DELETE /api/design/pools/:poolId/questions/:questionId

GET    /api/design/templates
POST   /api/design/templates
GET    /api/design/templates/:templateId
PUT    /api/design/templates/:templateId
DELETE /api/design/templates/:templateId
```

## Cross-Module Interaction

The design module provides a `materializeTemplate` method that is called by the assessment module when starting a session. See `backend-architecture.md` for details on cross-module interactions.

