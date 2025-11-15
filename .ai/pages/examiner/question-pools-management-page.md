# Question Pools Management Page

This page displays a list of all question pools created by the examiner, allowing them to create new pools, edit existing ones, or delete them to organize questions by topic or theme.

## Navigation

- **Action:** An examiner clicks the "Create New Pool" button.
- **Destination:** A modal/form opens on the same page to enter the pool name (or navigates to a dedicated creation form).
- **Action:** An examiner clicks on a question pool name or "View/Edit" button.
- **Destination:** The Question Management Page (within that specific pool), showing all questions in the pool.
- **Action:** An examiner clicks the "Edit" button on a pool row.
- **Destination:** A modal/form opens to edit the pool name (or navigates to a dedicated edit form).
- **Action:** An examiner clicks the "Delete" button on a pool row.
- **Destination:** A confirmation dialog appears; upon confirmation, the pool is deleted and the page refreshes.
- **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.

## Layout

The page features a persistent header with the application title and user controls. The main content area consists of a page title, an action button to create a new pool, and a table/list displaying all existing question pools with their details and action buttons.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Dashboard                             |
|                                                  |
|  Question Pools Management                       |
|                                                  |
|  [+ Create New Pool]                             |
|                                                  |
|  +--------------------------------------------+  |
|  | Pool Name        | Questions | Actions     |  |
|  +--------------------------------------------+  |
|  | Mathematics      |    15     | [View]      |  |
|  | Basic            |           | [Edit]      |  |
|  |                  |           | [Delete]    |  |
|  +--------------------------------------------+  |
|  | Physics          |    23     | [View]      |  |
|  | Advanced         |           | [Edit]      |  |
|  |                  |           | [Delete]    |  |
|  +--------------------------------------------+  |
|  | Chemistry        |     8     | [View]      |  |
|  | Foundations      |           | [Edit]      |  |
|  |                  |           | [Delete]    |  |
|  +--------------------------------------------+  |
|  | History          |    12     | [View]      |  |
|  | World War II     |           | [Edit]      |  |
|  |                  |           | [Delete]    |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

#### Create/Edit Pool Modal

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Create New Question Pool        [X] |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | Pool Name:                           |     |
|     | [_______________________________]    |     |
|     |                                      |     |
|     |                                      |     |
|     |           [Cancel]  [Create Pool]    |     |
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
|     | the pool "Mathematics Basic"?       |     |
|     |                                      |     |
|     | This action cannot be undone.       |     |
|     | All questions in this pool will     |     |
|     | also be deleted.                    |     |
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
- **Page Title:** A heading that clearly identifies this page as "Question Pools Management."
- **Create New Pool Button:** A prominent button that triggers the creation flow for a new question pool. When clicked, it opens a modal or form.
- **Question Pools Table/List:** A data table or card-based list displaying all question pools created by the examiner. Each row/card includes:
  - **Pool Name:** The unique name of the question pool, which may be clickable to navigate to the questions within.
  - **Question Count:** The number of questions currently in the pool.
  - **Action Buttons:**
    - **View Button:** Opens the Question Management Page to view and manage questions within this pool.
    - **Edit Button:** Opens a modal or form to edit the pool's name.
    - **Delete Button:** Triggers a confirmation dialog to delete the pool and all its questions.
- **Create/Edit Pool Modal:** A modal dialog or overlay form containing:
  - **Pool Name Input Field:** A text input for entering or editing the unique pool name (required field).
  - **Cancel Button:** Closes the modal without saving changes.
  - **Submit Button:** Saves the new or edited pool (labeled "Create Pool" or "Update Pool" depending on context).
  - **Close Icon:** An "X" button in the top-right corner to dismiss the modal.
- **Delete Confirmation Dialog:** A modal dialog that appears when deleting a pool, containing:
  - **Warning Message:** Explains that deletion is permanent and will remove all questions in the pool.
  - **Pool Name Display:** Shows which pool is being deleted for clarity.
  - **Cancel Button:** Closes the dialog without deleting.
  - **Confirm Delete Button:** Executes the deletion and returns to the updated list.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-004` (Creating Question Pools) and supports pool editing and deletion.
- **Functional Requirement Reference:** Implements `FR-02` (Managing Question Pools).
- **Pool Name Uniqueness:** The system must validate that pool names are unique within the examiner's account. If a duplicate name is entered, an error message should be displayed.
- **Empty State:** If the examiner has not created any question pools yet, the page should display an empty state message encouraging them to create their first pool (e.g., "No question pools yet. Create your first pool to get started!").
- **Question Count Display:** The question count for each pool provides quick insight into the pool's size. Clicking on the count could optionally navigate to the Question Management Page.
- **Delete Cascade Warning:** When deleting a pool, the system should clearly warn that all questions within the pool will also be deleted. This is a destructive action.
- **Template Dependencies:** Before allowing deletion, the system may want to check if the pool is used in any test templates and either prevent deletion or warn the examiner about the impact.
- **Responsive Design:** The table should be responsive and adapt to smaller screens, potentially converting to a card-based layout on mobile devices.
- **Sorting and Filtering:** For examiners with many pools, consider implementing sorting (by name, question count, creation date) and search/filter functionality.
- **Loading States:** Display appropriate loading indicators when fetching the list of pools or performing create/edit/delete operations.
- **Error Handling:** Provide clear error messages if operations fail (e.g., network errors, validation errors).
- **Success Feedback:** After successful creation, editing, or deletion, display a brief success message (e.g., toast notification).
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers.
- **Hover States:** Action buttons should have clear hover states to indicate interactivity.
- **Pool Viewing:** Clicking the "View" button or the pool name itself should navigate to the detailed Question Management Page for that specific pool, where the examiner can add, edit, or remove individual questions (`US-005`).

