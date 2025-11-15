# ExamForge

A web application for creating, managing, and conducting tests with dynamic question selection, designed to streamline the examination process for educators.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

ExamForge is designed to solve the common challenges faced by educators, teachers, and trainers who spend significant time creating, distributing, and grading tests. The manual process of preparing multiple exam variants to ensure fairness is inefficient, and grading is often prone to errors and delays.

This application provides a robust platform for:
-   **Creating Question Pools:** Group questions by topic for better organization.
-   **Defining Test Templates:** Dynamically generate unique tests by specifying how many questions to draw from each pool.
-   **Conducting Test Sessions:** Securely administer tests to participants using unique, one-time access codes.
-   **Automated Grading & Reporting:** Provide immediate feedback to participants and insightful analytics to examiners.

The goal is to offer a simple, intuitive, and reliable tool that enhances the testing experience for both examiners and participants.

## Tech Stack

This project leverages a modern, scalable, and efficient tech stack chosen for rapid MVP development and future growth.

| Category  | Technology                                                                                                                              |
| :-------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) |
| **Backend**   | ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)                                                                                             |
| **Database & Auth** | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) |

-   **Supabase:** Accelerates development by providing a ready-to-use PostgreSQL database, authentication system, and auto-generated APIs.
-   **React & shadcn/ui:** Enables the rapid creation of a beautiful, modern, and responsive user interface.
-   **Express.js:** Complements Supabase by handling custom business logic, such as generating unique test codes and complex reporting.
-   **TypeScript:** Ensures type safety across the stack, reducing bugs and improving code maintainability.

## Getting Started Locally

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [pnpm](https://pnpm.io/installation) (or npm/yarn)
-   [Git](https://git-scm.com/)
-   A [Supabase](https://supabase.com/) account for database and authentication services.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/examforge.git
    cd examforge
    ```

2.  **Set up Supabase:**
    -   Create a new project on the Supabase dashboard.
    -   Go to `Settings` > `API` and find your Project URL and `anon` public key. You will need these for the next steps.

3.  **Configure Backend:**
    ```sh
    cd backend
    pnpm install

    # Create an environment file from the example
    cp .env.example .env
    ```
    -   Open the `.env` file and add your Supabase credentials:
        ```env
        SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        PORT=5000
        ```

4.  **Configure Frontend:**
    ```sh
    cd ../frontend
    pnpm install

    # Create a local environment file from the example
    cp .env.local.example .env.local
    ```
    -   Open the `.env.local` file and add the required environment variables:
        ```env
        VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        VITE_API_BASE_URL=http://localhost:5000
        ```

5.  **Run the application:**
    -   Start the backend server (from the `/backend` directory):
        ```sh
        pnpm run dev
        ```
    -   In a new terminal, start the frontend development server (from the `/frontend` directory):
        ```sh
        pnpm run dev
        ```

The application should now be running at `http://localhost:5173`.

## Available Scripts

The project is split into a `frontend` and `backend` directory. Each has its own set of scripts.

### Backend (`/backend`)

-   `pnpm run dev`: Starts the development server with hot-reloading.
-   `pnpm run build`: Compiles the TypeScript code to JavaScript.
-   `pnpm start`: Starts the compiled application in production mode.
-   `pnpm test`: Runs the test suite.

### Frontend (`/frontend`)

-   `pnpm run dev`: Starts the Vite development server.
-   `pnpm run build`: Builds the application for production.
-   `pnpm run preview`: Serves the production build locally for previewing.
-   `pnpm test`: Runs the component and unit tests.

## Project Scope

### In Scope (MVP)

-   ✅ **Examiner Accounts:** Registration, login, and password recovery.
-   ✅ **Question Pool Management:** Create and manage thematic groups of questions.
-   ✅ **Single-Choice Questions:** Support for questions with 2-6 text-based answers.
-   ✅ **Test Template Creation:** Define rules for randomly selecting questions from pools.
-   ✅ **Test Session Management:** Launch tests, set time limits, and generate unique access codes for participants.
-   ✅ **Participant Interface:** A clean interface for taking the test, with one question at a time and a visible timer.
-   ✅ **Automatic Grading:** Instant, automated scoring upon test completion.
-   ✅ **Result Summaries:** Basic reports for both participants and examiners.

### Out of Scope (Post-MVP)

-   ❌ Adaptive testing modes.
-   ❌ Test preview for examiners before launching.
-   ❌ Ability for participants to finish a test before the time runs out.
-   ❌ Import/export functionality for questions or results.
-   ❌ Support for other question types (e.g., open-ended, multiple-choice).
-   ❌ Integrations with external e-learning platforms.
-   ❌ Certificate generation.

## Project Status

The project is currently **in development**. The focus is on delivering the core features outlined in the MVP scope.

### MVP Feature Checklist

-   [ ] **US-001:** Examiner Account Registration
-   [ ] **US-002:** Examiner Login
-   [ ] **US-003:** Password Recovery
-   [ ] **US-004:** Create Question Pool
-   [ ] **US-005:** Add Question to Pool
-   [ ] **US-006:** Create Test Template
-   [ ] **US-007:** Launch Test from Template
-   [ ] **US-008:** Start Test as Participant
-   [ ] **US-009:** Solve Test as Participant
-   [ ] **US-010:** View Participant Summary
-   [ ] **US-011:** View Examiner Report

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
