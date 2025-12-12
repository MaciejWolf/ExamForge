import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { assessmentService } from "@/services/assessment"
import { toast } from "sonner"
import { ApiError } from "@/services/core"

export const StartPage = () => {
  const [accessCode, setAccessCode] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date)
    } catch {
      return dateString
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!accessCode.trim()) {
      toast.error("Please enter an access code")
      return
    }

    setLoading(true)
    try {
      const testInstance = await assessmentService.startTestInstance(accessCode.trim())
      toast.success("Test started successfully")
      navigate("/test", { state: { testInstance } })
    } catch (error) {
      if (error instanceof ApiError) {
        const errorType = error.errorData?.type
        let errorMessage = error.message

        switch (errorType) {
          case 'InvalidAccessCode':
            errorMessage = "Invalid access code. Please check and try again."
            break
          case 'SessionClosed':
            errorMessage = "The test session is closed."
            break
          case 'TestAlreadyStarted':
            errorMessage = "You have already started this test."
            break
          case 'TestNotOpenYet': {
            const startTime = error.errorData?.startTime
            if (startTime && typeof startTime === 'string') {
              errorMessage = `The test is not open yet. It starts at ${formatDateTime(startTime)}.`
            } else {
              errorMessage = "The test is not open yet."
            }
            break
          }
          case 'TestExpired': {
            const endTime = error.errorData?.endTime
            if (endTime && typeof endTime === 'string') {
              errorMessage = `The test ended at ${formatDateTime(endTime)}.`
            } else {
              errorMessage = "The test has expired."
            }
            break
          }
          case 'TestAlreadyFinished':
            errorMessage = "You have already submitted this test."
            break
          case 'ValidationError':
            errorMessage = error.errorData?.message || "Invalid request. Please check your input."
            break
          default:
            // Use the error message from the API, or fallback to generic message
            errorMessage = error.message || "Failed to start test. Please try again."
        }

        toast.error(errorMessage)
      } else {
        toast.error("Failed to start test. Please check your access code.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">ExamForge</CardTitle>
          <CardDescription className="text-base">
            Enter your access code to begin the test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Access Code"
                className="text-center text-lg tracking-wider uppercase"
                autoFocus
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Starting..." : "Start Test"}
            </Button>
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                disabled={loading}
              >
                Are you an examiner? Log in here
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

