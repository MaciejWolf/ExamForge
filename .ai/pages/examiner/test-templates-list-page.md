# Test Templates List Page

This page displays a list of all saved test templates created by the examiner, allowing them to create new templates, view existing ones, edit them, or delete them to manage test generation rules.

## Navigation

- **Action:** An examiner clicks the "Create New Template" button.
- **Destination:** The Test Template Management Page opens in a modal/form on the same page (or navigates to a dedicated creation form).
- **Action:** An examiner clicks on a test template name or "View/Edit" button.
- **Destination:** The Test Template Management Page opens in a modal/form to view or edit the template configuration.
- **Action:** An examiner clicks the "Edit" button on a template row.
- **Destination:** The Test Template Management Page opens in a modal/form to edit the template name and question pool selection rules.
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
|  |                  |       |           |[Delete]|
|  +--------------------------------------------+  |
|  | Physics Quiz     |   2   |    15     | [View]|  |
|  |                  |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|
|  +--------------------------------------------+  |
|  | Chemistry        |   4   |    30     | [View]|  |
|  | Comprehensive    |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|
|  +--------------------------------------------+  |
|  | History          |   1   |    10     | [View]|  |
|  | Midterm          |       |           | [Edit]|  |
|  |                  |       |           |[Delete]|
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

#### Create/Edit Template Modal

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Create New Test Template        [X] |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | Template Name:                       |     |
|     | [_______________________________]    |     |
|     |                                      |     |
|     | Question Pool Selection:             |     |
|     |                                      |     |
|     | [✓] Mathematics Basic                |     |
|     |     Questions to draw: [10]          |     |
|     |     (Available: 15 questions)        |     |
|     |                                      |     |
|     | [✓] Physics Advanced                 |     |
|     |     Questions to draw: [5]           |     |
|     |     (Available: 8 questions)        |     |
|     |                                      |     |
|     | [ ] Chemistry Foundations            |     |
|     |     Questions to draw: [__]          |     |
|     |     (Available: 12 questions)       |     |
|     |                                      |     |
|     | Total Questions: 15                  |     |
|     |                                      |     |
|     |           [Cancel]  [Create Template]|     |
|     |                                      |     |
|     +--------------------------------------+     |
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
- **Create New Template Button:** A prominent button that triggers the creation flow for a new test template. When clicked, it opens a modal or navigates to the Test Template Management Page.
- **Test Templates Table/List:** A data table or card-based list displaying all test templates created by the examiner. Each row/card includes:
  - **Template Name:** The unique name of the test template, which may be clickable to navigate to the template details.
  - **Question Pools Count:** The number of question pools included in the template configuration.
  - **Total Questions:** The total number of questions that will be randomly drawn from all selected pools when a test is generated from this template.
  - **Action Buttons:**
    - **View Button:** Opens the Test Template Management Page in view mode to see the template configuration details.
    - **Edit Button:** Opens the Test Template Management Page in edit mode to modify the template name and question pool selection rules.
    - **Delete Button:** Triggers a confirmation dialog to delete the template.
- **Create/Edit Template Modal:** A modal dialog or overlay form containing:
  - **Template Name Input Field:** A text input for entering or editing the unique template name (required field).
  - **Question Pool Selection Section:** A list of available question pools with checkboxes and number inputs:
    - **Pool Checkbox:** Allows selecting which question pools to include in the template.
    - **Questions to Draw Input:** A numeric input field specifying how many questions should be randomly drawn from each selected pool (required when pool is selected, must be positive).
    - **Available Questions Display:** Shows the total number of questions available in each pool to help the examiner make informed decisions.
    - **Total Questions Display:** A calculated sum showing the total number of questions that will be drawn across all selected pools.
  - **Cancel Button:** Closes the modal without saving changes.
  - **Submit Button:** Saves the new or edited template (labeled "Create Template" or "Update Template" depending on context).
  - **Close Icon:** An "X" button in the top-right corner to dismiss the modal.
- **Delete Confirmation Dialog:** A modal dialog that appears when deleting a template, containing:
  - **Warning Message:** Explains that deletion is permanent and the template will no longer be available for launching new tests.
  - **Template Name Display:** Shows which template is being deleted for clarity.
  - **Cancel Button:** Closes the dialog without deleting.
  - **Confirm Delete Button:** Executes the deletion and returns to the updated list.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-006` (Creating Test Templates) and supports template viewing, editing, and deletion.
- **Functional Requirement Reference:** Implements `FR-04` (Managing Test Templates).
- **Template Name Uniqueness:** The system must validate that template names are unique within the examiner's account. If a duplicate name is entered, an error message should be displayed.
- **Question Pool Validation:** The system enforces the following rules when creating or editing templates:
  - At least one question pool must be selected.
  - The number of questions to draw from a pool cannot exceed the total number of questions available in that pool.
  - The number of questions to draw must be a positive integer.
  - If a pool is selected, the "questions to draw" field is required.
- **Empty State:** If the examiner has not created any test templates yet, the page should display an empty state message encouraging them to create their first template (e.g., "No test templates yet. Create your first template to get started!").
- **Template Usage:** Templates are used when launching new test sessions (`US-007`). Deleting a template does not affect already completed or active test sessions, but the template will no longer be available for creating new sessions.
- **Question Count Calculation:** The total questions count displayed in the list view is calculated by summing the "questions to draw" values from all selected pools in the template configuration.
- **Pool Availability:** Only question pools that belong to the examiner and contain at least one question should be available for selection in templates. Pools with zero questions should either be hidden or disabled with an explanatory message.
- **Real-time Validation:** When editing a template, the system should validate in real-time that the number of questions to draw does not exceed available questions in each pool. Visual feedback (e.g., red border, error message) should be provided for invalid inputs.
- **Template Dependencies:** Before allowing deletion, the system may want to check if the template is currently being used in any active test sessions and either prevent deletion or warn the examiner about the impact.
- **Responsive Design:** The table should be responsive and adapt to smaller screens, potentially converting to a card-based layout on mobile devices.
- **Sorting and Filtering:** For examiners with many templates, consider implementing sorting (by name, total questions, creation date) and search/filter functionality.
- **Loading States:** Display appropriate loading indicators when fetching the list of templates or performing create/edit/delete operations.
- **Error Handling:** Provide clear error messages if operations fail (e.g., network errors, validation errors, pool availability issues).
- **Success Feedback:** After successful creation, editing, or deletion, display a brief success message (e.g., toast notification).
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers.
- **Hover States:** Action buttons should have clear hover states to indicate interactivity.
- **Template Viewing:** Clicking the "View" button or the template name itself should open the Test Template Management Page in view mode, showing all configuration details including which pools are selected and how many questions will be drawn from each.
- **Template Editing:** The edit functionality allows examiners to modify both the template name and the question pool selection rules, providing flexibility to adjust templates as question pools evolve.
- **Question Pool Updates:** If a question pool used in a template is deleted or its question count changes, the template should handle this gracefully. Consider showing warnings if a template references pools with insufficient questions or deleted pools.
- **Template Duplication:** Consider adding a "Duplicate" action button to allow examiners to quickly create variations of existing templates.
- **Template Preview:** For future enhancement, consider adding a preview feature that shows examiners what a generated test would look like based on the template configuration (though this is out of scope for MVP).

