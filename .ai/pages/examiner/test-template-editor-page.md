# Test Template Editor Page

The Test Template Editor is a comprehensive page with two main sections for creating and editing templates. It features a hierarchical view where questions are organized under their respective pools, making the template structure clear and intuitive.

## Navigation

- **Action:** An examiner clicks "Save Template" button.
- **Destination:** The Test Templates List Page with the saved template visible.
- **Action:** An examiner clicks "Cancel" button.
- **Destination:** The Test Templates List Page without saving changes.
- **Action:** An examiner clicks "Back to Templates List" link.
- **Destination:** The Test Templates List Page (prompts for confirmation if unsaved changes exist).
- **Action:** An examiner clicks the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel (prompts for confirmation if unsaved changes exist).
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page (prompts for confirmation if unsaved changes exist).

## Layout

The page features a persistent header with the application title and user controls. The main content area is divided into two distinct sections: Template Basic Info and Pools & Questions (which combines pool management with hierarchical question assignment).

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Templates List                        |
|                                                  |
|  Create New Test Template                        |
|                                                  |
|  +--------------------------------------------+  |
|  | 1. TEMPLATE BASIC INFO                     |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | Template Name:                             |  |
|  | [_______________________________________]  |  |
|  |                                            |  |
|  | Description (optional):                    |  |
|  | [_______________________________________]  |  |
|  | [_______________________________________]  |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | 2. POOLS & QUESTIONS                       |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | [+ Create New Pool]                        |  |
|  |                                            |  |
|  | Filter by Tags: [Select tags...      v]    |  |
|  | Search: [_____________________________]    |  |
|  |                                            |  |
|  | ▼ Pool: "Easy Questions"                   |  |
|  |   Questions to draw: [10]                  |  |
|  |   Points per question: [2]                 |  |
|  |   [Edit Pool] [Delete Pool]                |  |
|  |                                            |  |
|  |   ├─ Solve: 3x = 15                        |  |
|  |   │   Tags: [Math] [Advanced]              |  |
|  |   │   [Move to...] [Remove]                |  |
|  |   │                                        |  |
|  |   ├─ What is the derivative of x²?         |  |
|  |   │   Tags: [Math] [Calculus]              |  |
|  |   │   [Move to...] [Remove]                |  |
|  |   │                                        |  |
|  |   └─ [+ Add Question to Pool]              |  |
|  |                                            |  |
|  | ▼ Pool: "Hard Questions"                   |  |
|  |   Questions to draw: [5]                   |  |
|  |   Points per question: [5]                 |  |
|  |   [Edit Pool] [Delete Pool]                |  |
|  |                                            |  |
|  |   ├─ Prove the Pythagorean theorem         |  |
|  |   │   Tags: [Math] [Geometry] [Advanced]   |  |
|  |   │   [Move to...] [Remove]                |  |
|  |   │                                        |  |
|  |   └─ [+ Add Question to Pool]              |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  Total Questions in Template: 15                 |
|                                                  |
|  [Cancel]                    [Save Template]     |
|                                                  |
+--------------------------------------------------+
```

### Add Question to Pool Modal Wireframe

```
+--------------------------------------------------+
|  Add Questions to "Easy Questions" Pool      [X] |
+--------------------------------------------------+
|                                                  |
|  Filter by Tags: [Select tags...          v]     |
|  Search: [_________________________________]     |
|                                                  |
|  +--------------------------------------------+  |
|  | Available Questions from Global Bank       |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | [ ] What is 2+2?                           |  |
|  |     Tags: [Math] [Basic]                   |  |
|  |     [View Details]                         |  |
|  |                                            |  |
|  | [ ] Explain photosynthesis                 |  |
|  |     Tags: [Biology] [Science]              |  |
|  |     [View Details]                         |  |
|  |                                            |  |
|  | [✓] Calculate the area of a circle         |  |
|  |     Tags: [Math] [Geometry]                |  |
|  |     [View Details]                         |  |
|  |                                            |  |
|  | [~] Solve: 3x = 15                         |  |
|  |     Tags: [Math] [Advanced]                |  |
|  |     Already in: Hard Questions             |  |
|  |     [View Details]                         |  |
|  |                                            |  |
|  | Showing 4 of 127 questions                 |  |
|  | [Load More]                                |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  Selected: 1 question(s)                         |
|                                                  |
|  [Cancel]              [Add Selected Questions]  |
|                                                  |
+--------------------------------------------------+
```

## Component Descriptions

### Application Header
A persistent header bar displaying "ExamForge" on the left and user information on the right, consistent across all examiner pages.

### User Information Display
Shows the currently logged-in examiner's email address in the top-right corner.

### Logout Button
A button in the header that signs the examiner out and returns them to the login page.

### Back to Templates List Link
A navigation link that returns the examiner to the Test Templates List Page.

### Page Title
A heading that identifies whether this is "Create New Test Template" or "Edit Test Template: [Template Name]".

---

### Section 1: Template Basic Info

#### Template Name Input
A required text input field for entering the unique template name. The system validates that the name is unique within the examiner's account.

#### Description Input
An optional multi-line text area for describing the template's purpose, intended use, or any notes about the template.

---

### Section 2: Pools & Questions

This unified section combines pool management with question assignment, displaying a hierarchical view where questions are nested under their respective pools.

#### Filter and Search Controls

##### Tag Filter Control
A multi-select dropdown or tag selector positioned at the top of the section for filtering questions by tags. Features:
- Shows all available tags from the question bank
- Displays question count for each tag
- Allows selecting multiple tags
- Updates both assigned and unassigned question lists in real-time as tags are selected/deselected

##### Search Field
A text input for searching questions by content. Searches question text and answer text. Updates both assigned and unassigned question lists in real-time as the user types.

#### Create New Pool Button
A button that opens a modal or inline form to create a new pool within this template. The form includes:
- Pool name input (required, must be unique within this template)
- Points per question (required, must be a positive number)
- Initial "questions to draw" value (optional, can be set later)

#### Pool Sections (Hierarchical Display)

Each local pool is displayed as an expandable/collapsible section with its assigned questions nested underneath:

##### Pool Header
The pool header shows:
- **Expand/Collapse Indicator:** A visual indicator (e.g., ▼ for expanded, ▶ for collapsed) to toggle the visibility of questions in this pool
- **Pool Name:** The name of the pool, which must be unique within this template but can be reused across different templates
- **Questions to Draw:** A numeric input field specifying how many questions to randomly draw from this pool when generating a test. This value must be a positive integer and cannot exceed the number of assigned questions
- **Points per Question:** A numeric input field specifying how many points each question in this pool is worth. All questions drawn from this pool will have the same point value
- **Edit Pool Button:** Opens a modal or inline form to edit the pool's name, description, or points per question
- **Delete Pool Button:** Removes the pool from the template. All questions assigned to this pool become unassigned within this template context (but remain in the global bank). A confirmation dialog appears before deletion

##### Assigned Questions List (Nested Under Pool)
When a pool is expanded, it displays all questions currently assigned to it. Each question shows:

###### Question Preview
Shows the question text, truncated if too long, with an option to expand or view full details.

###### Tags
Visual tag chips or badges showing all tags associated with this question. Clicking a tag could filter to show only questions with that tag.

###### Move to Button/Dropdown
Opens a dropdown to move the question to a different pool within this template. Moving removes it from the current pool and adds it to the selected pool.

###### Remove Button
Removes the question from its current pool, making it unassigned within this template context. The question moves to the "Unassigned Questions" section.

##### Add Question to Pool Button
At the bottom of each pool's question list, a button that opens a modal/popup displaying questions from the global bank. The modal allows quick selection and assignment of questions to this specific pool.

###### Add Question Modal Components

**Modal Header**
- Displays the title "Add Questions to [Pool Name]"
- Shows a close button [X] to dismiss the modal without adding questions

**Filter and Search Controls**
- **Tag Filter:** Multi-select dropdown to filter questions by tags, same functionality as the main page filters
- **Search Field:** Text input to search questions by content, updates results in real-time

**Question List**
Displays questions from the global bank that match the current filters. Each question shows:

- **Checkbox:** Allows selecting multiple questions for bulk addition to the pool
- **Question Text:** Preview of the question, truncated if too long
- **Tags:** Visual tag chips showing all tags associated with the question
- **View Details Button:** Opens a preview/details view of the full question with all answers
- **Assignment Status Indicator:** Questions already assigned to another pool in this template show:
  - Disabled checkbox (grayed out with [~] indicator)
  - Text indicating which pool they're currently in: "Already in: [Pool Name]"
  - These questions cannot be selected (enforcing one-pool-per-question constraint)

**Pagination**
- Shows count: "Showing X of Y questions"
- **Load More Button:** Loads additional questions if there are more results

**Modal Footer**
- **Selected Count:** Displays "Selected: X question(s)" showing how many questions are currently selected
- **Cancel Button:** Closes the modal without adding any questions
- **Add Selected Questions Button:** Adds all selected questions to the pool and closes the modal. Disabled if no questions are selected.

#### Validation Indicators
Visual feedback (e.g., red border, warning icon) appears if:
- Draw count exceeds assigned questions count
- Draw count is not a positive integer
- Pool name is empty or duplicates another pool in this template

#### Constraint Enforcement
The UI enforces that a question can only be in one pool per template:
- Questions appear nested under exactly one pool
- Moving a question from one pool to another automatically removes it from the first pool
- The hierarchical view makes it visually clear which pool each question belongs to
- When adding questions via the "Add Question to Pool" modal, questions already assigned to another pool in this template are either disabled or show which pool they're currently in

#### Empty States
- If no pools exist yet, display a message: "Create a pool to start organizing questions for this template."
- If a pool has no assigned questions, display within the pool: "No questions assigned yet. Click 'Add Question to Pool' to add questions from the global bank."

---

### Footer Section

#### Total Questions Display
Shows the sum of "questions to draw" across all pools. This represents the total number of questions that will appear in a test generated from this template.

Formula: `Sum of (Questions to Draw) for all pools`

#### Cancel Button
Returns to the Test Templates List Page without saving any changes made in this session. If there are unsaved changes, a confirmation dialog appears.

#### Save Template Button
Validates the template configuration and saves it. Validation checks:
- Template name is not empty and is unique
- At least one pool exists
- Each pool has at least one assigned question
- Draw count for each pool does not exceed assigned questions count
- Draw count for each pool is a positive integer

If validation fails, the button is disabled or shows an error message. If validation passes, the template is saved and the user is redirected to the Test Templates List Page with a success message.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page implements `US-005` (Creating Local Pools within Templates) and `US-006` (Assigning Questions from Global Bank to Local Pools).
- **Functional Requirement Reference:** Implements `FR-04` (Managing Test Templates).
- **Architecture Change:** Pools are now local to each template, not global entities. Questions exist in a global bank and are assigned to local pools within templates.
- **Template Name Uniqueness:** The system must validate that template names are unique within the examiner's account.
- **Pool Name Uniqueness:** Pool names must be unique within a template (but can be reused across different templates).
- **Template Validation Rules:**
  - Template must have at least one local pool.
  - Each pool must have at least one assigned question.
  - Each pool must have a points per question value (positive number).
  - Draw count for each pool cannot exceed the number of assigned questions.
  - Draw count must be a positive integer.
  - A question can only be in one pool per template (but can be in different pools in different templates).
- **Pool-Level Points:** Points are configured at the pool level, not per individual question. All questions drawn from a pool will have the same point value, as specified in the pool's "Points per Question" field.
- **Tag-Based Filtering:** The Pools & Questions section includes tag-based filtering to help examiners quickly find relevant questions when adding them to pools via the modal.
- **Question Reusability:** The same question from the global bank can be used in multiple templates, and can be assigned to different pools in different templates.
- **Within-Template Constraint:** Within a single template, a question can only be assigned to one pool. Attempting to assign it to a second pool should either prevent the action or automatically move it from the first pool.
- **Question Count Calculation:** The total questions count is the sum of "questions to draw" from all local pools.
- **Real-time Validation:** The editor should validate in real-time that draw counts don't exceed assigned questions, with visual feedback for invalid inputs.
- **Unsaved Changes Warning:** If the user attempts to navigate away with unsaved changes, display a confirmation dialog.
- **Auto-save Consideration:** Consider implementing auto-save functionality to prevent data loss.
- **Responsive Design:** The editor should be responsive and adapt to smaller screens, possibly stacking sections vertically on mobile.
- **Loading States:** Display appropriate loading indicators when fetching questions from the global bank or performing operations.
- **Error Handling:** Provide clear error messages if operations fail (e.g., network errors, validation errors).
- **Success Feedback:** After successful save, display a brief success message before redirecting.
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers.
- **Drag and Drop:** Consider implementing drag-and-drop for moving questions between pools for improved UX.
- **Add Question Modal:** The "Add Question to Pool" button opens a modal with search/filter capabilities, allowing examiners to browse and select questions from the global bank to add to the specific pool.
- **Template Wizard:** Consider providing a guided wizard for first-time template creation.
- **Pool Color Coding:** Consider using color coding for pools to make visual distinction easier in the hierarchical view.
- **Question Preview Modal:** Consider adding a "Preview" button for each question that opens a modal showing the full question with all answers.
- **Pool Statistics:** Consider showing statistics for each pool (e.g., total points if all questions are drawn, difficulty distribution based on tags).
