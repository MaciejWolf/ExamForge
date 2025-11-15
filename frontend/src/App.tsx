import { BrowserRouter, Routes, Route } from "react-router-dom"
import { StartPage } from "./pages/common/StartPage"
import { ExaminerLoginPage } from "./pages/common/ExaminerLoginPage"
import { ExaminerRegistrationPage } from "./pages/common/ExaminerRegistrationPage"
import { PasswordRecoveryPage } from "./pages/common/PasswordRecoveryPage"

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<ExaminerLoginPage />} />
        <Route path="/register" element={<ExaminerRegistrationPage />} />
        <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
