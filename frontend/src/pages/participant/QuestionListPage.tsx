import { useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ParticipantTestInstance } from '@/services/assessment';

export const QuestionListPage = () => {
  const location = useLocation();
  const testInstance = location.state?.testInstance as ParticipantTestInstance;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showUnansweredDialog, setShowUnansweredDialog] = useState(false);
  const [highlightUnanswered, setHighlightUnanswered] = useState(false);

  if (!testInstance) {
    return <Navigate to="/" replace />;
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleFinishTest = () => {
    const totalQuestions = testInstance.testContent.sections.reduce(
      (sum, section) => sum + section.questions.length, 
      0
    );
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      setHighlightUnanswered(true);
      setShowUnansweredDialog(true);
      return;
    }

    submitTest();
  };

  const submitTest = () => {
    // TODO: Implement test submission logic
    console.log('Test finished', { answers });
    setShowUnansweredDialog(false);
  };

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
            
            {section.questions.map((question, index) => {
              const isUnanswered = !answers[question.id];
              const showHighlight = highlightUnanswered && isUnanswered;

              return (
              <Card key={question.id} className={showHighlight ? "border-destructive border-2" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-start gap-2">
                    <span className="bg-secondary text-secondary-foreground text-sm font-bold px-2 py-1 rounded">
                      Q{index + 1}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-base mb-4">{question.text}</p>
                  <div className="space-y-3">
                    {question.answers?.map((answer) => (
                      <div key={answer.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`${question.id}-${answer.id}`}
                          name={`question-${question.id}`}
                          value={answer.id}
                          checked={answers[question.id] === answer.id}
                          onChange={() => handleAnswerSelect(question.id, answer.id)}
                          className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                        />
                        <Label 
                          htmlFor={`${question.id}-${answer.id}`} 
                          className="font-normal cursor-pointer text-base"
                        >
                          {answer.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {showHighlight && (
                    <div className="text-destructive text-sm font-medium mt-4">
                      This question is required
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        ))}

        <div className="flex justify-end pt-4 pb-8">
          <Button 
            size="lg" 
            onClick={handleFinishTest}
            className="w-full md:w-auto text-lg px-8"
          >
            Finish Test
          </Button>
        </div>
      </div>

      <Dialog open={showUnansweredDialog} onOpenChange={setShowUnansweredDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incomplete Test</DialogTitle>
            <DialogDescription>
              You have not answered all questions. Are you sure you want to finish the test?
              Unanswered questions will be marked as incorrect.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowUnansweredDialog(false)}>
              Continue Testing
            </Button>
            <Button onClick={submitTest}>
              Yes, Finish Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
