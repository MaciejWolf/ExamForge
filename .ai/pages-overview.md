# ExamForge Application Screens Overview

Based on the Product Requirements Document (PRD), below is a comprehensive list of screens that the ExamForge application should have, organized by user type and functionality.

## Public / Common Screens

### 1. Start Page (for Participants)
**Description:** This is the application's landing page for test-takers. It features a single input field where a participant can enter their unique access code to begin a test session, as described in user story `US-008`. It will also provide feedback for invalid or used codes.

### 2. Examiner Registration Page
**Description:** A form for new examiners to create an account. It will include fields for email, password, and password confirmation. The system will validate the data, check for unique email addresses, and ensure password security requirements are met (`US-001`).

### 3. Examiner Login Page
**Description:** A form for registered examiners to sign in to their accounts using their email and password (`US-002`). It will also include a link to the password recovery page.

### 4. Password Recovery Page
**Description:** A process for examiners who have forgotten their password. It will start with a screen asking for their email address. After submitting, they will receive an email with a unique link to a second screen where they can set a new password (`US-003`).

## Examiner-Authenticated Screens

### 5. Dashboard / Main Panel
**Description:** The central hub for an examiner after logging in. This screen will provide primary navigation to the main sections of the application: Question Pools, Test Templates, and Test Sessions.

### 6. Question Pools List Page
**Description:** This screen displays a list of all question pools created by the examiner. It allows them to create new pools, edit existing ones, or delete them (`US-004`). Creating a new pool would likely open a modal or a dedicated form to enter its unique name.

### 7. Question Pool Management Page
**Description:** A view that shows all questions belonging to a specific pool. From here, an examiner can add a new question to the pool (`US-005`). This involves a form with fields for the question's content, 2 to 6 possible answers, a way to mark the correct one, and the number of points for the question.

### 8. Test Templates List Page
**Description:** This screen displays a list of all saved test templates. It enables the examiner to create, view, edit, or delete templates (`US-006`). Template creation and editing are handled via modal dialogs on this page, where the examiner can give the template a name and specify rules for test generation, such as selecting various question pools and defining how many questions should be randomly drawn from each. The page includes dialogs for creating new templates, editing existing ones, viewing template details, and confirming deletions.

### 9. Test Session Launch Page
**Description:** A screen where an examiner initiates a new test. They select an existing test template, set a time limit in minutes, and paste a list of participant identifiers (e.g., names, student IDs). The system then generates and displays a unique access code for each participant (`US-007`).

### 10. Test Sessions List Page
**Description:** This screen displays a list of all test sessions created by the examiner. It shows key information for each session such as the test template used, creation date, time limit, number of participants, and session status (active, completed, etc.). From this page, examiners can navigate to view detailed reports for any completed test session, or see summary information for active sessions. The page provides a centralized view to manage and access all test sessions.

### 11. Test Session Report Page
**Description:** A detailed report of a completed test session. It displays a list of all participants with their final scores. It also includes aggregate statistics for each question, such as the percentage of correct answers, to help the examiner analyze the test results (`US-011`). This page is accessed by selecting a specific test session from the Test Sessions List Page.

#### 11.1. Participant Detail Modal
**Description:** A modal overlay that displays detailed individual test results for a specific participant. It shows participant metadata (name/ID, access code status), time tracking information (start time, completion time, time taken), final score, and a question-by-question breakdown with answers, correctness indicators, and points earned. The modal is triggered by clicking on a participant's name or score in the Test Session Report Page. For participants who haven't started their test, it shows a simplified view with their identifier, access code status, and a message that they haven't begun yet.

## Participant-Authenticated Screens (via Access Code)

### 12. Test Interface
**Description:** The screen where the participant takes the test after entering a valid code. It will display one question at a time with single-choice answers. Key elements include navigation buttons ("Next"/ "Previous") and a constantly visible timer counting down the remaining time. Progress is saved automatically in the background (`US-009`). The test ends automatically when the time runs out.

### 13. Test Summary Page
**Description:** This screen appears immediately after the test is finished. It shows the participant their total score and provides a complete list of all questions from the test, indicating the answers they gave and highlighting the correct ones (`US-010`).
