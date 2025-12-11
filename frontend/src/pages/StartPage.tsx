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
        toast.error(error.message)
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

