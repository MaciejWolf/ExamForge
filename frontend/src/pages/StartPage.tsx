import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const StartPage = () => {
  const [accessCode, setAccessCode] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // No API call - button does nothing
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
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Start Test
            </Button>
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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

