# Participant Detail Modal

This modal overlay displays detailed individual test results for a specific participant, including their metadata, time tracking information, final score, and a question-by-question breakdown of their answers.

## Trigger

- **Action:** An examiner clicks on a participant's name or score in the participants table on the Test Session Report Page (only enabled for participants who have started their test).
- **Result:** The modal overlay appears on top of the Test Session Report Page, showing detailed results for the selected participant.

## Layout

The modal appears as an overlay centered on the screen with a semi-transparent backdrop. It displays the participant's identifying information at the top, followed by time tracking data, their overall score, and a detailed table showing each question with their answer, correctness, and points earned.

### Wireframe

```
+--------------------------------------------------+
||                                                  |
||  +--------------------------------------------+  |
||  | Participant Details                 [X]    |  |
||  +--------------------------------------------+  |
||  |                                            |  |
||  | Name/ID: John Doe                          |  |
||  | Access Code: ABC123XYZ (used)              |  |
||  | Started: Nov 15, 2025 at 3:00 PM          |  |
||  | Completed: Nov 15, 2025 at 4:00 PM        |  |
||  | Time Taken: 60 minutes (100% of limit)    |  |
||  | Final Score: 23/25 (92%)                   |  |
||  |                                            |  |
||  | +----------------------------------------+ |  |
||  | | Question | Answer | Result | Points   | |  |
||  | +----------------------------------------+ |  |
||  | | Q1       |  2x    |   ✓   |  1/1     | |  |
||  | | Q2       |  x=5   |   ✓   |  1/1     | |  |
||  | | Q3       |  ...   |   ✗   |  0/2     | |  |
||  | | ...      |  ...   |  ...  |  ...     | |  |
||  | +----------------------------------------+ |  |
||  |                                            |  |
||  |                           [Close]          |  |
||  +--------------------------------------------+  |
||                                                  |
+--------------------------------------------------+
```

#### For Participants Who Haven't Started

```
+--------------------------------------------------+
||                                                  |
||  +--------------------------------------------+  |
||  | Participant Details                 [X]    |  |
||  +--------------------------------------------+  |
||  |                                            |  |
||  | Name/ID: Bob Wilson                        |  |
||  | Access Code: XYZ789ABC (unused)            |  |
||  |                                            |  |
||  | This participant has not started the test  |  |
||  | yet. They can use their access code to     |  |
||  | begin when ready.                          |  |
||  |                                            |  |
||  |                           [Close]          |  |
||  +--------------------------------------------+  |
||                                                  |
+--------------------------------------------------+
```

### Component Descriptions

- **Modal Overlay:** A semi-transparent dark backdrop that covers the entire page and focuses attention on the modal.
- **Modal Container:** A white card-style container centered on the screen with rounded corners and shadow.
- **Modal Header:** Displays "Participant Details" as the title with a close button (X) in the top-right corner.
- **Close Button:** An X icon button in the top-right corner that closes the modal and returns to the Test Session Report Page.
- **Participant Metadata Section:** Displays key information about the participant:
  - **Name/ID:** The participant identifier as provided by the examiner when launching the session.
  - **Access Code:** The unique access code assigned to this participant, with status indication:
    - **(used)** - For participants who have started their test
    - **(unused)** - For participants who haven't started yet
- **Time Tracking Section:** Displays temporal information about the participant's test session (only shown for participants who have started):
  - **Started:** Timestamp showing when the participant began their test.
  - **Completed:** Timestamp showing when the participant finished their test (only shown if completed; omitted or shows "In Progress" if still taking the test).
  - **Time Taken:** The total duration the participant spent on the test, with comparison to the time limit (e.g., "60 minutes (100% of limit)" or "45 minutes (75% of limit)").
- **Final Score Display:** Shows the participant's overall score in both absolute points and percentage (e.g., "23/25 (92%)"). For in-progress tests, this shows their current score with an indicator like "18/25 (72%) - In Progress".
- **Question-by-Question Breakdown Table:** A detailed table showing the participant's performance on each question, with columns:
  - **Question:** The question number (Q1, Q2, etc.).
  - **Answer:** The participant's selected answer for that question. Shows their actual answer text.
  - **Result:** A visual indicator showing whether the answer was correct (✓) or incorrect (✗).
  - **Points:** Points earned for that question out of the total possible (e.g., "1/1" for correct, "0/2" for incorrect).
- **Close Button (Footer):** A "Close" button at the bottom of the modal that dismisses the modal and returns to the report page.
- **Not Started Message:** For participants who haven't begun their test, displays a message explaining that the participant hasn't started yet and can use their access code when ready.

## Interaction Details

- **Opening the Modal:** Clicking on a participant who has started their test opens the modal with full details. Clicking on a participant who hasn't started opens a simplified modal showing only their identifier, access code status, and a message that they haven't begun.
- **Closing the Modal:** The modal can be closed by:
  - Clicking the X button in the top-right corner
  - Clicking the "Close" button at the bottom of the modal
  - Clicking outside the modal on the backdrop (optional)
  - Pressing the Escape key on the keyboard
- **Scrolling:** If the content is long (many questions), the table section should be scrollable while keeping the participant metadata and header fixed at the top.

## Other Information

- **Data Display for In-Progress Tests:** If a participant is currently taking the test:
  - Show all questions, but only display answers for questions they've reached so far.
  - Questions not yet reached should show "-" or "Not answered yet" in the Answer column.
  - Mark their current status clearly (e.g., "In Progress" badge next to their score).
  - The Completed timestamp field should be replaced with "In Progress" text.
- **Correct Answer Display:** Consider showing the correct answer alongside the participant's answer for incorrect responses, making it easier for the examiner to understand what the participant missed. For example:
  - **Answer:** "a² + b = c²" (Participant's answer)
  - **Correct:** "a² + b² = c²" (Correct answer, shown only if participant was wrong)
- **Question Text Preview:** Consider showing a truncated version of the question text in the table for context, with a hover tooltip or expansion option to see the full question.
- **Time Efficiency Indicator:** Consider color-coding the "Time Taken" field:
  - Green if they finished well within the time limit (e.g., < 80% of time used)
  - Yellow/orange if they used most of the time (80-100%)
  - Red if they ran out of time (100% or timed out)
- **Unanswered Questions:** For completed tests, clearly distinguish between:
  - Questions answered incorrectly (shows participant's wrong answer)
  - Questions left unanswered (shows "-" or "No answer" with a special indicator)
- **Loading State:** If participant details take time to load, show a loading indicator inside the modal while fetching data.
- **Error Handling:** If there's an error loading participant details, display an error message in the modal with a retry option.
- **Empty State:** If a participant started but hasn't answered any questions yet (unlikely but possible), show an appropriate message.
- **Access Code Copy Feature:** For participants who haven't started, consider adding a "Copy Access Code" button next to the access code to make it easy for examiners to resend codes.
- **Data Privacy:** Only show detailed individual results for participants whose tests are part of the session owned by the logged-in examiner.
- **Question Ordering:** Display questions in the same order they appeared in the test for that participant (maintaining consistency with how they saw it).
- **Points Breakdown:** Ensure the sum of points in the question breakdown matches the final score displayed at the top.

