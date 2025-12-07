import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  testTemplatesApi,
  bankQuestionsApi,
  type TestTemplate,
  type BankQuestion,
} from '@/services/api';
import { toast } from 'sonner';

const TestTemplatesListPage = () => {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TestTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
    fetchQuestions();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await testTemplatesApi.getAll();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load test templates', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const data = await bankQuestionsApi.getAll();
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load questions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openViewDialog = (template: TestTemplate) => {
    setCurrentTemplate(template);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (template: TestTemplate) => {
    setCurrentTemplate(template);
    setIsDeleteOpen(true);
  };

  const getQuestionById = (id: string): BankQuestion | undefined => {
    return questions.find((q) => q.id === id);
  };

  const handleDelete = async () => {
    if (!currentTemplate) return;

    try {
      await testTemplatesApi.delete(currentTemplate.id);
      toast.success('Template deleted successfully');
      setIsDeleteOpen(false);
      setCurrentTemplate(null);
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to delete template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getTotalQuestions = (template: TestTemplate): number => {
    return template.pools.reduce((sum, pool) => sum + pool.questionsToDraw, 0);
  };

  const getTotalPoints = (template: TestTemplate): number => {
    return template.pools.reduce((sum, pool) => sum + pool.points * pool.questionsToDraw, 0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Test Templates List</CardTitle>
            <Button onClick={() => navigate('/test-templates/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Template
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No test templates yet. Create your first template to get started!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Pools</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.pools.length}</TableCell>
                      <TableCell>{getTotalQuestions(template)}</TableCell>
                      <TableCell>{getTotalPoints(template)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(template)}
                            title="View template"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/test-templates/${template.id}/edit`)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(template)}
                            title="Delete template"
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
      </div>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Test Template</DialogTitle>
            <DialogDescription>Template configuration details</DialogDescription>
          </DialogHeader>
          {currentTemplate && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Template Name</Label>
                <p className="text-sm">{currentTemplate.name}</p>
              </div>

              {currentTemplate.description && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Description</Label>
                  <p className="text-sm">{currentTemplate.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-base font-semibold">Pools</Label>
                <div className="space-y-3">
                  {currentTemplate.pools.map((pool, index) => (
                    <Card key={pool.id || index} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{pool.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {pool.questionsToDraw} question{pool.questionsToDraw !== 1 ? 's' : ''} •{' '}
                            {pool.points} point{pool.points !== 1 ? 's' : ''} each
                          </span>
                        </div>
                        {pool.questionIds.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Questions:</p>
                            <div className="space-y-1">
                              {pool.questionIds.map((questionId) => {
                                const question = getQuestionById(questionId);
                                return (
                                  <div key={questionId} className="text-xs pl-2 border-l-2">
                                    {question?.text || `Question ${questionId}`}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Questions:</Label>
                  <span className="text-lg font-bold">{getTotalQuestions(currentTemplate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Points:</Label>
                  <span className="text-lg font-bold">{getTotalPoints(currentTemplate)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
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
              Are you sure you want to delete the template &quot;{currentTemplate?.name}&quot;?
              <br />
              <br />
              This action cannot be undone. This template will no longer be available for launching new tests.
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
    </DashboardLayout>
  );
};

export default TestTemplatesListPage;
