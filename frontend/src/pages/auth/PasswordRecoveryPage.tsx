import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const PasswordRecoveryPage = () => {
  const [step, setStep] = useState<"request" | "reset">("request")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No API call - simulate moving to next step
    setStep("reset")
  }

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No API call - button does nothing
  }

  if (step === "request") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">ExamForge</CardTitle>
            <CardDescription className="text-lg">Reset Password</CardDescription>
            <p className="text-sm text-muted-foreground pt-2">
              Enter your email to receive a reset link
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">ExamForge</CardTitle>
          <CardDescription className="text-lg">Set New Password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

