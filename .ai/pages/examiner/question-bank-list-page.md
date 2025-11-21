# Question Bank List Page

This page displays all questions in the examiner's global question bank, allowing them to create new questions, edit existing ones, or delete them. Questions are organized by tags for flexible filtering and discovery.

## Navigation

- **Action:** An examiner clicks the "Create New Question" button.
- **Destination:** The Question Management Page/Modal opens to create a new question.
- **Action:** An examiner clicks on a question or "Edit" button.
- **Destination:** The Question Management Page/Modal opens to edit the question.
- **Action:** An examiner clicks the "Delete" button on a question row.
- **Destination:** A confirmation dialog appears; upon confirmation, the question is deleted (if not used in any template).
- **Action:** An examiner clicks on a tag filter.
- **Destination:** The question list is filtered to show only questions with that tag.
- **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.

## Layout

The page features a persistent header with the application title and user controls. The main content area consists of a page title, tag statistics, filter controls, an action button to create a new question, and a table/list displaying all questions with their details and action buttons.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Dashboard                             |
|                                                  |
|  Question Bank                                   |
|                                                  |
|  Tag Statistics:                                 |
|  [Mathematics: 15] [Physics: 23] [Chemistry: 8]  |
|  [History: 12] [Advanced: 18] [Basic: 20]        |
|                                                  |
|  Filter by Tags: [Select tags...        v]       |
|  Search: [_______________________________]       |
|                                                  |
|  [+ Create New Question]                         |
|                                                  |
|  +--------------------------------------------+  |
|  | Question      | Tags        | Answers | Pts |  |
|  |               |             |         | Act |  |
|  +--------------------------------------------+  |
|  | What is 2+2?  | Mathematics |    4    |  2  |  |
|  |               | Basic       |         |     |  |
|  |               |             |         |[Edit]|  |
|  |               |             |         |[Del] |  |
|  +--------------------------------------------+  |
|  | Solve: 3x=15  | Mathematics |    5    |  3  |  |
|  |               | Advanced    |         |     |  |
|  |               |             |         |[Edit]|  |
|  |               |             |         |[Del] |  |
|  +--------------------------------------------+  |
|  | Newton's 1st  | Physics     |    4    |  3  |  |
|  | Law states... | Advanced    |         |     |  |
|  |               |             |         |[Edit]|  |
|  |               |             |         |[Del] |  |
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

#### Delete Protection Dialog

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Cannot Delete Question         [X]   |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | This question cannot be deleted     |     |
|     | because it is currently used in     |     |
|     | the following templates:            |     |
|     |                                      |     |
|     | • Math Final Exam                   |     |
|     | • Physics Quiz                      |     |
|     |                                      |     |
|     | Remove it from these templates      |     |
|     | before deleting.                    |     |
|     |                                      |     |
|     |                    [OK]              |     |
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
- **Page Title:** A heading that clearly identifies this page as "Question Bank."
- **Tag Statistics Section:** A visual display showing all tags used in the question bank with the count of questions for each tag. Tags are displayed as clickable chips/badges that can be used for quick filtering.
- **Tag Filter Control:** A multi-select dropdown or tag picker that allows filtering questions by one or more tags. Supports AND/OR logic for multiple tag selection.
- **Search Field:** A text input for searching questions by content.
- **Create New Question Button:** A prominent button that triggers the question creation flow. When clicked, it opens the Question Management Page/Modal.
- **Questions Table/List:** A data table or card-based list displaying all questions in the global bank. Each row/card includes:
  - **Question Content:** A preview or full text of the question (may be truncated for long questions).
  - **Tags:** Visual tag chips/badges showing all tags assigned to the question.
  - **Answer Count:** The number of answer options provided.
  - **Points:** The point value assigned to the question.
  - **Action Buttons:**
    - **Edit Button:** Opens the Question Management Page/Modal to edit the question.
    - **Delete Button:** Triggers a confirmation dialog to delete the question (with protection if used in templates).
- **Delete Confirmation Dialog:** A modal dialog that appears when deleting a question, containing:
  - **Warning Message:** Explains that deletion is permanent.
  - **Question Preview:** Shows a preview of the question being deleted for clarity.
  - **Cancel Button:** Closes the dialog without deleting.
  - **Confirm Delete Button:** Executes the deletion and returns to the updated list.
- **Delete Protection Dialog:** A modal dialog that appears when attempting to delete a question that is used in templates, containing:
  - **Error Message:** Explains that the question cannot be deleted.
  - **Template List:** Shows which templates currently use this question.
  - **Guidance:** Instructs the examiner to remove the question from templates first.
  - **OK Button:** Closes the dialog.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-004` (Managing Questions in the Global Bank).
- **Functional Requirement Reference:** Implements `FR-02` (Managing Questions).
- **Global Question Bank:** Questions exist independently in a global bank, not tied to any specific pool. They can be assigned to pools within templates.
- **Tag-Based Organization:** Questions are organized using tags rather than pools, allowing for flexible, multi-dimensional categorization. A single question can have multiple tags.
- **Tag Statistics:** The tag statistics section provides quick insight into the distribution of questions across different categories, helping examiners understand their question bank composition.
- **Tag Filtering:** Examiners can filter questions by selecting one or more tags. The system should support both AND logic (show questions with all selected tags) and OR logic (show questions with any selected tag), with a toggle to switch between modes.
- **Search Functionality:** The search field allows examiners to find questions by searching the question content text.
- **Delete Protection:** Questions that are currently assigned to any pool within any template cannot be deleted. The system must check all templates and prevent deletion if the question is in use, displaying which templates use the question.
- **Empty State:** If the examiner has not created any questions yet, the page should display an empty state message encouraging them to create their first question (e.g., "No questions in your bank yet. Create your first question to get started!").
- **Question Count Display:** The total number of questions in the bank should be displayed prominently (e.g., "Question Bank (47 questions)").
- **Responsive Design:** The table should be responsive and adapt to smaller screens, potentially converting to a card-based layout on mobile devices.
- **Sorting:** Implement sorting by question content, points, number of answers, or creation date.
- **Pagination:** For large question banks, implement pagination or infinite scroll to improve performance.
- **Loading States:** Display appropriate loading indicators when fetching questions or performing create/edit/delete operations.
- **Error Handling:** Provide clear error messages if operations fail (e.g., network errors, validation errors).
- **Success Feedback:** After successful creation, editing, or deletion, display a brief success message (e.g., toast notification).
- **Accessibility:** Ensure all interactive elements are keyboard accessible and properly labeled for screen readers.
- **Hover States:** Action buttons and tag chips should have clear hover states to indicate interactivity.
- **Tag Management:** When filtering by tags, the selected tags should be visually indicated (e.g., highlighted chips). Clicking a tag again should remove it from the filter.
- **Question Reusability:** The same question can be assigned to different pools in different templates, or to different pools within the same template is NOT allowed (one pool per question per template).
- **Bulk Operations:** For future enhancement, consider adding bulk delete or bulk tag editing capabilities for managing multiple questions at once.
- **Import/Export:** For future enhancement, consider allowing import/export of questions in common formats (CSV, JSON) for bulk operations.
- **Question Preview:** Consider adding a preview mode that shows how the question will appear to test-takers without opening the edit modal.
