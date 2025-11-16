import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Toaster } from "./components/ui/sonner"
import { StartPage } from "./pages/StartPage"
import { ExaminerLoginPage } from "./pages/auth/ExaminerLoginPage"
import { ExaminerRegistrationPage } from "./pages/auth/ExaminerRegistrationPage"
import { PasswordRecoveryPage } from "./pages/auth/PasswordRecoveryPage"
import { DashboardPage } from "./pages/examiner/DashboardPage"
import QuestionPoolsPage from "./pages/examiner/QuestionPoolsPage"
import QuestionPoolManagementPage from "./pages/examiner/QuestionPoolManagementPage"
import TestTemplatesListPage from "./pages/examiner/TestTemplatesListPage"
import TestSessionLaunchPage from "./pages/examiner/TestSessionLaunchPage"
import TestSessionListPage from "./pages/examiner/TestSessionListPage"
import TestSessionReportPage from "./pages/examiner/TestSessionReportPage"

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/login" element={<ExaminerLoginPage />} />
          <Route path="/register" element={<ExaminerRegistrationPage />} />
          <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-pools"
            element={
              <ProtectedRoute>
                <QuestionPoolsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/question-pools/:id"
            element={
              <ProtectedRoute>
                <QuestionPoolManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-templates"
            element={
              <ProtectedRoute>
                <TestTemplatesListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/launch-test"
            element={
              <ProtectedRoute>
                <TestSessionLaunchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-sessions"
            element={
              <ProtectedRoute>
                <TestSessionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-sessions/:sessionId/report"
            element={
              <ProtectedRoute>
                <TestSessionReportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
