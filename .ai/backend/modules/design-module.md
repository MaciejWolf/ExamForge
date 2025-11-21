# Design Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Define what tests are and how they are built.

## Use Cases

### Global Question Bank Management
- `createQuestion` - Creates a new question in the global question bank
- `updateQuestion` - Updates an existing question in the bank
- `deleteQuestion` - Deletes a question from the bank (blocked if used in any template)
- `getQuestion` - Retrieves a question by ID
- `listQuestions` - Lists all questions in the global bank with optional tag filtering
- `addTagsToQuestion` - Adds one or more tags to a question
- `removeTagsFromQuestion` - Removes tags from a question
- `listTags` - Lists all existing tags in the system
- `suggestTags` - Suggests existing tags based on partial input

### Template and Local Pool Management
- `createTemplate` - Creates a new test template
- `updateTemplate` - Updates an existing test template
- `deleteTemplate` - Deletes a test template
- `getTemplate` - Retrieves a test template by ID
- `listTemplates` - Lists all test templates
- `createPoolInTemplate` - Creates a new local pool within a specific template
- `updatePoolInTemplate` - Updates a local pool (name, question selection count)
- `deletePoolFromTemplate` - Deletes a local pool from a template
- `addQuestionToPool` - Assigns a question from the global bank to a local pool in a template
- `removeQuestionFromPool` - Removes a question from a local pool in a template
- `moveQuestionBetweenPools` - Moves a question from one pool to another within the same template
- `listPoolsInTemplate` - Lists all local pools within a template
- `materializeTemplate` - Converts template into frozen `TestContentPackage` for assessment module

## Contracts

### Domain Types

- `Question` - Represents a single question in the global question bank with multiple answers, points, and optional tags
- `Answer` - Represents a possible answer to a question
- `Tag` - Represents a categorization label that can be assigned to questions
- `TestTemplate` - Defines the structure and rules for generating tests, contains local pools
- `LocalPool` - A collection of questions from the global bank, scoped to a specific template
- `TemplateSection` - Optional section within a template (future enhancement)
- Design-specific DTOs and error unions

### Key Relationships

- Questions exist independently in a global bank and can have zero or more tags
- Questions can be used across multiple templates
- Pools are local to each template (not global entities)
- Within a single template, a question can belong to at most one pool
- The same question can be in different pools across different templates
- Deleting a question is blocked if it's used in any template's pool
- Editing a question in the bank updates it across all templates that use it

## API Routes

```text
# Global Question Bank
GET    /api/design/questions                    # List all questions (with optional tag filters)
POST   /api/design/questions                    # Create a new question
GET    /api/design/questions/:questionId        # Get a specific question
PUT    /api/design/questions/:questionId        # Update a question
DELETE /api/design/questions/:questionId        # Delete a question (blocked if used in templates)

# Tag Management
GET    /api/design/tags                         # List all tags
GET    /api/design/tags/suggest?q=:query        # Suggest tags based on partial input
POST   /api/design/questions/:questionId/tags   # Add tags to a question
DELETE /api/design/questions/:questionId/tags   # Remove tags from a question

# Test Templates
GET    /api/design/templates                    # List all templates
POST   /api/design/templates                    # Create a new template
GET    /api/design/templates/:templateId        # Get a specific template
PUT    /api/design/templates/:templateId        # Update a template
DELETE /api/design/templates/:templateId        # Delete a template

# Local Pools (within Templates)
GET    /api/design/templates/:templateId/pools                           # List pools in template
POST   /api/design/templates/:templateId/pools                           # Create pool in template
PUT    /api/design/templates/:templateId/pools/:poolId                   # Update pool
DELETE /api/design/templates/:templateId/pools/:poolId                   # Delete pool from template
POST   /api/design/templates/:templateId/pools/:poolId/questions         # Add question to pool
DELETE /api/design/templates/:templateId/pools/:poolId/questions/:qId   # Remove question from pool
PUT    /api/design/templates/:templateId/pools/:poolId/questions/:qId/move  # Move question to another pool
```

## Dependencies

None

See `backend-architecture.md` for details on cross-module interactions.

