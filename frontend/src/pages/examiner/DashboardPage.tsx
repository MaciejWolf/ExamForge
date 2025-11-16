import { useNavigate } from "react-router-dom"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/DashboardLayout"
import { FileQuestion, FileText, PlayCircle, BarChart3 } from "lucide-react"

export const DashboardPage = () => {
  const navigate = useNavigate()

  const cards = [
    {
      title: "Question Pools",
      description: "Manage your question pools",
      icon: FileQuestion,
      onClick: () => navigate("/question-pools"),
      iconColor: "text-primary"
    },
    {
      title: "Test Templates",
      description: "Create and edit templates",
      icon: FileText,
      onClick: () => navigate("/test-templates"),
      iconColor: "text-accent"
    },
    {
      title: "Launch Test",
      description: "Start a new test session",
      icon: PlayCircle,
      onClick: () => navigate("/launch-test"),
      iconColor: "text-primary"
    },
    {
      title: "Test Reports",
      description: "View completed test results",
      icon: BarChart3,
      onClick: () => navigate("/test-reports"),
      iconColor: "text-accent"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to ExamForge</h1>
          <p className="text-muted-foreground">Choose an option to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon
            return (
              <Card
                key={card.title}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary"
                onClick={card.onClick}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                    <Icon className={`h-12 w-12 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

