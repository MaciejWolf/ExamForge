# Examiner Registration Page
*A form for new examiners to create an account.*

## Navigation
- On successful registration: redirects to the **Examiner Login Page**.
- Clicking "Already have an account? Log in": navigates to the **Examiner Login Page**.

## Layout
This page features a single-column form, centered vertically and horizontally, for a clean and focused user experience.

### Wireframe
```
+------------------------------------------+
|               ExamForge                  |
|                                          |
|            Create an Account             |
|                                          |
|  +------------------------------------+  |
|  | Email Address                      |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Password                           |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Confirm Password                   |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |             Register               |  |
|  +------------------------------------+  |
|                                          |
|   Already have an account? Log in      |
|                                          |
+------------------------------------------+
```

### Component Descriptions
- **Header:** Displays the application name, "ExamForge," and the page title, "Create an Account."
- **Email Address Input:** A standard text field where the user enters their email address.
- **Password Input:** A standard password field for entering a secure password.
- **Confirm Password Input:** A standard password field to ensure the entered password is correct.
- **Register Button:** Submits the registration form to create the new account.
- **Link to Login Page:** A text link that navigates the user to the **Examiner Login Page**.

## Other Information
- The system validates that the email is in a correct format and is not already in use.
- The password must meet the system's security requirements (e.g., minimum length, complexity).
- The "Confirm Password" field must exactly match the "Password" field.
- Appropriate error messages are displayed for invalid data, such as "Email already in use" or "Passwords do not match."
- This functionality directly corresponds to user story `US-001`.
