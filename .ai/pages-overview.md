# ExamForge Application Screens Overview (Updated)

Based on the updated Product Requirements Document (PRD) with local question pools, below is a comprehensive list of screens that the ExamForge application should have, organized by user type and functionality.

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
**Description:** The central hub for an examiner after logging in. This screen will provide primary navigation to the main sections of the application: **Question Bank**, Test Templates, and Test Sessions.

> [!IMPORTANT]
> **Changed:** Navigation now points to "Question Bank" instead of "Question Pools" since pools are now local to templates.

---

### 6. Question Bank List Page
**Description:** This screen displays a list of all questions in the examiner's global question bank. Questions exist independently without being assigned to any pool. The page allows examiners to:
- View all questions with their content preview, number of answers, points, and **tags**
- Create new questions
- Edit existing questions
- Delete questions (blocked if the question is used in any template)
- Search and filter questions by text content
- **Filter questions by tags** (single or multiple tags)
- View tag statistics (how many questions have each tag)

> [!NOTE]
> Questions in the bank are not organized into pools at this level. Pool assignment happens within individual test templates.

> [!TIP]
> **Tags** provide a flexible way to organize and filter questions. Examples: `#algebra`, `#easy`, `#matura2024`, `#5min`

**Related User Story:** `US-004`

---

### 7. Question Management Page/Modal
**Description:** A form for creating or editing a question in the global question bank. It includes:
- Question content (text field)
- 2 to 6 answer options (dynamic list)
- Selection of the correct answer (radio buttons)
- Points value (number input)
- **Tags input field** with autocomplete/suggestions
  - Shows existing tags as user types
  - Allows adding multiple tags
  - Visual tag chips/badges for added tags
  - Easy removal of tags
- Validation to ensure at least 2 answers and exactly one correct answer

When editing a question, the system shows a warning if the question is used in any templates, as changes will be reflected in all templates using this question.

> [!TIP]
> **Tag Autocomplete:** As you type, the system suggests existing tags to maintain consistency (e.g., typing "alg" suggests "#algebra", "#algorithm")

**Related User Story:** `US-004`

---

### 8. Test Templates List Page
**Description:** This screen displays a list of all saved test templates. It enables the examiner to create, view, edit, or delete templates (`US-006`). Each template card shows:
- Template name
- Number of local pools defined
- Total questions assigned across all pools
- Creation/modification date

Actions available:
- Create new template
- Edit existing template (opens Template Editor)
- Delete template
- Launch test from template

**Related User Story:** `US-006`

---

### 9. Test Template Editor Page
**Description:** A comprehensive screen for creating or editing a test template. This is where examiners manage **local pools** specific to this template.

**See:** [Test Template Editor Page](.ai/pages/examiner/test-template-editor-page.md) for complete specifications.

**Key Features:**
- **Template Basic Info Section:** Template name and description
- **Local Pools Management Section:** Create, edit, and delete pools within the template; set draw counts
- **Question Assignment Section:** Assign questions from the global bank to local pools with tag-based filtering

> [!IMPORTANT]
> **Key Constraint:** Within this template, each question can belong to at most one pool. The UI should prevent or warn against duplicate assignments.

> [!NOTE]
> The same question from the bank can be used in multiple templates, potentially in different pools in each template.

**Validation:**
- Template must have at least one pool
- For each pool, the number of questions to draw cannot exceed the number of questions assigned to that pool

**Related User Stories:** `US-005`, `US-006`

---

### 10. Test Session Launch Page
**Description:** A screen where an examiner initiates a new test. They select an existing test template, set a time limit in minutes, and paste a list of participant identifiers (e.g., names, student IDs). The system then generates and displays a unique access code for each participant (`US-007`).

---

### 11. Test Sessions List Page
**Description:** This screen displays a list of all test sessions created by the examiner. It shows key information for each session such as the test template used, creation date, time limit, number of participants, and session status (active, completed, etc.). From this page, examiners can navigate to view detailed reports for any completed test session, or see summary information for active sessions. The page provides a centralized view to manage and access all test sessions.

---

### 12. Test Session Report Page
**Description:** A detailed report of a completed test session. It displays a list of all participants with their final scores. It also includes aggregate statistics for each question, such as the percentage of correct answers, to help the examiner analyze the test results (`US-011`). This page is accessed by selecting a specific test session from the Test Sessions List Page.

#### 12.1. Participant Detail Modal
**Description:** A modal overlay that displays detailed individual test results for a specific participant. It shows participant metadata (name/ID, access code status), time tracking information (start time, completion time, time taken), final score, and a question-by-question breakdown with answers, correctness indicators, and points earned. The modal is triggered by clicking on a participant's name or score in the Test Session Report Page. For participants who haven't started their test, it shows a simplified view with their identifier, access code status, and a message that they haven't begun yet.

---

## Participant-Authenticated Screens (via Access Code)

### 13. Test Interface
**Description:** The screen where the participant takes the test after entering a valid code. It will display one question at a time with single-choice answers. Key elements include navigation buttons ("Next"/ "Previous") and a constantly visible timer counting down the remaining time. Progress is saved automatically in the background (`US-009`). The test ends automatically when the time runs out.

### 14. Test Summary Page
**Description:** This screen appears immediately after the test is finished. It shows the participant their total score and provides a complete list of all questions from the test, indicating the answers they gave and highlighting the correct ones (`US-010`).

---

## Summary of Changes from Previous Version

### Removed Screens
- ❌ **Question Pools List Page** - Pools are no longer global entities
- ❌ **Question Pool Management Page** - Pool management is now within template context

### Added Screens
- ✅ **Question Bank List Page** - Global repository of questions
- ✅ **Question Management Page/Modal** - Create/edit questions in the bank

### Modified Screens
- 🔄 **Dashboard** - Navigation updated from "Question Pools" to "Question Bank"
- 🔄 **Test Template Editor** - Now includes local pool management and question assignment from the global bank

### Key Conceptual Changes
1. **Question Bank**: Questions now live in a global bank, independent of any pools
2. **Local Pools**: Pools are created within each template, not globally
3. **Question Assignment**: Questions are assigned from the bank to pools within specific templates
4. **Reusability**: Same question can be used across multiple templates in different pools
5. **Single Pool Constraint**: Within one template, a question can only belong to one pool
6. **Tags**: Questions can have multiple tags for flexible organization and filtering
