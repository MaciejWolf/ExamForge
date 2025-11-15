# Dashboard / Main Panel

This is the central hub for an examiner after logging in, providing primary navigation to the main sections of the application.

## Navigation

-   **Action:** An examiner clicks the "Question Pools" navigation card/button.
-   **Destination:** The Question Pools Management Page.
-   **Action:** An examiner clicks the "Test Templates" navigation card/button.
-   **Destination:** The Test Templates Management Page.
-   **Action:** An examiner clicks the "Launch Test" navigation card/button.
-   **Destination:** The Test Session Launch Page.
-   **Action:** An examiner clicks the "Test Reports" navigation card/button.
-   **Destination:** The Test Session Report Page (showing a list of all test sessions).
-   **Action:** An examiner clicks the "Logout" button in the header.
-   **Destination:** The Examiner Login Page.

## Layout

The page uses a centered layout with a header section and a main grid-based content area. The header contains the application title and user information with a logout option. The main content area displays navigation cards for the primary functions arranged in a grid.

### Wireframe

```
+--------------------------------------------------+
|  ExamForge                          User: [Email] |
|                                        [Logout]   |
+--------------------------------------------------+
|                                                  |
|              Welcome to ExamForge                |
|                                                  |
|  +-------------------+   +-------------------+   |
|  |                   |   |                   |   |
|  |  Question Pools   |   |  Test Templates   |   |
|  |                   |   |                   |   |
|  |   [Icon/Image]    |   |   [Icon/Image]    |   |
|  |                   |   |                   |   |
|  |   Manage your     |   |   Create and      |   |
|  |   question pools  |   |   edit templates  |   |
|  |                   |   |                   |   |
|  +-------------------+   +-------------------+   |
|                                                  |
|  +-------------------+   +-------------------+   |
|  |                   |   |                   |   |
|  |   Launch Test     |   |   Test Reports    |   |
|  |                   |   |                   |   |
|  |   [Icon/Image]    |   |   [Icon/Image]    |   |
|  |                   |   |                   |   |
|  |   Start a new     |   |   View completed  |   |
|  |   test session    |   |   test results    |   |
|  |                   |   |                   |   |
|  +-------------------+   +-------------------+   |
|                                                  |
+--------------------------------------------------+
```

### Component Descriptions

-   **Application Header:** A persistent header bar at the top of the page displaying the application name "ExamForge" on the left side.
-   **User Information Display:** Shows the currently logged-in examiner's email address in the top-right corner of the header.
-   **Logout Button:** A button in the header that allows the examiner to sign out of their account and return to the login page.
-   **Welcome Message:** A centered heading welcoming the user to the application.
-   **Question Pools Card:** A clickable card/button that navigates to the Question Pools Management Page. Includes an icon, title, and descriptive text explaining its purpose.
-   **Test Templates Card:** A clickable card/button that navigates to the Test Templates Management Page. Includes an icon, title, and descriptive text explaining its purpose.
-   **Launch Test Card:** A clickable card/button that navigates to the Test Session Launch Page. Includes an icon, title, and descriptive text explaining its purpose.
-   **Test Reports Card:** A clickable card/button that navigates to the Test Session Report Page. Includes an icon, title, and descriptive text explaining its purpose.

## Other Information

-   This page is accessible only to authenticated examiners.
-   The page is reached after successful login (`US-002`) or registration (`US-001`).
-   The navigation cards should be visually prominent and clearly indicate their purpose.
-   The layout should be responsive and adapt to different screen sizes.
-   Each navigation card should have hover states to indicate interactivity.
-   This is the main entry point for all examiner-specific functionality mentioned in the PRD:
    -   Question Pools Management (`US-004`, `US-005`)
    -   Test Templates Management (`US-006`)
    -   Launching Test Sessions (`US-007`)
    -   Viewing Test Reports (`US-011`)
-   The header with logout functionality should persist across all examiner-authenticated pages for consistent navigation.

