# Test Session Launch Page

This page allows an examiner to initiate a new test session by selecting an existing test template, setting a time limit, and providing a list of participant identifiers, after which the system generates unique access codes for each participant.

## Navigation

- **Action:** An examiner clicks the "Back to Dashboard" button or the "ExamForge" logo in the header.
- **Destination:** The Dashboard / Main Panel.
- **Action:** An examiner clicks the "Logout" button in the header.
- **Destination:** The Examiner Login Page.
- **Action:** An examiner successfully launches a test session and clicks "View Reports" or "Back to Dashboard".
- **Destination:** The Test Session Report Page (for the newly created session) or the Dashboard / Main Panel.
- **Action:** An examiner clicks "Copy All Codes" or individual "Copy" buttons after codes are generated.
- **Destination:** The user remains on the same page; access codes are copied to clipboard.

## Layout

The page features a persistent header with the application title and user controls. The main content area consists of a page title, a form section for launching a test (template selection, time limit, and participant list), and a results section that appears after successful launch displaying participant identifiers with their generated access codes.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|  < Back to Dashboard                             |
|                                                  |
|  Launch Test Session                             |
|                                                  |
|  +--------------------------------------------+  |
|  | Test Template:                              |  |
|  | [Select Template ▼]                        |  |
|  |                                            |  |
|  | Time Limit (minutes):                      |  |
|  | [________________]                        |  |
|  |                                            |  |
|  | Participant Identifiers:                  |  |
|  | (One per line: names, student IDs, etc.)  |  |
|  | +--------------------------------------+  |  |
|  | | John Doe                              |  |  |
|  | | Jane Smith                            |  |  |
|  | | STU-2024-001                         |  |  |
|  | |                                       |  |  |
|  | |                                       |  |  |
|  | +--------------------------------------+  |  |
|  |                                            |  |
|  |              [Launch Test Session]         |  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

#### Success State - Access Codes Display

