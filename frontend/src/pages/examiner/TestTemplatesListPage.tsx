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
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  testTemplatesApi,
  questionPoolsApi,
  type TestTemplate,
  type QuestionPool,
  type PoolSelection,
} from '@/services/api';
import { toast } from 'sonner';

const TestTemplatesListPage = () => {
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [pools, setPools] = useState<QuestionPool[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TestTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [poolSelections, setPoolSelections] = useState<Record<string, { questionsToDraw: number; points: number }>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
    fetchPools();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await testTemplatesApi.getAll();
      setTemplates(response.templates);
    } catch (error) {
      toast.error('Failed to load test templates', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async () => {
    try {
      const response = await questionPoolsApi.getAll();
      // Store all pools (needed for editing templates that might reference pools with 0 questions)
      setPools(response.pools);
    } catch (error) {
      toast.error('Failed to load question pools', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setPoolSelections({});
  };

  const openCreateDialog = () => {
    resetForm();
    setCurrentTemplate(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = async (template: TestTemplate) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    const selections: Record<string, { questionsToDraw: number; points: number }> = {};
    template.poolSelections.forEach((sel) => {
      selections[sel.poolId] = { questionsToDraw: sel.questionsToDraw, points: sel.points };
    });
    setPoolSelections(selections);
    // Refresh pools to ensure we have the latest pool data
    await fetchPools();
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

  const handlePoolToggle = (poolId: string, checked: boolean) => {
    if (checked) {
      setPoolSelections({ ...poolSelections, [poolId]: { questionsToDraw: 1, points: 1 } });
    } else {
      const newSelections = { ...poolSelections };
      delete newSelections[poolId];
      setPoolSelections(newSelections);
    }
  };

  const handleQuestionsToDrawChange = (poolId: string, value: string) => {
    const numValue = parseInt(value, 10);
    const current = poolSelections[poolId] || { questionsToDraw: 0, points: 0 };
    if (!isNaN(numValue) && numValue > 0) {
      setPoolSelections({ ...poolSelections, [poolId]: { ...current, questionsToDraw: numValue } });
    } else if (value === '') {
      setPoolSelections({ ...poolSelections, [poolId]: { ...current, questionsToDraw: 0 } });
    }
  };

  const handlePointsChange = (poolId: string, value: string) => {
    const numValue = parseFloat(value);
    const current = poolSelections[poolId] || { questionsToDraw: 0, points: 0 };
    if (!isNaN(numValue) && numValue > 0) {
      setPoolSelections({ ...poolSelections, [poolId]: { ...current, points: numValue } });
    } else if (value === '') {
      setPoolSelections({ ...poolSelections, [poolId]: { ...current, points: 0 } });
    }
  };

  const calculateTotalQuestions = (): number => {
    return Object.values(poolSelections).reduce((sum, sel) => sum + (sel.questionsToDraw || 0), 0);
  };

  const calculateTotalPoints = (): number => {
    return Object.values(poolSelections).reduce((sum, sel) => sum + (sel.points || 0), 0);
  };

  const validateForm = (): boolean => {
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return false;
    }

    const selectedPools = Object.keys(poolSelections);
    if (selectedPools.length === 0) {
      toast.error('At least one question pool must be selected');
      return false;
    }

    for (const poolId of selectedPools) {
      const selection = poolSelections[poolId];
      const pool = pools.find((p) => p.id === poolId);

      if (!pool) {
        toast.error(`Pool with id ${poolId} not found. It may have been deleted. Please remove it from the template.`);
        return false;
      }

      if (!selection || !selection.questionsToDraw || selection.questionsToDraw <= 0) {
        toast.error(`Questions to draw must be a positive number for pool "${pool.name}"`);
        return false;
      }

      if (!selection.points || selection.points <= 0) {
        toast.error(`Points must be a positive number for pool "${pool.name}"`);
        return false;
      }

      if (pool.questionCount === 0) {
        toast.error(
          `Pool "${pool.name}" has no questions available. Please remove it or add questions to the pool first.`
        );
        return false;
      }

      if (selection.questionsToDraw > pool.questionCount) {
        toast.error(
          `Cannot draw ${selection.questionsToDraw} questions from pool "${pool.name}" (only ${pool.questionCount} available)`
        );
        return false;
      }
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      const selections: PoolSelection[] = Object.entries(poolSelections).map(([poolId, selection]) => ({
        poolId,
        questionsToDraw: selection.questionsToDraw,
        points: selection.points,
      }));

      await testTemplatesApi.create({
        name: templateName.trim(),
        poolSelections: selections,
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
      const selections: PoolSelection[] = Object.entries(poolSelections).map(([poolId, selection]) => ({
        poolId,
        questionsToDraw: selection.questionsToDraw,
        points: selection.points,
      }));

      await testTemplatesApi.update(currentTemplate.id, {
        name: templateName.trim(),
        poolSelections: selections,
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

  const getPoolName = (poolId: string): string => {
    return pools.find((p) => p.id === poolId)?.name || 'Unknown Pool';
  };

  const getTotalQuestions = (template: TestTemplate): number => {
    return template.poolSelections.reduce((sum, sel) => sum + sel.questionsToDraw, 0);
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{template.poolSelections.length}</TableCell>
                      <TableCell>{getTotalQuestions(template)}</TableCell>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTemplate ? 'Edit Test Template' : 'Create New Test Template'}
            </DialogTitle>
            <DialogDescription>
              {currentTemplate
                ? 'Update the template name and question pool selections'
                : 'Enter a template name and select question pools with the number of questions to draw from each'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Template Name */}
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Math Final Exam"
              />
            </div>

            {/* Question Pool Selection */}
            <div className="space-y-4">
              <Label>Question Pool Selection</Label>
              {(() => {
                // When creating, only show pools with questions
                // When editing, show all pools (including those with 0 questions if already selected)
                let poolsToShow = currentTemplate
                  ? pools // When editing, show all pools
                  : pools.filter((pool) => pool.questionCount > 0); // When creating, only pools with questions

                // When editing, check for missing pools (deleted pools still referenced in template)
                if (currentTemplate) {
                  const referencedPoolIds = new Set(currentTemplate.poolSelections.map((sel) => sel.poolId));
                  const missingPools = Array.from(referencedPoolIds).filter(
                    (poolId) => !pools.find((p) => p.id === poolId)
                  );
                  
                  if (missingPools.length > 0) {
                    // Show missing pools so user can remove them
                    return (
                      <div className="space-y-3">
                        <div className="border border-red-300 rounded-md p-4 bg-red-50">
                          <p className="text-sm text-red-700 font-medium mb-2">
                            Warning: Some pools referenced in this template no longer exist. Please remove them:
                          </p>
                            {missingPools.map((poolId) => {
                              const isSelected = poolId in poolSelections;
                              const questionsToDraw = poolSelections[poolId] || 0;
                              return (
                                <div key={poolId} className="border border-red-400 rounded-md p-3 bg-red-100 mb-2">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`pool-missing-${poolId}`}
                                      checked={isSelected}
                                      onChange={(e) => handlePoolToggle(poolId, e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor={`pool-missing-${poolId}`} className="font-medium cursor-pointer text-red-800">
                                      Pool ID: {poolId} (Deleted)
                                    </Label>
                                  </div>
                                  {isSelected && (
                                    <p className="ml-6 text-sm text-red-600 mt-1">
                                      {questionsToDraw} question{questionsToDraw !== 1 ? 's' : ''} to draw, {points} point{points !== 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                        {poolsToShow.length > 0 && (
                          <div className="space-y-3">
                            {poolsToShow.map((pool) => {
                              const isSelected = pool.id in poolSelections;
                              const selection = poolSelections[pool.id] || { questionsToDraw: 0, points: 0 };
                              const questionsToDraw = selection.questionsToDraw || 0;
                              const points = selection.points || 0;
                              const hasQuestions = pool.questionCount > 0;
                              const canSelect = hasQuestions || isSelected;
                              const isValid = !isSelected || (questionsToDraw > 0 && questionsToDraw <= pool.questionCount);

                              return (
                                <div
                                  key={pool.id}
                                  className={`border rounded-md p-4 space-y-2 ${!canSelect ? 'opacity-60' : ''}`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id={`pool-${pool.id}`}
                                      checked={isSelected}
                                      onChange={(e) => handlePoolToggle(pool.id, e.target.checked)}
                                      disabled={!canSelect}
                                      className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                                    />
                                    <Label
                                      htmlFor={`pool-${pool.id}`}
                                      className={`font-medium ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    >
                                      {pool.name}
                                      {!hasQuestions && isSelected && (
                                        <span className="ml-2 text-xs text-red-500">(No questions available)</span>
                                      )}
                                      {!hasQuestions && !isSelected && (
                                        <span className="ml-2 text-xs text-muted-foreground">(No questions available)</span>
                                      )}
                                    </Label>
                                  </div>
                                  {isSelected && (
                                    <div className="ml-6 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Label htmlFor={`questions-${pool.id}`} className="text-sm">
                                          Questions to draw:
                                        </Label>
                                        <Input
                                          id={`questions-${pool.id}`}
                                          type="number"
                                          min="1"
                                          max={pool.questionCount}
                                          value={questionsToDraw || ''}
                                          onChange={(e) => handleQuestionsToDrawChange(pool.id, e.target.value)}
                                          className={`w-24 ${!isValid ? 'border-red-500' : ''}`}
                                          disabled={!hasQuestions}
                                        />
                                        <span className="text-sm text-muted-foreground">
                                          (Available: {pool.questionCount} questions)
                                        </span>
                                      </div>
                                      {!isValid && questionsToDraw > 0 && (
                                        <p className="text-sm text-red-500">
                                          Cannot exceed {pool.questionCount} available questions
                                        </p>
                                      )}
                                      {!hasQuestions && (
                                        <p className="text-sm text-red-500">
                                          This pool has no questions. Please remove it or add questions to the pool first.
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                }

                if (poolsToShow.length === 0) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No question pools with questions available. Create pools and add questions first.
                    </p>
                  );
                }

                return (
                  <div className="space-y-3">
                    {poolsToShow.map((pool) => {
                      const isSelected = pool.id in poolSelections;
                      const selection = poolSelections[pool.id] || { questionsToDraw: 0, points: 0 };
                      const questionsToDraw = selection.questionsToDraw || 0;
                      const points = selection.points || 0;
                      const hasQuestions = pool.questionCount > 0;
                      const canSelect = hasQuestions || isSelected; // Can select if has questions OR already selected
                      const isValid = !isSelected || (questionsToDraw > 0 && questionsToDraw <= pool.questionCount);

                      return (
                        <div
                          key={pool.id}
                          className={`border rounded-md p-4 space-y-2 ${!canSelect ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`pool-${pool.id}`}
                              checked={isSelected}
                              onChange={(e) => handlePoolToggle(pool.id, e.target.checked)}
                              disabled={!canSelect}
                              className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                            />
                            <Label
                              htmlFor={`pool-${pool.id}`}
                              className={`font-medium ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            >
                              {pool.name}
                              {!hasQuestions && isSelected && (
                                <span className="ml-2 text-xs text-red-500">(No questions available)</span>
                              )}
                              {!hasQuestions && !isSelected && (
                                <span className="ml-2 text-xs text-muted-foreground">(No questions available)</span>
                              )}
                            </Label>
                          </div>
                          {isSelected && (
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`questions-${pool.id}`} className="text-sm">
                                  Questions to draw:
                                </Label>
                                <Input
                                  id={`questions-${pool.id}`}
                                  type="number"
                                  min="1"
                                  max={pool.questionCount}
                                  value={questionsToDraw || ''}
                                  onChange={(e) => handleQuestionsToDrawChange(pool.id, e.target.value)}
                                  className={`w-24 ${!isValid ? 'border-red-500' : ''}`}
                                  disabled={!hasQuestions}
                                />
                                <span className="text-sm text-muted-foreground">
                                  (Available: {pool.questionCount} questions)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`points-${pool.id}`} className="text-sm">
                                  Points for this pool:
                                </Label>
                                <Input
                                  id={`points-${pool.id}`}
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={points || ''}
                                  onChange={(e) => handlePointsChange(pool.id, e.target.value)}
                                  className="w-24"
                                  disabled={!hasQuestions}
                                />
                              </div>
                              {!isValid && questionsToDraw > 0 && (
                                <p className="text-sm text-red-500">
                                  Cannot exceed {pool.questionCount} available questions
                                </p>
                              )}
                              {!hasQuestions && (
                                <p className="text-sm text-red-500">
                                  This pool has no questions. Please remove it or add questions to the pool first.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Total Questions and Points Display */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Total Questions:</Label>
                <span className="text-lg font-bold">{calculateTotalQuestions()}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-base font-semibold">Total Points:</Label>
                <span className="text-lg font-bold">{calculateTotalPoints()}</span>
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

              <div className="space-y-4">
                <Label className="text-base font-semibold">Question Pool Selections</Label>
                <div className="space-y-3">
                  {currentTemplate.poolSelections.map((selection) => {
                    const pool = pools.find((p) => p.id === selection.poolId);
                    return (
                      <div key={selection.poolId} className="border rounded-md p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{pool?.name || 'Unknown Pool'}</span>
                          <span className="text-sm text-muted-foreground">
                            {selection.questionsToDraw} question{selection.questionsToDraw !== 1 ? 's' : ''} to draw
                            {pool && ` (${pool.questionCount} available)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Questions:</Label>
                  <span className="text-lg font-bold">{getTotalQuestions(currentTemplate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total Points:</Label>
                  <span className="text-lg font-bold">
                    {currentTemplate.poolSelections.reduce((sum, sel) => sum + sel.points, 0)}
                  </span>
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

