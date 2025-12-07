import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, X, Search, Plus } from 'lucide-react';
import {
  testTemplatesApi,
  bankQuestionsApi,
  type BankQuestion,
} from '@/services/api';
import { toast } from 'sonner';

type PoolFormData = {
  name: string;
  questionsToDraw: number;
  points: number;
  questionIds: string[];
};

const TestTemplateFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [pools, setPools] = useState<PoolFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [selectedPoolForQuestions, setSelectedPoolForQuestions] = useState<number | null>(null);
  const [isQuestionSelectorOpen, setIsQuestionSelectorOpen] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const data = await bankQuestionsApi.getAll();
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load questions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, []);

  const fetchTemplate = useCallback(async (templateId: string) => {
    try {
      setLoading(true);
      const template = await testTemplatesApi.getById(templateId);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setPools(
        template.pools.map((pool) => ({
          name: pool.name,
          questionsToDraw: pool.questionsToDraw,
          points: pool.points,
          questionIds: [...pool.questionIds],
        }))
      );
    } catch (error) {
      toast.error('Failed to load template', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      navigate('/test-templates');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchQuestions();
    if (isEditMode && id) {
      fetchTemplate(id);
    }
  }, [id, isEditMode, fetchTemplate, fetchQuestions]);

  const addPool = () => {
    setPools([
      ...pools,
      {
        name: '',
        questionsToDraw: 0,
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

      if (pool.questionsToDraw <= 0) {
        toast.error(`Pool "${pool.name}" questions to draw must be greater than 0`);
        return false;
      }

      if (pool.questionsToDraw > pool.questionIds.length) {
        toast.error(
          `Pool "${pool.name}" questions to draw (${pool.questionsToDraw}) cannot be greater than the number of questions in pool (${pool.questionIds.length})`
        );
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode && id) {
        await testTemplatesApi.update(id, {
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          pools: pools.map((pool) => ({
            name: pool.name.trim(),
            questionsToDraw: pool.questionsToDraw,
            points: pool.points,
            questionIds: pool.questionIds,
          })),
        });
        toast.success('Template updated successfully');
      } else {
        await testTemplatesApi.create({
          name: templateName.trim(),
          description: templateDescription.trim() || undefined,
          pools: pools.map((pool) => ({
            name: pool.name.trim(),
            questionsToDraw: pool.questionsToDraw,
            points: pool.points,
            questionIds: pool.questionIds,
          })),
        });
        toast.success('Template created successfully');
      }
      navigate('/test-templates');
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} template`, {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleCancel = () => {
    navigate('/test-templates');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Edit Test Template' : 'Create New Test Template'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isEditMode
                ? 'Update the template name, description, and pools'
                : 'Enter template details and create pools with questions from the question bank'}
            </p>
          </CardHeader>
          <CardContent>
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

                          <div className="grid grid-cols-3 gap-4">
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
                              <Label htmlFor={`pool-questionsToDraw-${poolIndex}`}>
                                Questions to Draw *
                              </Label>
                              <Input
                                id={`pool-questionsToDraw-${poolIndex}`}
                                type="number"
                                min="1"
                                step="1"
                                value={pool.questionsToDraw}
                                onChange={(e) =>
                                  updatePool(poolIndex, {
                                    questionsToDraw: parseInt(e.target.value) || 0,
                                  })
                                }
                                placeholder="e.g., 5"
                              />
                              {pool.questionIds.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Max: {pool.questionIds.length} questions in pool
                                </p>
                              )}
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
                    <Label className="text-base font-semibold">Total Questions to Draw:</Label>
                    <span className="text-lg font-bold">
                      {pools.reduce((sum, pool) => sum + pool.questionsToDraw, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Total Points:</Label>
                    <span className="text-lg font-bold">
                      {pools.reduce((sum, pool) => sum + pool.points * pool.questionsToDraw, 0)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {isEditMode ? 'Update Template' : 'Create Template'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </DashboardLayout>
  );
};

export default TestTemplateFormPage;
