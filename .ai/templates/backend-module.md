# [Module Name] Module Architecture

This module follows the Vertical Slice Architecture pattern. See `.cursor/rules/vertical-slice-architecture.mdc` for implementation guidelines.

## Responsibility

[Brief description of the module's primary purpose and scope.]

## Use Cases

[Describe the observable behaviors this module provides, mapping to concrete use case methods. Each use case represents a specific operation that can be invoked.]

- `[useCaseMethodName]` - [Brief description of what it does, e.g., "Creates X from templates"]
- `[useCaseMethodName]` - [Brief description, e.g., "Manages lifecycle of Y"]
- `[useCaseMethodName]` - [Brief description, e.g., "Computes statistics or validations"]

## Contracts

[Define the public interfaces, DTOs, and types that other modules or clients interact with.]

### Domain Types

- `[Type Name]` - [Brief description]
- `[Type Name]` - [Brief description]
- `[Module]-specific DTOs and error unions`

## API Routes

```text
GET    /api/[module-name]/[resource]
POST   /api/[module-name]/[resource]
GET    /api/[module-name]/[resource]/:id
PUT    /api/[module-name]/[resource]/:id
DELETE /api/[module-name]/[resource]/:id

GET    /api/[module-name]/[resource]/:id/[sub-resource]
POST   /api/[module-name]/[resource]/:id/[sub-resource]
```

## Dependencies

[Only list modules that THIS module depends on. If this module has no dependencies (even if it's a dependency of many other modules), write "None" or leave this section empty.]

[Example: "This module depends on the [Other Module] (read-only)."]

[Specific interaction details, e.g., "When doing X, it calls otherModule.method()."]

See `backend-architecture.md` for details on cross-module interactions.

---

### Guidelines for Filling Out the Template

* **Use Cases:** List the concrete use case methods (mapping to your "Feature" or "UseCase" classes/functions) along with a brief description of what each does. These represent the observable behaviors/operations the module provides (e.g., `startSession`, `createPool`, `materializeTemplate`).
* **Contracts:** Define the public interfaces, types, and DTOs that external consumers interact with. This includes domain types and API contracts.
* **Dependencies:** Only list modules that THIS module depends on. If the module has no dependencies, write "None" or leave empty. Do not list modules that depend on this module.
