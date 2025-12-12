import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import type { ParticipantTestInstance } from '@/services/assessment';

export const TestCompletionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testInstance = location.state?.testInstance as ParticipantTestInstance;

  if (!testInstance) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Test Submitted!</CardTitle>
          <CardDescription className="text-base">
            Your test has been successfully submitted.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Participant</p>
            <p className="text-lg font-semibold">{testInstance.identifier}</p>
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">Access Code</p>
            <p className="text-lg font-mono tracking-wider">{testInstance.accessCode}</p>
          </div>
          {testInstance.completedAt && (
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Submitted At</p>
              <p className="text-lg">
                {new Date(testInstance.completedAt).toLocaleString()}
              </p>
            </div>
          )}
          <Button 
            onClick={() => navigate('/')} 
            className="w-full" 
            size="lg"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
