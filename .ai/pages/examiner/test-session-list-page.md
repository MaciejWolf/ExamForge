# Test Sessions List Page
This screen displays a list of all test sessions created by the examiner, providing a centralized view to manage and access all test sessions.

## Navigation
-   **Action:** An examiner clicks on a completed test session row or a "View Report" button associated with it.
-   **Destination:** The Test Session Report Page for the selected session.
-   **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
-   **Destination:** The Dashboard / Main Panel.
-   **Action:** An examiner clicks the "Logout" button in the header.
-   **Destination:** The Examiner Login Page.

## Layout
The page features a persistent header with the application title and user controls. The main content area consists of a page title and a table/list displaying all existing test sessions with their key information and action buttons.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Dashboard                             |
|                                                  |
|  Test Sessions List                              |
|                                                  |
|  +--------------------------------------------+  |
|  | Template Name    | Created At | Participants|  |
|  | Time Limit | Status     | Actions     |  |
|  +--------------------------------------------+  |
|  | Math Final       | 2025-11-15 | 25          |  |
|  | Exam             | 60 min     | Completed  | [View Report]|
|  +--------------------------------------------+  |
|  | Physics Quiz     | 2025-11-14 | 15          |  |
|  |                  | 45 min     | Active     | [View Summary]|
|  +--------------------------------------------+  |
|  | Chemistry        | 2025-11-13 | 30          |  |
|  | Comprehensive    | 90 min     | Completed  | [View Report]|
|  +--------------------------------------------+  |
|  | History          | 2025-11-12 | 10          |  |
|  | Midterm          | 30 min     | Active     | [View Summary]|
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions
-   **Application Header:** A persistent header bar displaying "ExamForge" on the left and user information on the right, consistent across all examiner pages.
-   **User Information Display:** Shows the currently logged-in examiner's email address in the top-right corner.
-   **Logout Button:** A button in the header that signs the examiner out and returns them to the login page.
-   **Back to Dashboard Link:** A navigation link that returns the examiner to the main dashboard.
-   **Page Title:** A heading that clearly identifies this page as "Test Sessions List."
-   **Test Sessions Table/List:** A data table or card-based list displaying all test sessions created by the examiner. Each row/card includes:
    -   **Template Name:** The name of the test template used for this session.
    -   **Created At:** The date and time the session was launched.
    -   **Time Limit:** The time limit set for the test session in minutes.
    -   **Participants:** The total number of participants assigned to this session.
    -   **Status:** The current status of the test session (e.g., "Active", "Completed", "In Progress", "Expired").
    -   **Action Buttons:**
        -   **View Report Button:** For completed sessions, navigates to the detailed Test Session Report Page.
        -   **View Summary Button:** For active sessions, navigates to a summary view (potentially the Test Session Report Page with only aggregate data available).

## Other Information
-   **Authentication:** This page is accessible only to authenticated examiners and only displays sessions they have created.
-   **User Story Reference:** This page primarily implements `US-007` (Launching Test from Template) by providing access to the created sessions, and `US-011` (Viewing Test Results) by linking to reports.
-   **Functional Requirement Reference:** Implements `FR-06` (Viewing Test Results and Reports).
-   **Session Status:** The status column should clearly indicate the current state of each session.
    -   **Active:** Participants can still take the test.
    -   **Completed:** All participants have finished or the session has been manually closed.
    -   **In Progress:** Some participants are still taking the test, others may have completed.
    -   **Expired:** The time limit for the session has passed, and no new participants can start.
-   **Empty State:** If the examiner has not created any test sessions yet, the page should display an empty state message encouraging them to launch their first test (e.g., "No test sessions yet. Launch a new test session to get started!").
-   **Sorting and Filtering:** For examiners with many sessions, consider implementing sorting (by creation date, template name, status) and search/filter functionality.
-   **Loading States:** Display appropriate loading indicators when fetching the list of sessions.
-   **Error Handling:** Provide clear error messages if operations fail (e.g., network errors).
-   **Responsive Design:** The table should be responsive and adapt to smaller screens, potentially converting to a card-based layout on mobile devices.
-   **Data Consistency:** Ensure that the information displayed (e.g., participant count, status) is always up-to-date with the backend.