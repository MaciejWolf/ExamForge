import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ArrowLeft, Minus } from 'lucide-react';
import { questionsApi, questionPoolsApi, type Question, type Answer } from '@/services/api';
import { toast } from 'sonner';

const QuestionPoolManagementPage = () => {
  const { id: poolId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [poolName, setPoolName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Form state
  const [questionContent, setQuestionContent] = useState('');
  const [questionPoints, setQuestionPoints] = useState<number>(1);
  const [answers, setAnswers] = useState<Omit<Answer, 'id'>[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: true },
  ]);

  useEffect(() => {
    if (poolId) {
      fetchPoolAndQuestions();
    }
  }, [poolId]);

  const fetchPoolAndQuestions = async () => {
    if (!poolId) return;

    try {
      setLoading(true);
      // Fetch pool name
      const poolsResponse = await questionPoolsApi.getAll();
      const pool = poolsResponse.pools.find((p) => p.id === poolId);
      if (pool) {
        setPoolName(pool.name);
      }

      // Fetch questions
      const questionsResponse = await questionsApi.getByPool(poolId);
      setQuestions(questionsResponse.questions);
    } catch (error) {
      toast.error('Failed to load questions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuestionContent('');
    setQuestionPoints(1);
    setAnswers([
      { text: '', isCorrect: false },
      { text: '', isCorrect: true },
    ]);
  };

  const openCreateDialog = () => {
    resetForm();
    setCurrentQuestion(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (question: Question) => {
    setCurrentQuestion(question);
    setQuestionContent(question.content);
    setQuestionPoints(question.points);
    setAnswers(question.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })));
    setIsEditOpen(true);
  };

  const openDeleteDialog = (question: Question) => {
    setCurrentQuestion(question);
    setIsDeleteOpen(true);
  };

  const handleAddAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      // Ensure at least one answer is marked as correct
      if (!newAnswers.some((a) => a.isCorrect) && newAnswers.length > 0) {
        newAnswers[0].isCorrect = true;
      }
      setAnswers(newAnswers);
    }
  };

  const handleAnswerChange = (index: number, text: string) => {
    const newAnswers = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = answers.map((a, i) => ({
      ...a,
      isCorrect: i === index,
    }));
    setAnswers(newAnswers);
  };

  const validateForm = (): boolean => {
    if (!questionContent.trim()) {
      toast.error('Question content is required');
      return false;
    }

    if (questionPoints <= 0) {
      toast.error('Points must be a positive number');
      return false;
    }

    if (answers.length < 2 || answers.length > 6) {
      toast.error('Question must have between 2 and 6 answers');
      return false;
    }

    const correctCount = answers.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      toast.error('Question must have exactly one correct answer');
      return false;
    }

    for (const answer of answers) {
      if (!answer.text.trim()) {
        toast.error('All answers must have non-empty text');
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!poolId || !validateForm()) return;

    try {
      await questionsApi.create(poolId, {
        content: questionContent.trim(),
        points: questionPoints,
        answers,
      });
      toast.success('Question created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchPoolAndQuestions();
    } catch (error) {
      toast.error('Failed to create question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleEdit = async () => {
    if (!poolId || !currentQuestion || !validateForm()) return;

    try {
      await questionsApi.update(poolId, currentQuestion.id, {
        content: questionContent.trim(),
        points: questionPoints,
        answers,
      });
      toast.success('Question updated successfully');
      setIsEditOpen(false);
      setCurrentQuestion(null);
      resetForm();
      fetchPoolAndQuestions();
    } catch (error) {
      toast.error('Failed to update question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!poolId || !currentQuestion) return;

    try {
      await questionsApi.delete(poolId, currentQuestion.id);
      toast.success('Question deleted successfully');
      setIsDeleteOpen(false);
      setCurrentQuestion(null);
      fetchPoolAndQuestions();
    } catch (error) {
      toast.error('Failed to delete question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCorrectAnswerText = (question: Question): string => {
    const correctAnswer = question.answers.find((a) => a.isCorrect);
    if (!correctAnswer) return 'N/A';
    return correctAnswer.text;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Back Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/question-pools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Question Pools
            </Button>
            <div className="text-sm text-muted-foreground">
              Question Pools &gt; {poolName}
            </div>
          </div>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">{poolName} - Questions</h1>
        </div>

        {/* Add New Question Button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions</CardTitle>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Question
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : questions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No questions in this pool yet. Add your first question to get started!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {truncateText(question.content)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {question.answers.length} options
                          <br />
                          <span className="text-xs">Correct Answer: {truncateText(getCorrectAnswerText(question), 50)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(question)}
                            title="Edit question"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(question)}
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Question Dialog */}
        <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            resetForm();
            setCurrentQuestion(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
              <DialogDescription>
                {currentQuestion
                  ? 'Update the question details below'
                  : 'Enter the question content, points, and answer options'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Question Content */}
              <div className="space-y-2">
                <Label htmlFor="questionContent">Question Content</Label>
                <textarea
                  id="questionContent"
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  placeholder="Enter your question here..."
                  rows={4}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label htmlFor="questionPoints">Points</Label>
                <Input
                  id="questionPoints"
                  type="number"
                  min="1"
                  value={questionPoints}
                  onChange={(e) => setQuestionPoints(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Answer Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Answer Options (2-6)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAnswer}
                      disabled={answers.length >= 6}
                    >
                      <Plus className="h-4 w-4" />
                      Add Answer
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {answers.map((answer, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="flex items-center pt-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={answer.isCorrect}
                          onChange={() => handleCorrectAnswerChange(index)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`answer-${index}`} className="text-sm">
                            Answer {index + 1}
                            {answer.isCorrect && (
                              <span className="ml-2 text-xs text-primary font-medium">(Correct)</span>
                            )}
                          </Label>
                        </div>
                        <Input
                          id={`answer-${index}`}
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          placeholder={`Enter answer option ${index + 1}`}
                        />
                      </div>
                      {answers.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAnswer(index)}
                          className="mt-2"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  resetForm();
                  setCurrentQuestion(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={currentQuestion ? handleEdit : handleCreate}>
                {currentQuestion ? 'Update Question' : 'Save Question'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question?
                <br />
                <br />
                <strong>Question:</strong> &quot;{currentQuestion?.content}&quot;
                <br />
                <br />
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default QuestionPoolManagementPage;

