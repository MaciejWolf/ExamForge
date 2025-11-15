# Examiner Login Page
*A form for registered examiners to sign in to their accounts.*

## Navigation
- On successful login: redirects to the **Dashboard / Main Panel**.
- Clicking "Forgot your password?": navigates to the **Password Recovery Page**.
- Clicking "Don't have an account? Sign up": navigates to the **Examiner Registration Page**.

## Layout
This page features a single-column form, centered vertically and horizontally, for a simple and direct login process.

### Wireframe
```
+------------------------------------------+
|               ExamForge                  |
|                                          |
|               Log In                     |
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
|  |              Log In                |  |
|  +------------------------------------+  |
|                                          |
|        Forgot your password?           |
|                                          |
|   Don't have an account? Sign up       |
|                                          |
+------------------------------------------+
```

### Component Descriptions
- **Header:** Displays the application name, "ExamForge," and the page title, "Log In."
- **Email Address Input:** A standard text field for the user to enter their email.
- **Password Input:** A standard password field for the user to enter their password.
- **Login Button:** Submits the login form to authenticate the user.
- **Link to Password Recovery:** A text link that navigates the user to the **Password Recovery Page**.
- **Link to Registration Page:** A text link that navigates the user to the **Examiner Registration Page**.

## Other Information
- The system validates the user's credentials against the stored examiner accounts.
- An error message is displayed for an incorrect email or password combination.
- This functionality corresponds to user story `US-002`.
