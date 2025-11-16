import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthProvider"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Toaster } from "./components/ui/sonner"
import { StartPage } from "./pages/common/StartPage"
import { ExaminerLoginPage } from "./pages/common/ExaminerLoginPage"
import { ExaminerRegistrationPage } from "./pages/common/ExaminerRegistrationPage"
import { PasswordRecoveryPage } from "./pages/common/PasswordRecoveryPage"
import { DashboardPage } from "./pages/common/DashboardPage"
import QuestionPoolsPage from "./pages/QuestionPoolsPage"

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
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  )
}
