# [Module Name] Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

[Brief description of the module's primary purpose and scope.]

## Owns

- `[Primary Entity]`
- `[Secondary Entity]`
- `[Related DTOs or Value Objects]`

## Operations

- [Operation 1: e.g., Creating X from templates]
- [Operation 2: e.g., Managing lifecycle of Y]
- [Operation 3: e.g., Computing statistics or validations]

## Domain Types

- `[Type Name]`
- `[Type Name]`
- `[Module]-specific DTOs and error unions`

## Key Use Cases

- `[useCaseMethodName]` - [Brief description of what it does]
- `[useCaseMethodName]`
- `[useCaseMethodName]`

## API Routes

```text
GET    /api/[module-name]/[resource]
POST   /api/[module-name]/[resource]
GET    /api/[module-name]/[resource]/:id
PUT    /api/[module-name]/[resource]/:id
DELETE /api/[module-name]/[resource]/:id

GET    /api/[module-name]/[resource]/:id/[sub-resource]
POST   /api/[module-name]/[resource]/:id/[sub-resource]
````

## Cross-Module Interaction

[Description of dependencies on other modules. e.g., "The [Module Name] depends on the [Other Module] (read-only)."]

[Specific interaction details, e.g., "When doing X, it calls otherModule.method()."]

See `backend-architecture.md` for details on cross-module interactions.

```

---

### Guidelines for Filling Out the Template

* **Owns:** List the database entities or core domain objects this module is the "source of truth" for.
* **Operations:** Describe the high-level logic or business rules the module enforces (e.g., validation, calculation, recording).
* **Key Use Cases:** These should likely map to your "Feature" or "UseCase" classes/functions within the code (e.g., `startSession`, `createPool`).
* **Cross-Module Interaction:** Explicitly state if the module is read-only regarding other modules or if it triggers actions elsewhere. Both examples reference `backend-architecture.md` as the central documentation for these rules.

Would you like me to draft a specific module definition using this template for you?
