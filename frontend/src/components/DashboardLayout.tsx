import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

type Props = {
  children: React.ReactNode
}

export const DashboardLayout = ({ children }: Props) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-primary">ExamForge</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              User: <span className="font-medium text-foreground">{user?.email}</span>
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container px-4 py-8">
        {children}
      </main>
    </div>
  )
}

