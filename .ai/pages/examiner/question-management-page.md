# Question Management Page

This page/modal allows examiners to create new questions or edit existing questions in the global question bank. Questions include multiple-choice answers, point values, and tags for organization.

## Navigation

- **Action:** An examiner clicks the "Save Question" button.
- **Destination:** The question is saved to the global bank, and the page/modal closes, returning to the Question Bank List Page.
- **Action:** An examiner clicks the "Cancel" button or close icon.
- **Destination:** The page/modal closes without saving, returning to the Question Bank List Page.
- **Action:** An examiner clicks the "Add Answer" button.
- **Destination:** A new answer input field is added to the form (up to 6 answers).
- **Action:** An examiner clicks the "Remove Answer" button.
- **Destination:** The last answer input field is removed from the form (minimum 2 answers).

## Layout

The page/modal features a form for entering question details, including content, points, answer options, and tags. The layout is designed to be clear and intuitive, with validation feedback.

### Wireframe

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
|     | Tags:                                |     |
|     | [Mathematics] [Basic] [x]            |     |
|     | [_______________________________]    |     |
|     | Suggestions: Algebra, Geometry...    |     |
|     |                                      |     |
|     | Answer Options (2-6):                |     |
|     |                                      |     |
|     | ( ) Answer 1:                        |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | (•) Answer 2: (Correct)              |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | ( ) Answer 3:                        |     |
|     |     [_______________________________]|     |
|     |                                      |     |
|     | ( ) Answer 4:                        |     |
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

#### Edit Mode with Template Usage Warning

```
+--------------------------------------------------+
|                                                  |
|     +--------------------------------------+     |
|     | Edit Question                   [X] |     |
|     +--------------------------------------+     |
|     |                                      |     |
|     | ⚠️ Warning: This question is used in |     |
|     | 2 templates. Changes will affect:   |     |
|     | • Math Final Exam                   |     |
|     | • Physics Quiz                      |     |
|     |                                      |     |
|     | Question Content:                    |     |
|     | [What is 2+2?___________________]    |     |
|     |                                      |     |
|     | Points: [2]                          |     |
|     |                                      |     |
|     | Tags: [Mathematics] [Basic] [x]      |     |
|     | [_______________________________]    |     |
|     |                                      |     |
|     | Answer Options (2-6):                |     |
|     | ( ) Answer 1: [3________________]    |     |
|     | (•) Answer 2: [4________________]    |     |
|     | ( ) Answer 3: [5________________]    |     |
|     | ( ) Answer 4: [22_______________]    |     |
|     |                                      |     |
|     | [+ Add Answer]  [- Remove Answer]    |     |
|     |                                      |     |
|     |           [Cancel]  [Update Question]|     |
|     |                                      |     |
|     +--------------------------------------+     |
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions

- **Modal/Page Header:** Displays the title "Add New Question" or "Edit Question" depending on the mode, with a close icon (X) in the top-right corner.
- **Template Usage Warning:** (Edit mode only) A prominent warning banner that appears when editing a question that is currently used in one or more templates. Lists the affected templates to inform the examiner of the impact.
- **Question Content Field:** A multi-line text input (textarea) for entering the question text. Required field with validation.
- **Points Field:** A numeric input for specifying the point value for the question. Required field, must be a positive integer.
- **Tags Section:** A tag management interface with the following features:
  - **Tag Chips:** Visual badges/chips displaying currently selected tags. Each chip has a remove button (×) to deselect the tag.
  - **Tag Input Field:** A text input with autocomplete functionality. As the examiner types, it suggests existing tags from the question bank.
  - **Tag Suggestions:** A dropdown or inline list showing suggested tags based on the current input. Clicking a suggestion adds it to the selected tags.
  - **Multiple Tag Selection:** Allows selecting multiple tags for a single question.
  - **Tag Consistency:** Autocomplete helps maintain consistent tag naming across the question bank.
- **Answer Options Section:** A dynamic list of answer input fields with the following features:
  - **Radio Buttons:** Allows marking exactly one answer as correct. Only one radio button can be selected at a time.
  - **Answer Text Fields:** Text inputs for each possible answer option. Required for each answer.
  - **Add Answer Button:** Adds a new answer field. Disabled when 6 answers exist (maximum limit).
  - **Remove Answer Button:** Removes the last answer field. Disabled when only 2 answers exist (minimum limit).
  - **Answer Count Indicator:** Shows the current number of answers (e.g., "Answer Options (2-6): 4 answers").
- **Cancel Button:** Closes the modal/page without saving changes and returns to the Question Bank List Page.
- **Save/Update Button:** Validates the form and saves the question to the global bank. Button label changes to "Save Question" for new questions or "Update Question" for editing existing questions.
- **Close Icon:** An "X" button in the top-right corner of the modal header to dismiss without saving.

## Other Information

- **Authentication:** This page/modal is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-004` (Managing Questions in the Global Bank).
- **Functional Requirement Reference:** Implements `FR-02` (Managing Questions).
- **Modal vs. Page:** This can be implemented as either a modal dialog overlay or a dedicated page, depending on the overall application design. Modal is recommended for better user flow continuity.
- **Question Validation:** All fields are required and validated before saving:
  - Question content must not be empty.
  - Points must be a positive integer (greater than 0).
  - At least one tag should be selected (recommended but may be optional).
  - Between 2 and 6 answer options must be provided.
  - All answer fields must be filled in (no empty answers).
  - Exactly one answer must be marked as correct.
