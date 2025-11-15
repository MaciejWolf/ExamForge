# Start Page

This is the application's landing page for test-takers to enter their unique access code and begin a test session.

## Navigation

-   **Action:** A participant enters a valid access code and clicks the "Start Test" button.
-   **Destination:** The Test Interface page.
-   **Action:** A participant enters an invalid or used access code.
-   **Destination:** The user remains on the Start Page, and an error message is displayed.

## Layout

The page uses a simple, single-column layout with centered content. It contains the application title, an instructional text, an input field for the access code, and a button to start the test.

### Wireframe

```
+--------------------------------------------------+
|                                                  |
|                    ExamForge                     |
|                                                  |
|      Enter your access code to begin the test    |
|                                                  |
|   +------------------------------------------+   |
|   | Access Code                              |   |
|   +------------------------------------------+   |
|                                                  |
|              +-----------------+               |
|              |   Start Test    |               |
|              +-----------------+               |
|                                                  |
|         [Error message appears here]           |
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions

-   **Application Title:** Displays the name of the application, "ExamForge".
-   **Instructional Text:** A brief text guiding the user, e.g., "Enter your access code to begin the test."
-   **Access Code Input Field:** A text field where the participant types their unique access code.
-   **"Start Test" Button:** A button that validates the entered code and initiates the test session.
-   **Error Message Area:** An area below the button to display feedback messages for invalid or used codes. It is hidden by default.

## Other Information

-   Based on user story `US-008`.
-   The access code validation should occur on the backend.
-   The page should provide clear feedback for invalid or previously used access codes.
-   The access code input field should be the primary focus when the page loads.
