# Test Templates List Page

This page displays a list of all saved test templates created by the examiner, allowing them to create new templates, view existing ones, edit them, or delete them to manage test generation rules.

## Navigation

- **Action:** An examiner clicks the "Create New Template" button.
- **Destination:** The Test Template Editor Page opens to create a new template.
- **Action:** An examiner clicks on a test template name or "View/Edit" button.
- **Destination:** The Test Template Editor Page opens to view or edit the template configuration.
- **Action:** An examiner clicks the "Edit" button on a template row.
- **Destination:** The Test Template Editor Page opens to edit the template.
- **Action:** An examiner clicks the "Delete" button on a template row.
- **Destination:** A confirmation dialog appears; upon confirmation, the template is deleted and the page refreshes.
- **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.

## Layout

The page features a persistent header with the application title and user controls. The main content area consists of a page title, an action button to create a new template, and a table/list displaying all existing test templates with their details and action buttons.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Dashboard                             |
|                                                  |
|  Test Templates List                             |
|                                                  |
|  [+ Create New Template]                        |
|                                                  |
|  +--------------------------------------------+  |
|  | Template Name    | Pools | Questions | Actions|  |
|  +--------------------------------------------+  |
|  | Math Final       |   3   |    25     | [View]|  |
|  | Exam             |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|  |
|  +--------------------------------------------+  |
|  | Physics Quiz     |   2   |    15     | [View]|  |
|  |                  |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|  |
|  +--------------------------------------------+  |
|  | Chemistry        |   4   |    30     | [View]|  |
|  | Comprehensive    |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|  |
|  +--------------------------------------------+  |
|  | History          |   1   |    10     | [View]|  |
|  | Midterm          |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

#### Delete Confirmation Dialog

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Confirm Deletion               [X]   |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | Are you sure you want to delete     |     |
|     | the template "Math Final Exam"?     |     |
|     |                                      |     |
|     | This action cannot be undone.       |     |
|     | This template will no longer be     |     |
|     | available for launching new tests.  |     |
|     |                                      |     |
|     |           [Cancel]  [Delete]         |     |
|     |                                      |     |
|     +--------------------------------------+     |
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions

- **Application Header:** A persistent header bar displaying "ExamForge" on the left and user information on the right, consistent across all examiner pages.
- **User Information Display:** Shows the currently logged-in examiner's email address in the top-right corner.
- **Logout Button:** A button in the header that signs the examiner out and returns them to the login page.
- **Back to Dashboard Link:** A navigation link that returns the examiner to the main dashboard.
- **Page Title:** A heading that clearly identifies this page as "Test Templates List."
- **Create New Template Button:** A prominent button that triggers the creation flow for a new test template. When clicked, it opens the Test Template Editor Page.
- **Test Templates Table/List:** A data table or card-based list displaying all test templates created by the examiner. Each row/card includes:
  - **Template Name:** The unique name of the test template, which may be clickable to navigate to the template editor.
  - **Local Pools Count:** The number of local pools defined within this template (not global pools).
  - **Total Questions:** The total number of questions that will be randomly drawn from all local pools when a test is generated from this template.
  - **Action Buttons:**
    - **View Button:** Opens the Test Template Editor Page in view mode to see the template configuration details.
    - **Edit Button:** Opens the Test Template Editor Page in edit mode to modify the template.
    - **Delete Button:** Triggers a confirmation dialog to delete the template.
- **Delete Confirmation Dialog:** A modal dialog that appears when deleting a template, containing:
  - **Warning Message:** Explains that deletion is permanent and the template will no longer be available for launching new tests.
  - **Template Name Display:** Shows which template is being deleted for clarity.
  - **Cancel Button:** Closes the dialog without deleting.
  - **Confirm Delete Button:** Executes the deletion and returns to the updated list.

## Test Template Editor Page

The Test Template Editor is a comprehensive page with three main sections for creating and editing templates. This replaces the old modal-based approach.

