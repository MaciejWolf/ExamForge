# Question Pool Management Page

This page displays all questions belonging to a specific question pool, allowing the examiner to add new questions with multiple-choice answers, edit existing questions, or delete them.

## Navigation

- **Action:** An examiner clicks the "Add New Question" button.
- **Destination:** A modal/form opens on the same page to create a new question (or navigates to a dedicated creation form).
- **Action:** An examiner clicks the "Edit" button on a question row.
- **Destination:** A modal/form opens to edit the question details (or navigates to a dedicated edit form).
- **Action:** An examiner clicks the "Delete" button on a question row.
- **Destination:** A confirmation dialog appears; upon confirmation, the question is deleted and the page refreshes.
- **Action:** An examiner clicks the "Back to Question Pools" button or breadcrumb link.
- **Destination:** The Question Pools Management Page.
- **Action:** An examiner clicks the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.

## Layout

The page features a persistent header with the application title and user controls. The main content area displays a breadcrumb navigation, the current pool name as the page title, an action button to add new questions, and a list/table showing all questions in the pool with their details and action buttons.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  Question Pools > Mathematics Basic              |
|                                                  |
|  Mathematics Basic - Questions                   |
|                                                  |
|  [+ Add New Question]                            |
|                                                  |
|  +--------------------------------------------+  |
|  | #  | Question          | Answers | Points  |  |
|  |    |                   |          | Actions|  |
|  +--------------------------------------------+  |
|  | 1  | What is 2+2?      |    4     |   2    |  |
|  |    |                   |          |       |  |
|  |    |                   |          | [Edit] |  |
|  |    |                   |          |[Delete]|  |
|  +--------------------------------------------+  |
|  | 2  | Solve: 3x = 15    |    5     |   3    |  |
|  |    |                   |          |       |  |
|  |    |                   |          | [Edit] |  |
|  |    |                   |          |[Delete]|  |
|  +--------------------------------------------+  |
|  | 3  | What is the value |    4     |   4    |  |
|  |    | of π (pi)?        |          |       |  |
|  |    |                   |          | [Edit] |  |
|  |    |                   |          |[Delete]|  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

#### Add/Edit Question Modal

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Add New Question                [X] |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | Question Content:                    |     |
|     | [_______________________________]    |     |
|     | [_______________________________]    |     |
|     |                                      |     |
|     | Points:                              |     |
|     | [___]                                |     |
|     |                                      |     |
|     | Answer Options (2-6):                |     |
|     |                                      |     |
|     | [ ] Answer 1:                        |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | [✓] Answer 2: (Correct)              |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | [ ] Answer 3:                        |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | [ ] Answer 4:                        |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | [+ Add Answer]  [- Remove Answer]    |     |
|     |                                      |     |
|     |                                      |     |
|     |           [Cancel]  [Save Question]  |     |
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
|     | this question?                      |     |
|     |                                      |     |
|     | Question: "What is 2+2?"            |     |
|     |                                      |     |
|     | This action cannot be undone.       |     |
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
- **Breadcrumb Navigation:** Shows the navigation path (e.g., "Question Pools > Mathematics Basic") and allows clicking to navigate back to parent pages.
- **Page Title:** A heading displaying the pool name followed by "- Questions" to clearly identify which pool's questions are being managed.
- **Add New Question Button:** A prominent button that triggers the question creation flow. When clicked, it opens a modal or form.
- **Questions Table/List:** A data table or card-based list displaying all questions in the current pool. Each row/card includes:
  - **Question Number:** A sequential number for easy reference.
  - **Question Content:** A preview or full text of the question (may be truncated for long questions).
  - **Answer Count:** The number of answer options provided, with an indication of which one is correct.
  - **Points:** The point value assigned to the question.
  - **Action Buttons:**
    - **Edit Button:** Opens a modal or form to edit the question's content, answers, correct answer, and points.
    - **Delete Button:** Triggers a confirmation dialog to delete the question.
