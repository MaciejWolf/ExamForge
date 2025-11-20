# Design Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Define what tests are and how they are built.

## Use Cases

- `createPool` - Creates a new question pool
- `updatePool` - Updates an existing question pool
- `deletePool` - Deletes a question pool
- `getPool` - Retrieves a question pool by ID
- `listPools` - Lists all question pools
- `createQuestion` - Creates a new question within a pool
- `updateQuestion` - Updates an existing question
- `deleteQuestion` - Deletes a question
- `getQuestion` - Retrieves a question by ID
- `listQuestions` - Lists questions in a pool
- `createTemplate` - Creates a new test template
- `updateTemplate` - Updates an existing test template
- `deleteTemplate` - Deletes a test template
- `getTemplate` - Retrieves a test template by ID
- `listTemplates` - Lists all test templates
- `materializeTemplate` - Converts template into frozen `TestContentPackage` for assessment module

## Contracts

### Domain Types

- `QuestionPool` - Represents a collection of questions
- `Question` - Represents a single question with multiple answers
- `Answer` - Represents a possible answer to a question
- `TestTemplate` - Defines the structure and rules for generating tests
- `TemplateSection` - Optional section within a template
- Design-specific DTOs and error unions

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

## Dependencies

None

See `backend-architecture.md` for details on cross-module interactions.