### Editor Layout

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
|  | 2. LOCAL POOLS MANAGEMENT                  |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | [+ Create New Pool]                        |  |
|  |                                            |  |
|  | Pool: "Easy Questions"                     |  |
|  | Questions to draw: [10]                    |  |
|  | Assigned questions: 15                     |  |
|  | [Edit Pool] [Delete Pool]                  |  |
|  |                                            |  |
|  | Pool: "Hard Questions"                     |  |
|  | Questions to draw: [5]                     |  |
|  | Assigned questions: 8                      |  |
|  | [Edit Pool] [Delete Pool]                  |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | 3. QUESTION ASSIGNMENT                     |  |
|  +--------------------------------------------+  |
|  |                                            |  |
|  | Filter by Tags: [Select tags...      v]    |  |
|  | Search: [_____________________________]    |  |
|  |                                            |  |
|  | Available Questions from Global Bank:      |  |
|  |                                            |  |
|  | [ ] What is 2+2?                           |  |
|  |     Tags: [Math] [Basic]                   |  |
|  |     Points: 2 | Answers: 4                 |  |
|  |     Assign to: [Select Pool...       v]    |  |
|  |                                            |  |
|  | [✓] Solve: 3x = 15                         |  |
|  |     Tags: [Math] [Advanced]                |  |
|  |     Points: 3 | Answers: 5                 |  |
|  |     Assigned to: Easy Questions            |  |
|  |     [Move to...] [Unassign]                |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  Total Questions in Template: 15                 |
|                                                  |
|  [Cancel]                    [Save Template]     |
|                                                  |
+--------------------------------------------------+
```

### Editor Component Descriptions

#### Section 1: Template Basic Info
- **Template Name Input:** A text input for entering the unique template name (required field).
- **Description Input:** An optional multi-line text area for describing the template's purpose.

#### Section 2: Local Pools Management
- **Create New Pool Button:** Opens a modal/inline form to create a new pool within this template.
- **Pool Cards/Rows:** Each local pool displays:
  - **Pool Name:** The name of the pool (unique within this template).
  - **Questions to Draw:** A numeric input specifying how many questions to randomly draw from this pool.
  - **Assigned Questions Count:** Shows how many questions from the global bank are currently assigned to this pool.
  - **Edit Pool Button:** Allows renaming the pool or changing the draw count.
  - **Delete Pool Button:** Removes the pool from the template (questions become unassigned).
- **Validation:** Draw count must be ≤ assigned questions count.

#### Section 3: Question Assignment
- **Tag Filter Control:** A multi-select dropdown for filtering questions from the global bank by tags.
- **Search Field:** A text input for searching questions by content.
- **Question List:** Displays questions from the global bank with:
  - **Checkbox:** For selecting questions (optional, for bulk operations).
  - **Question Preview:** Shows the question text.
  - **Tags:** Visual tag chips showing the question's tags.
  - **Points and Answer Count:** Quick metadata display.
  - **Assignment Status:**
    - **Unassigned:** Shows "Assign to: [Pool Dropdown]" to assign the question to a pool.
    - **Assigned:** Shows "Assigned to: [Pool Name]" with options to move to another pool or unassign.
- **Move To Button:** (For assigned questions) Opens a dropdown to move the question to a different pool within this template.
- **Unassign Button:** (For assigned questions) Removes the question from its current pool.
- **Constraint Enforcement:** A question can only be in one pool per template. If already assigned, the assign dropdown is replaced with move/unassign options.

#### Footer
- **Total Questions Display:** Shows the sum of "questions to draw" across all pools.
- **Cancel Button:** Returns to the Templates List without saving changes.
- **Save Template Button:** Validates and saves the template configuration.

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
  - Draw count for each pool cannot exceed the number of assigned questions.
  - Draw count must be a positive integer.
  - A question can only be in one pool per template (but can be in different pools in different templates).
- **Tag-Based Filtering:** The question assignment section includes tag-based filtering to help examiners quickly find relevant questions from the global bank.
- **Question Reusability:** The same question from the global bank can be used in multiple templates, and can be assigned to different pools in different templates.
- **Within-Template Constraint:** Within a single template, a question can only be assigned to one pool. Attempting to assign it to a second pool should either prevent the action or automatically move it from the first pool.
- **Empty State:** If the examiner has not created any test templates yet, the list page should display an empty state message.
- **Template Usage:** Templates are used when launching new test sessions (`US-007`). Deleting a template does not affect already completed or active test sessions.
- **Question Count Calculation:** The total questions count is the sum of "questions to draw" from all local pools.
- **Real-time Validation:** The editor should validate in real-time that draw counts don't exceed assigned questions, with visual feedback for invalid inputs.
- **Responsive Design:** The table and editor should be responsive and adapt to smaller screens.
- **Loading States:** Display appropriate loading indicators when fetching data or performing operations.
- **Error Handling:** Provide clear error messages if operations fail.
- **Success Feedback:** After successful creation, editing, or deletion, display a brief success message.
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers.
- **Drag and Drop:** Consider implementing drag-and-drop for assigning questions to pools for improved UX.
- **Bulk Assignment:** Consider adding bulk assignment features to assign multiple questions to a pool at once.
- **Template Wizard:** Consider providing a guided wizard for first-time template creation.
- **Pool Color Coding:** Consider using color coding for pools to make visual distinction easier in the question assignment section.

