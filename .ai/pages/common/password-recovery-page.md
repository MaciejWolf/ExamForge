# Password Recovery Page
*A two-step process for examiners to reset a forgotten password.*

## Navigation
- **Step 1 (Request Reset):**
    - On submitting a valid email: The user is shown a confirmation message, and an email is sent. The user is instructed to check their email for a reset link.
    - Clicking "Back to Login": navigates to the **Examiner Login Page**.
- **Step 2 (Reset Password):** (Accessed via a unique link from the email)
    - On successful password reset: redirects to the **Examiner Login Page** with a success message.
    - If the link is invalid or expired: an error message is shown with a link back to the **Password Recovery Page (Step 1)**.

## Layout
The process involves two distinct screens, each with a centered, single-column form to guide the user through the password recovery flow.

### Screen 1: Request Password Reset
This is the first screen the user interacts with to initiate the password reset process.

#### Wireframe
```
+------------------------------------------+
|               ExamForge                  |
|                                          |
|            Reset Password                |
|                                          |
|  Enter your email to receive a reset link|
|                                          |
|  +------------------------------------+  |
|  | Email Address                      |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |         Send Reset Link            |  |
|  +------------------------------------+  |
|                                          |
|              Back to Login             |
|                                          |
+------------------------------------------+
```

#### Component Descriptions
- **Header:** Displays the application name, "ExamForge," and the page title, "Reset Password."
- **Email Address Input:** A standard text field for the user to enter their registered email address.
- **Send Reset Link Button:** Submits the request to send a password reset link to the provided email.
- **Back to Login Link:** Navigates the user back to the **Examiner Login Page**.

### Screen 2: Set New Password
This screen is accessed via the unique, time-sensitive link sent to the user's email.

#### Wireframe
```
+------------------------------------------+
|               ExamForge                  |
|                                          |
|            Set New Password              |
|                                          |
|  +------------------------------------+  |
|  | New Password                       |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | Confirm New Password               |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  |          Reset Password            |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

#### Component Descriptions
- **Header:** Displays the application name, "ExamForge," and the page title, "Set New Password."
- **New Password Input:** A standard password field for entering the new password.
- **Confirm New Password Input:** A standard password field to confirm the new password.
- **Reset Password Button:** Submits the form to set the new password.

## Other Information
- The reset link sent via email is unique and time-sensitive for security.
- The system first validates that the entered email exists in the database before sending the reset link.
- The new password must meet the application's security requirements.
- The "Confirm New Password" field must match the "New Password" field.
- Error messages are displayed for invalid data or for expired/invalid reset links.
- This functionality corresponds to user story `US-003`.