- **Add/Edit Question Modal:** A modal dialog or overlay form containing:
  - **Question Content Field:** A text input or textarea for entering the question text (required field, supports multi-line text).
  - **Points Field:** A numeric input for specifying the point value for the question (required, must be positive).
  - **Answer Options Section:** A dynamic list of answer input fields with the following features:
    - **Radio Button/Checkbox:** Allows marking exactly one answer as correct.
    - **Answer Text Field:** Text input for each possible answer (required for each answer).
    - **Add Answer Button:** Adds a new answer field (disabled when 6 answers exist).
    - **Remove Answer Button:** Removes an answer field (disabled when only 2 answers exist).
    - **Validation:** Ensures between 2 and 6 answers are provided, and exactly one is marked as correct.
  - **Cancel Button:** Closes the modal without saving changes.
  - **Save Button:** Validates and saves the question (labeled "Save Question" or "Update Question" depending on context).
  - **Close Icon:** An "X" button in the top-right corner to dismiss the modal.
- **Delete Confirmation Dialog:** A modal dialog that appears when deleting a question, containing:
  - **Warning Message:** Explains that deletion is permanent.
  - **Question Preview:** Shows a preview of the question being deleted for clarity.
  - **Cancel Button:** Closes the dialog without deleting.
  - **Confirm Delete Button:** Executes the deletion and returns to the updated list.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-005` (Adding Questions to a Pool) and supports question editing and deletion.
- **Functional Requirement Reference:** Implements `FR-03` (Managing Questions within Pools).
- **Pool Context:** The page always operates within the context of a specific question pool, identified via URL parameter or application state.
- **Answer Constraints:** The system enforces the following rules:
  - Minimum of 2 answer options required.
  - Maximum of 6 answer options allowed.
  - Exactly one answer must be marked as correct (single-choice format).
- **Question Validation:** All fields are required:
  - Question content must not be empty.
  - Points must be a positive number.
  - All answer fields must be filled in.
  - Exactly one correct answer must be selected.
- **Empty State:** If the pool contains no questions yet, the page should display an empty state message encouraging the examiner to add their first question (e.g., "No questions in this pool yet. Add your first question to get started!").
- **Question Display:** For long question text, consider showing a truncated preview in the list view with the ability to expand or view full details on edit.
- **Answer Preview:** The list view should indicate which answer option is correct, possibly showing the answer text or just noting "Option 2 of 4" or similar.
- **Template Dependencies:** If questions from this pool are currently used in generated tests or templates, the system should handle this gracefully (questions shouldn't be deleted if they're in active use, or at minimum, warn the examiner).
- **Responsive Design:** The table/list should be responsive and adapt to smaller screens, potentially converting to a card-based layout on mobile devices.
- **Sorting and Filtering:** For pools with many questions, consider implementing sorting (by points, creation date) and search/filter functionality by question content.
- **Loading States:** Display appropriate loading indicators when fetching questions or performing create/edit/delete operations.
- **Error Handling:** Provide clear error messages if operations fail (e.g., network errors, validation errors).
- **Success Feedback:** After successful creation, editing, or deletion, display a brief success message (e.g., toast notification).
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers. The correct answer selection should be clearly indicated for screen reader users.
- **Drag and Drop:** Consider implementing drag-and-drop functionality to reorder questions if question order is relevant for the application.
- **Bulk Operations:** For future enhancement, consider adding bulk delete or bulk edit capabilities for managing multiple questions at once.
- **Rich Text Support:** Consider whether question content and answers should support rich text formatting (bold, italic, special characters, etc.) or remain plain text.
- **Question Preview:** The edit modal could include a preview mode showing how the question will appear to test-takers.
- **Duplicate Question:** Consider adding a "Duplicate" action button to allow examiners to quickly create variations of existing questions.
- **Import/Export:** For future enhancement, consider allowing import/export of questions in common formats (CSV, JSON) for bulk operations.