```
+--------------------------------------------------+
|                                                  |
|  Test Session Launched Successfully!            |
|                                                  |
|  +--------------------------------------------+  |
|  | Participant          | Access Code          |  |
|  +--------------------------------------------+  |
|  | John Doe             | ABC123XYZ  [Copy]   |  |
|  +--------------------------------------------+  |
|  | Jane Smith           | DEF456UVW  [Copy]   |  |
|  +--------------------------------------------+  |
|  | STU-2024-001         | GHI789RST  [Copy]   |  |
|  +--------------------------------------------+  |
|                                                  |
|  [Copy All Codes]  [View Report]  [Launch Another]|
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions

- **Application Header:** A persistent header bar displaying "ExamForge" on the left and user information on the right, consistent across all examiner pages.
- **User Information Display:** Shows the currently logged-in examiner's email address in the top-right corner.
- **Logout Button:** A button in the header that signs the examiner out and returns them to the login page.
- **Back to Dashboard Link:** A navigation link that returns the examiner to the main dashboard.
- **Page Title:** A heading that clearly identifies this page as "Launch Test Session."
- **Test Template Dropdown/Select:** A dropdown menu or select component that displays all available test templates created by the examiner. Only templates that belong to the examiner and are valid (have at least one question pool with sufficient questions) should be available for selection. This is a required field.
- **Time Limit Input Field:** A numeric input field where the examiner specifies the duration of the test in minutes. This field accepts only positive integers and is required. The field should include validation to ensure a reasonable minimum (e.g., at least 1 minute) and maximum value (e.g., 480 minutes / 8 hours).
- **Participant Identifiers Textarea:** A multi-line text input area where the examiner can paste or type a list of participant identifiers. Each identifier should be on a separate line. Identifiers can be names, student IDs, email addresses, or any other unique identifier. The textarea should be clearly labeled with instructions (e.g., "One identifier per line: names, student IDs, etc."). This is a required field. The system should validate that at least one participant identifier is provided.
- **Launch Test Session Button:** A prominent button that triggers the test session creation process. When clicked, it validates all inputs, sends a request to the backend to create the test session and generate access codes, and displays the results. The button should be disabled during the API call and show a loading state.
- **Access Codes Results Section:** A section that appears after successful test session launch, displaying a table or list of all participants with their corresponding unique access codes. This section includes:
  - **Participant Identifier Column:** Displays the identifier provided by the examiner (name, student ID, etc.).
  - **Access Code Column:** Displays the unique, one-time-use access code generated for each participant. Codes should be displayed in a format that is easy to read and copy (e.g., uppercase, with clear spacing or formatting).
  - **Individual Copy Button:** A button next to each access code that copies that specific code to the clipboard. Should provide visual feedback (e.g., toast notification) when copied.
- **Copy All Codes Button:** A button that copies all access codes in a formatted list (e.g., "Participant: CODE" format) to the clipboard for easy distribution.
- **View Report Button:** A button that navigates to the Test Session Report Page for the newly created test session (though the report will be empty until participants complete the test).
- **Launch Another Button:** A button that resets the form and allows the examiner to launch another test session without navigating away from the page.
- **Error Message Area:** An area that displays validation errors or API error messages. Should be clearly visible and styled to indicate errors (e.g., red text, error icon).
- **Loading Indicator:** A spinner or loading message that appears while the test session is being created and access codes are being generated.

## Other Information

- **Authentication:** This page is accessible only to authenticated examiners.
- **User Story Reference:** This page primarily implements `US-007` (Launching Test from Template).
- **Functional Requirement Reference:** Implements `FR-05` (Launching Test and Managing Participants).
- **Template Selection:** Only test templates that belong to the examiner and have valid configurations (at least one question pool with sufficient questions) should be available for selection. If no templates exist, the page should display a message directing the examiner to create a template first, with a link to the Test Templates List Page.
- **Time Limit Validation:** The system should validate that:
  - The time limit is a positive integer.
  - The time limit is within reasonable bounds (e.g., minimum 1 minute, maximum 480 minutes / 8 hours).
  - Appropriate error messages are displayed for invalid inputs.
- **Participant Identifiers Processing:** The system should:
  - Parse the textarea input to extract individual identifiers (one per line).
  - Trim whitespace from each identifier.
  - Remove empty lines.
  - Validate that at least one valid identifier is provided.
  - Handle special characters appropriately (e.g., names with accents, IDs with hyphens).
- **Access Code Generation:** The system must generate unique, secure access codes for each participant. Codes should:
  - Be unique across all test sessions (or at minimum, unique within the current session).
  - Be sufficiently random and secure to prevent guessing.
  - Be easy to read and type (consider avoiding ambiguous characters like 0/O, 1/I/l).
  - Be one-time-use only (once a participant uses a code to start a test, it cannot be reused).
- **Test Session Creation:** When the test session is launched:
  - The system creates a new test session record associated with the selected template.
  - Questions are randomly drawn from the template's configured question pools according to the template rules.
  - Each participant is assigned a unique access code.
  - The test session is marked as "active" and ready for participants to begin.
  - The time limit is set and will be enforced when participants start their tests.
- **Access Code Display:** After successful launch, the access codes should be displayed in a clear, copyable format. Consider:
  - Using a table layout for easy scanning.
  - Making codes visually distinct (e.g., monospace font, larger size).
  - Providing both individual copy buttons and a "copy all" functionality.
  - Including instructions on how to distribute the codes to participants.
- **Empty State:** If the examiner has no test templates, display a helpful message with a link to create their first template.
- **Form Reset:** After successfully launching a test session, the examiner should be able to launch another session without leaving the page. The form should reset, but the previous results should remain visible (or be collapsible) for reference.
- **Error Handling:** The page should handle various error scenarios:
  - Network errors when creating the test session.
  - Validation errors (missing template, invalid time limit, empty participant list).
  - Template-related errors (template deleted, insufficient questions in pools).
  - Display clear, actionable error messages for each scenario.
- **Loading States:** Show appropriate loading indicators during:
  - Template list fetching.
  - Test session creation and access code generation.
  - Any API calls.
- **Success Feedback:** After successful test session launch, display a clear success message and highlight the access codes section. Consider showing a summary (e.g., "Test session created successfully! 15 participants added, 15 access codes generated.").
- **Accessibility:** Ensure all form fields are properly labeled, error messages are associated with their fields, and all interactive elements are keyboard accessible.
- **Responsive Design:** The form and results table should adapt to smaller screens, potentially stacking vertically on mobile devices.
- **Participant List Format:** Consider providing examples or a sample format in the textarea placeholder or help text to guide examiners on how to format the participant list.
- **Bulk Operations:** For examiners launching tests with many participants, ensure the UI remains responsive and provides progress feedback during code generation.
- **Session Management:** The newly created test session should be immediately available in the Test Session Report Page, even though it will show no results until participants complete their tests.
- **Template Information Display:** Consider showing additional information about the selected template (e.g., number of questions, which pools are included) to help the examiner confirm they're using the correct template.
- **Time Limit Recommendations:** Consider displaying recommended time limits based on the number of questions in the selected template (e.g., "Recommended: 60 minutes for 25 questions").
- **Access Code Security:** Access codes should be stored securely and associated with the specific test session. Once a code is used, it should be marked as consumed and cannot be reused.
- **Export Functionality:** Consider adding an option to export the participant list with access codes (e.g., as CSV) for easy distribution, though this may be out of scope for MVP.

