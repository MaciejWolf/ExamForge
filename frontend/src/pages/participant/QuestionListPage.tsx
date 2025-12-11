import { useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParticipantTestInstance } from '@/services/assessment';

export const QuestionListPage = () => {
  const location = useLocation();
  const testInstance = location.state?.testInstance as ParticipantTestInstance;

  if (!testInstance) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-4xl">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">ExamForge Test</h1>
          <p className="text-muted-foreground">Participant: {testInstance.identifier}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Code: {testInstance.accessCode}
        </div>
      </header>

      <div className="space-y-8">
        {testInstance.testContent.sections.map((section) => (
          <div key={section.poolId} className="space-y-4">
            <h2 className="text-xl font-semibold border-l-4 border-primary pl-4">
              {section.poolName} 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({section.points} points per question)
              </span>
            </h2>
            
            {section.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="bg-secondary text-secondary-foreground text-sm font-bold px-2 py-1 rounded">
                      Q{index + 1}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-base">{question.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