- **Tag Autocomplete:** The tag input field should provide autocomplete suggestions based on existing tags in the question bank. This helps maintain consistency and prevents duplicate tags with slight variations (e.g., "Math" vs. "Mathematics").
- **Tag Creation:** If an examiner types a tag that doesn't exist in the system, it should be created automatically when the question is saved. This allows for organic growth of the tag taxonomy.
- **Tag Display:** Tags should be displayed as visual chips/badges with distinct colors or styling to make them easily scannable.
- **Answer Constraints:** The system enforces the following rules:
  - Minimum of 2 answer options required.
  - Maximum of 6 answer options allowed.
  - Exactly one answer must be marked as correct (single-choice format).
- **Dynamic Answer Fields:** The Add/Remove Answer buttons should dynamically add or remove answer input fields, with appropriate enable/disable states based on the current count.
- **Template Usage Warning:** When editing an existing question, the system should check if the question is currently assigned to any pools within any templates. If so, display a prominent warning listing the affected templates to inform the examiner that changes will impact those templates.
- **Real-time Validation:** Provide real-time validation feedback as the examiner fills out the form:
  - Highlight required fields that are empty.
  - Show error messages for invalid inputs (e.g., negative points, empty answers).
  - Indicate when exactly one correct answer is not selected.
- **Loading States:** Display appropriate loading indicators when saving the question.
- **Error Handling:** Provide clear error messages if save operations fail (e.g., network errors, validation errors).
- **Success Feedback:** After successful save, display a brief success message (e.g., toast notification) and close the modal/return to the Question Bank List Page.
- **Accessibility:** Ensure all form fields are properly labeled for screen readers. The correct answer selection should be clearly indicated for screen reader users. Keyboard navigation should work smoothly through all form fields.
- **Unsaved Changes Warning:** If the examiner attempts to close the modal/page with unsaved changes, consider showing a confirmation dialog to prevent accidental data loss.
- **Rich Text Support:** Consider whether question content and answers should support rich text formatting (bold, italic, special characters, mathematical symbols) or remain plain text. For MVP, plain text is sufficient, but rich text could be a future enhancement.
- **Question Preview:** Consider adding a preview section that shows how the question will appear to test-takers as the examiner fills out the form.
- **Character Limits:** Consider implementing reasonable character limits for question content and answer text to ensure proper display in the UI.
- **Tag Limits:** Consider whether to limit the number of tags per question (e.g., maximum 5 tags) to prevent over-tagging.
- **Duplicate Detection:** For future enhancement, consider detecting potential duplicate questions based on similar content and warning the examiner before saving.
- **Image Support:** For future enhancement, consider allowing images to be included in questions and answers for visual questions (diagrams, charts, etc.).
