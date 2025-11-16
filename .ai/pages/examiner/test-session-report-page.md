# Test Session Report Page

This page displays a comprehensive report of a test session, showing all participants (including those who haven't started), their scores, aggregate statistics, and detailed question analysis to help the examiner evaluate test results and identify areas of improvement.

## Navigation

- **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.
- **Action:** An examiner clicks on a participant's name or score in the participants list (only for participants who have started).
- **Destination:** A detailed participant results modal/overlay showing individual test results (see separate Participant Detail Modal document).
- **Action:** An examiner clicks "View All Sessions" or "Back to Reports".
- **Destination:** A list of all test sessions (Test Sessions List Page, if implemented, otherwise Dashboard).

## Layout

The page features a persistent header with the application title and user controls. The main content area is divided into three sections: a session information header displaying test metadata, a participants summary section showing all participants with their scores, and a questions analysis section displaying aggregate statistics for each question in the test.

### Wireframe

```
+--------------------------------------------------+
||  ExamForge                          User: [Email] |
||                                        [Logout]   |
+--------------------------------------------------+
||                                                  |
||  < Back to Dashboard                             |
||                                                  |
||  Test Session Report                             |
||                                                  |
||  +--------------------------------------------+  |
||  | Session Details                             |  |
||  |                                            |  |
||  | Template: Math Final Exam                  |  |
||  | Launched: Nov 15, 2025 at 2:30 PM         |  |
||  | Time Limit: 60 minutes                     |  |
||  | Status: Active                             |  |
||  | Participants: 25                           |  |
||  |   - Completed: 22                          |  |
||  |   - In Progress: 1                         |  |
||  |   - Not Started: 2                         |  |
||  +--------------------------------------------+  |
||                                                  |
||  Participants Summary                            |
||                                                  |
||  +--------------------------------------------+  |
||  | Participant     | Score | Percentage |Status|  |
||  +--------------------------------------------+  |
||  | John Doe        | 23/25 |    92%     |  ✓  |  |
||  +--------------------------------------------+  |
||  | Jane Smith      | 21/25 |    84%     |  ✓  |  |
||  +--------------------------------------------+  |
||  | STU-2024-001    | 19/25 |    76%     |  ✓  |  |
||  +--------------------------------------------+  |
||  | Michael Johnson | 17/25 |    68%     |  ✓  |  |
||  +--------------------------------------------+  |
||  | Sarah Williams  | 15/25 |    60%     |  ✓  |  |
||  +--------------------------------------------+  |
||  | ...             | ...   |    ...     | ... |  |
||  +--------------------------------------------+  |
||  | Alice Brown     | 18/25 |    72%     |  ⏳ |  |
||  +--------------------------------------------+  |
||  | Bob Wilson      |  -/25 |     -      |  ○  |  |
||  +--------------------------------------------+  |
||  | Carol Davis     |  -/25 |     -      |  ○  |  |
||  +--------------------------------------------+  |
||                                                  |
||  Average Score: 19.2/25 (76.8%)                 |
||  Highest Score: 23/25 (92%)                     |
||  Lowest Score: 15/25 (60%)                      |
||                                                  |
+--------------------------------------------------+
||                                                  |
||  Question Analysis                               |
||                                                  |
||  +--------------------------------------------+  |
||  | Q1. What is the derivative of x²?          |  |
||  +--------------------------------------------+  |
||  | Correct Answer: 2x                         |  |
||  | Correct Responses: 22/24 (91.7%)          |  |
||  | Points: 1                                  |  |
||  | 91.7% correct                              |  |
||  +--------------------------------------------+  |
||                                                  |
||  +--------------------------------------------+  |
||  | Q2. Solve for x: 3x + 5 = 20               |  |
||  +--------------------------------------------+  |
||  | Correct Answer: x = 5                      |  |
||  | Correct Responses: 20/24 (83.3%)          |  |
||  | Points: 1                                  |  |
||  | 83.3% correct                              |  |
||  +--------------------------------------------+  |
||                                                  |
||  +--------------------------------------------+  |
||  | Q3. What is the Pythagorean theorem?       |  |
||  +--------------------------------------------+  |
||  | Correct Answer: a² + b² = c²              |  |
||  | Correct Responses: 12/24 (50.0%)          |  |
||  | Points: 2                                  |  |
||  | 50.0% correct                              |  |
||  +--------------------------------------------+  |
||                                                  |
||  ... (more questions)                            |
||                                                  |
+--------------------------------------------------+
```

### Component Descriptions

- **Application Header:** A persistent header bar displaying "ExamForge" on the left and user information on the right, consistent across all examiner pages.
- **User Information Display:** Shows the currently logged-in examiner's email address in the top-right corner.
- **Logout Button:** A button in the header that signs the examiner out and returns them to the login page.
- **Back to Dashboard Link:** A navigation link that returns the examiner to the main dashboard.
- **Page Title:** A heading that clearly identifies this page as "Test Session Report."
- **Session Details Card:** A prominent card at the top of the page displaying key information about the test session:
  - **Template Name:** The name of the test template used to generate this session.
  - **Launch Date/Time:** The date and time when the test session was created by the examiner.
  - **Time Limit:** The allocated time limit for the test in minutes.
  - **Status:** Current status of the session (e.g., "Active", "Completed", "In Progress").
  - **Participants Count:** Total number of participants in the session, with a detailed breakdown showing:
    - How many have completed the test
    - How many are currently in progress
    - How many have not started yet (have access codes but haven't used them)
- **Participants Summary Table:** A sortable data table displaying all participants in the test session, including those who have not yet started their test. Each row includes:
  - **Participant Identifier:** The name, student ID, or identifier provided by the examiner when launching the session. This is clickable to view detailed individual results (only for participants who have started the test).
  - **Score:** The participant's score displayed as points earned out of total possible points (e.g., "23/25"). For participants who haven't started, this shows "-/25" (dash for zero) to indicate no score yet.
  - **Percentage:** The score as a percentage for easier comparison (e.g., "92%"). For participants who haven't started, this shows "-" to indicate no data.
  - **Status Icon:** A visual indicator showing whether the participant has completed the test (✓), is in progress (⏳), or has not started yet (○).
  - The table supports sorting by participant name, score, percentage, and status.
- **Summary Statistics Section:** A section displaying aggregate statistics for the entire test session:
  - **Average Score:** The mean score across all completed participants.
  - **Highest Score:** The best score achieved by any participant.
  - **Lowest Score:** The lowest score among completed participants.
  - **Completion Rate:** Percentage of participants who have completed the test.
- **Question Analysis Section:** A detailed breakdown of each question in the test, including:
  - **Question Number and Text:** The question identifier (Q1, Q2, etc.) and the full question text.
  - **Correct Answer:** The correct answer for reference.
  - **Correct Responses Count and Percentage:** How many participants answered correctly out of those who completed the test, displayed as both a count (e.g., "22/24") and percentage (e.g., "91.7%").
  - **Points Value:** The number of points this question is worth.
  - **Color-Coded Performance Indicator:** Text showing the percentage of correct responses, color-coded to indicate performance (green for high success rates, yellow/orange for moderate, red for low).
- **Participant Detail Modal/Panel:** Opens a separate modal view showing detailed individual results. See the separate "Participant Detail Modal" document for full specifications.
- **Sort Controls:** Column headers in the participants table that allow sorting by participant name, score, percentage, or status (ascending/descending).
- **Loading Indicator:** A spinner or loading message displayed while fetching the report data from the backend.
- **Empty State:** If the session has no participants or no one has completed the test yet, display an appropriate message (e.g., "No completed tests yet. Results will appear here as participants complete their tests.").
- **Session Closure Button:** For active sessions, a button to manually close the session, preventing further participation and finalizing the results.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners and only for test sessions they have created.
- **User Story Reference:** This page primarily implements `US-011` (Viewing Test Results).
- **Functional Requirement Reference:** Implements `FR-06` (Viewing Test Results and Reports).
- **All Participants Displayed:** The report displays ALL participants who were included when the test session was launched, regardless of whether they have started the test or not. This allows the examiner to track who has and hasn't begun their test, making it easier to follow up with participants who haven't started yet.
- **Data Privacy:** Ensure that examiners can only view reports for test sessions they have created. The system must validate examiner ownership before displaying any session data.
- **Session Status:** The page should clearly distinguish between:
  - **Active Sessions:** Tests are still in progress, and results may be incomplete.
  - **Completed Sessions:** All participants have finished or the session has been closed.
  - **Expired Sessions:** The time limit has passed for all participants.
- **Participant Status Types:**
  - **Completed:** Participant has finished the test and submitted their answers.
  - **In Progress:** Participant has started the test but has not yet finished.
  - **Not Started:** Participant has an access code but has not yet used it to begin the test.
  - **Timed Out:** Participant's time expired before they could complete all questions.
- **Score Calculation:** Scores are calculated by summing the points earned for correct answers. Each question has a point value, and participants earn full points for correct answers and zero points for incorrect or unanswered questions.
- **Percentage Calculation:** Percentages are calculated as (points earned / total possible points) × 100.
- **Question Statistics Calculation:** For question analysis, only completed tests should be included in the statistics. In-progress or not-started tests should not affect the percentage of correct responses.
- **Sorting Functionality:** The participants table should support sorting by:
  - Participant name/identifier (alphabetical)
  - Score (highest to lowest or vice versa)
  - Percentage (highest to lowest or vice versa)
  - Status (e.g., completed first, then in-progress, then not started, or vice versa)
  
  Note: When sorting by score or percentage, participants who have not started (with no score) should appear at the bottom of the list.
- **Visual Indicators for Question Performance:**
  - **High Performance (75-100% correct):** Green color for the percentage text.
  - **Moderate Performance (50-74% correct):** Yellow/orange color for the percentage text.
  - **Low Performance (0-49% correct):** Red color for the percentage text.
  - These color-coded indicators help examiners quickly identify questions that were particularly difficult for participants.
- **Question Difficulty Analysis:** The question analysis section helps examiners identify:
  - Questions that were too easy (very high success rates may indicate the question should be more challenging).
  - Questions that were too difficult (very low success rates may indicate the question needs revision or was poorly worded).
  - Questions that effectively discriminate between high and low performers.
- **Empty State Handling:**
  - All participants are shown in the list from the moment the session is created, even if none have started yet.
  - If no participants have completed the test yet, the aggregate statistics (average, highest, lowest scores) should display appropriate messages like "No completed tests yet" or be calculated only from completed participants.
  - If a participant has not started the test, display "-" for their score and percentage, with a "Not Started" status icon (○).
  - If a participant's test is in progress, display their current score with an indicator that it's incomplete (e.g., "12/25 (In Progress)") and show the in-progress status icon (⏳).
- **Time Zone Display:** All timestamps should be displayed in the examiner's local time zone or clearly indicate the time zone being used.
- **Access Code Tracking:** The system tracks which access code was assigned to each participant and its status (used/unused). This information is displayed in the participant detail modal.
- **Question Pool Attribution:** For each question, consider showing which question pool it came from, helping the examiner understand whether certain pools produce harder or easier questions.
- **Response Time Analysis:** If the system tracks how long participants spend on each question, consider adding average time per question to the analysis.

- **Responsive Design:** The tables and cards should adapt to smaller screens:
  - Participants table may convert to a card layout on mobile.
  - Question analysis section should stack vertically on narrow screens.
- **Loading and Error States:** Display appropriate feedback for:
  - Loading report data (spinner with message like "Loading test results...")
  - Network errors (error message with retry button)
  - No data available (empty state with helpful message)
- **Session Closure:** If a session is still active, a "Close Session" button allows the examiner to manually end the session, preventing further participation and finalizing the results.
