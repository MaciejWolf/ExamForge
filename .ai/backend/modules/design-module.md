# Design Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

Define what tests are and how they are built.

## Use Cases

### Global Question Bank Management
- `createQuestion` - Creates a new question in the global question bank
- `deleteQuestion` - Deletes a question from the bank (blocked if used in any template)
- `getQuestion` - Retrieves a question by ID
- `updateQuestion` - Updates an existing question in the bank
- `listQuestions` - Lists all questions in the global bank with optional tag filtering
- `addTagsToQuestion` - Adds one or more tags to a question
- `removeTagsFromQuestion` - Removes tags from a question
- `listTags` - Lists all existing tags in the system

### Template and Local Pool Management
- `createTemplate` - Creates a new test template
- `updateTemplate` - Updates an existing test template by replacing its entire state (metadata, pools, and their assigned questions). This is a monolithic update for V1.
- `deleteTemplate` - Deletes a test template
- `getTemplate` - Retrieves a test template by ID, including its associated pools and their assigned questions.
- `listTemplates` - Lists all test templates (metadata only, or with summarized pool info depending on frontend need for list view)
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

```

## Dependencies

None

See `backend-architecture.md` for details on cross-module interactions.

## Database Architecture

### Strategy: Hybrid Relational + JSONB

We utilize PostgreSQL's `JSONB` capabilities to balance schema flexibility with query power. This allows for easy evolution of complex nested structures (like Question content or Template hierarchy) while maintaining top-level relational access for primary entities.

### Schema Design

#### `questions` Table
- `id`: UUID (PK)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `tags`: JSONB Array (e.g., `["math", "easy"]`). *Decision: Simplicity over relational normalization for V1.*
- `content`: JSONB. Stores the variable structure of a question.
  ```json
  {
    "type": "multiple_choice",
    "prompt": "What is 2+2?",
    "points": 5,
    "answers": [
      { "id": "1", "text": "4", "correct": true },
      { "id": "2", "text": "5", "correct": false }
    ]
  }
  ```

#### `templates` Table
- `id`: UUID (PK)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `name`: String
- `structure`: JSONB. Stores the hierarchy of pools and question references.
  ```json
  {
    "pools": [
      {
        "id": "pool-1",
        "name": "Math Basics",
        "questions": ["uuid-q1", "uuid-q2"]
      }
    ]
  }
  ```

### Integrity & Constraints
- **Question Deletion**: Since `templates` reference questions inside a JSONB blob, standard Foreign Key cascades cannot be used.
- **Enforcement**: The application layer (Service) must perform a check before deleting a question:
  `SELECT 1 FROM templates WHERE structure->'pools' @> '[{"questions": ["QUESTION_ID"]}]'` (or equivalent JSON path query).
  If a match is found, deletion is blocked.
