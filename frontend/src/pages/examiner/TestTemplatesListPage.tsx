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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, ArrowLeft, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  testTemplatesApi,
  bankQuestionsApi,
  type TestTemplate,
  type BankQuestion,
} from '@/services/api';
import { toast } from 'sonner';

type PoolFormData = {
  name: string;
  questionCount: number;
  points: number;
  questionIds: string[];
};

const TestTemplatesListPage = () => {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TestTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [pools, setPools] = useState<PoolFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [selectedPoolForQuestions, setSelectedPoolForQuestions] = useState<number | null>(null);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);
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

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setPools([]);
    setSelectedPoolForQuestions(null);
    setQuestionSearchQuery('');
  };

  const openCreateDialog = () => {
    resetForm();
    setCurrentTemplate(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (template: TestTemplate) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setPools(
      template.pools.map((pool) => ({
        name: pool.name,
        questionCount: pool.questionCount,
        points: pool.points,
        questionIds: [...pool.questionIds],
      }))
    );
    setIsEditOpen(true);
  };

  const openViewDialog = (template: TestTemplate) => {
    setCurrentTemplate(template);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (template: TestTemplate) => {
    setCurrentTemplate(template);
    setIsDeleteOpen(true);
  };

  const addPool = () => {
    setPools([
      ...pools,
      {
        name: '',
        questionCount: 0,
        points: 1,
        questionIds: [],
      },
    ]);
  };

  const removePool = (index: number) => {
    setPools(pools.filter((_, i) => i !== index));
  };

  const updatePool = (index: number, updates: Partial<PoolFormData>) => {
    const newPools = [...pools];
    newPools[index] = { ...newPools[index], ...updates };
    // Auto-update questionCount to match questionIds length
    if (updates.questionIds !== undefined) {
      newPools[index].questionCount = updates.questionIds.length;
    }
    setPools(newPools);
  };

  const openQuestionSelector = (poolIndex: number) => {
    setSelectedPoolForQuestions(poolIndex);
    setIsQuestionSelectorOpen(true);
  };

  const addQuestionToPool = (questionId: string) => {
    if (selectedPoolForQuestions === null) return;
    const pool = pools[selectedPoolForQuestions];
    if (pool.questionIds.includes(questionId)) {
      toast.info('Question already added to this pool');
      return;
    }
    updatePool(selectedPoolForQuestions, {
      questionIds: [...pool.questionIds, questionId],
    });
  };

  const removeQuestionFromPool = (poolIndex: number, questionId: string) => {
    const pool = pools[poolIndex];
    updatePool(poolIndex, {
      questionIds: pool.questionIds.filter((id) => id !== questionId),
    });
  };

  const getQuestionById = (id: string): BankQuestion | undefined => {
    return questions.find((q) => q.id === id);
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(questionSearchQuery.toLowerCase())
  );

  const validateForm = (): boolean => {
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return false;
    }

    if (pools.length === 0) {
      toast.error('At least one pool is required');
      return false;
    }

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      if (!pool.name.trim()) {
        toast.error(`Pool ${i + 1} name is required`);
        return false;
      }

      if (pool.questionIds.length === 0) {
        toast.error(`Pool "${pool.name}" must have at least one question`);
        return false;
      }

      if (pool.questionCount !== pool.questionIds.length) {
        toast.error(`Pool "${pool.name}" question count must match the number of selected questions`);
        return false;
      }

      if (pool.points <= 0) {
        toast.error(`Pool "${pool.name}" points must be greater than 0`);
        return false;
      }
    }

    // Check for duplicate pool names
    const poolNames = pools.map((p) => p.name.trim().toLowerCase());
    const uniqueNames = new Set(poolNames);
    if (uniqueNames.size !== poolNames.length) {
      toast.error('Pool names must be unique');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      await testTemplatesApi.create({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        pools: pools.map((pool) => ({
          name: pool.name.trim(),
          questionCount: pool.questionIds.length,
          points: pool.points,
          questionIds: pool.questionIds,
        })),
      });
      toast.success('Template created successfully');
      setIsCreateOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to create template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleEdit = async () => {
    if (!currentTemplate || !validateForm()) return;

    try {
      await testTemplatesApi.update(currentTemplate.id, {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        pools: pools.map((pool) => ({
          name: pool.name.trim(),
          questionCount: pool.questionIds.length,
          points: pool.points,
          questionIds: pool.questionIds,
        })),
      });
      toast.success('Template updated successfully');
      setIsEditOpen(false);
      setCurrentTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to update template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
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
    return template.pools.reduce((sum, pool) => sum + pool.questionCount, 0);
  };

  const getTotalPoints = (template: TestTemplate): number => {
    return template.pools.reduce((sum, pool) => sum + pool.points, 0);
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
            <Button onClick={openCreateDialog}>
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
                            onClick={() => openEditDialog(template)}
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

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          resetForm();
          setCurrentTemplate(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTemplate ? 'Edit Test Template' : 'Create New Test Template'}
            </DialogTitle>
            <DialogDescription>
              {currentTemplate
                ? 'Update the template name, description, and pools'
                : 'Enter template details and create pools with questions from the question bank'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Math Final Exam"
              />
            </div>

            {/* Template Description */}
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description (optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Optional description for this template"
                rows={3}
              />
            </div>

            {/* Pools Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Pools *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPool}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Pool
                </Button>
              </div>

              {pools.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pools yet. Click "Add Pool" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {pools.map((pool, poolIndex) => (
                    <Card key={poolIndex} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Pool {poolIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePool(poolIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`pool-name-${poolIndex}`}>Pool Name *</Label>
                            <Input
                              id={`pool-name-${poolIndex}`}
                              value={pool.name}
                              onChange={(e) => updatePool(poolIndex, { name: e.target.value })}
                              placeholder="e.g., Algebra Basics"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`pool-points-${poolIndex}`}>Points per Question *</Label>
                            <Input
                              id={`pool-points-${poolIndex}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={pool.points}
                              onChange={(e) =>
                                updatePool(poolIndex, { points: parseFloat(e.target.value) || 0 })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>
                              Questions ({pool.questionIds.length} selected)
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openQuestionSelector(poolIndex)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Questions
                            </Button>
                          </div>

                          {pool.questionIds.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">
                              No questions selected. Click "Add Questions" to browse the question bank.
                            </p>
                          ) : (
                            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                              {pool.questionIds.map((questionId) => {
                                const question = getQuestionById(questionId);
                                return (
                                  <div
                                    key={questionId}
                                    className="flex items-center justify-between p-2 bg-muted rounded"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {question?.text || `Question ${questionId}`}
                                      </p>
                                      {question?.tags && question.tags.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                          Tags: {question.tags.join(', ')}
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeQuestionFromPool(poolIndex, questionId)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {pools.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Questions:</Label>
                  <span className="text-lg font-bold">
                    {pools.reduce((sum, pool) => sum + pool.questionIds.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Points:</Label>
                  <span className="text-lg font-bold">
                    {pools.reduce((sum, pool) => sum + pool.points * pool.questionIds.length, 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setIsEditOpen(false);
                resetForm();
                setCurrentTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={currentTemplate ? handleEdit : handleCreate}>
              {currentTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Selector Dialog */}
      <Dialog open={isQuestionSelectorOpen} onOpenChange={setIsQuestionSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Questions</DialogTitle>
            <DialogDescription>
              {selectedPoolForQuestions !== null &&
                `Add questions to pool: ${pools[selectedPoolForQuestions]?.name || 'Unnamed Pool'}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={questionSearchQuery}
                onChange={(e) => setQuestionSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {questionSearchQuery ? 'No questions match your search' : 'No questions available'}
                </p>
              ) : (
                filteredQuestions.map((question) => {
                  const poolIndex = selectedPoolForQuestions;
                  const isSelected =
                    poolIndex !== null && pools[poolIndex]?.questionIds.includes(question.id);
                  return (
                    <div
                      key={question.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        if (poolIndex !== null) {
                          if (isSelected) {
                            removeQuestionFromPool(poolIndex, question.id);
                          } else {
                            addQuestionToPool(question.id);
                          }
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{question.text}</p>
                          {question.tags && question.tags.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tags: {question.tags.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsQuestionSelectorOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                            {pool.questionCount} question{pool.questionCount !== 1 ? 's' : ''} •{' '}
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
