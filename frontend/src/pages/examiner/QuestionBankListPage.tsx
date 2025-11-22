import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { questionBankApi } from '@/services/api';
import type { BankQuestion, Tag } from '@/services/api';
import { toast } from 'sonner';
import { QuestionForm } from '@/components/question-bank/QuestionForm';
import { FilterBar } from '@/components/question-bank/FilterBar';

const QuestionBankListPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<BankQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionBankApi.getAll();
      setQuestions(data);
    } catch (error) {
      toast.error('Failed to load questions', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };


  // Get all unique tags
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    questions.forEach(question => {
      question.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [questions]);

  // Filter questions based on search and tags
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => q.text.toLowerCase().includes(query));
    }

    // Filter by selected tags (AND logic - question must have all selected tags)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(q =>
        selectedTags.every(selectedTag =>
          q.tags.some(tag => tag.id === selectedTag.id)
        )
      );
    }

    return filtered;
  }, [questions, searchQuery, selectedTags]);

  const handleCreate = async (formData: {
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: Tag[];
  }) => {
    try {
      await questionBankApi.create(formData);
      toast.success('Question created successfully');
      setIsCreateOpen(false);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to create question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleEdit = async (formData: {
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: Tag[];
  }) => {
    if (!currentQuestion) return;

    try {
      await questionBankApi.update(currentQuestion.id, formData);
      toast.success('Question updated successfully');
      setIsEditOpen(false);
      setCurrentQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to update question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentQuestion) return;

    try {
      await questionBankApi.delete(currentQuestion.id);
      toast.success('Question deleted successfully');
      setIsDeleteOpen(false);
      setCurrentQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openCreateDialog = () => {
    setCurrentQuestion(null);
    setIsCreateOpen(true);
  };

  const openEditDialog = (question: BankQuestion) => {
    setCurrentQuestion(question);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (question: BankQuestion) => {
    setCurrentQuestion(question);
    setIsDeleteOpen(true);
  };

  const handleTagsAdd = (tagInput: string) => {
    // Parse tags from input: #math #advanced -> ['math', 'advanced']
    const tagNames = tagInput
      .split(/\s+/)
      .map(part => part.trim())
      .filter(part => part.startsWith('#'))
      .map(part => part.slice(1).trim())
      .filter(part => part.length > 0);

    // Match tag names to existing tags (case-insensitive) and add to selected tags
    const newTags: Tag[] = [];
    tagNames.forEach(tagName => {
      const matchedTag = availableTags.find(
        tag => tag.name.toLowerCase() === tagName.toLowerCase()
      );
      if (matchedTag && !selectedTags.some(t => t.id === matchedTag.id)) {
        newTags.push(matchedTag);
      }
    });

    if (newTags.length > 0) {
      setSelectedTags([...selectedTags, ...newTags]);
    }
  };

  const handleTagRemove = (tag: Tag) => {
    setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb and Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold">
            Question Bank {questions.length > 0 && `(${questions.length} questions)`}
          </h1>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTags={selectedTags}
              onTagsAdd={handleTagsAdd}
              onTagRemove={handleTagRemove}
            />
          </CardContent>
        </Card>

        {/* Create New Question Button */}
        <div className="flex justify-end">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Question
          </Button>
        </div>

        {/* Questions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredQuestions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {questions.length === 0
                  ? 'No questions in your bank yet. Create your first question to get started!'
                  : 'No questions match your filters.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <div className="max-w-md">{truncateText(question.text)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {question.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                            >
                              {tag.name}
                            </span>
                          ))}
                          {question.tags.length === 0 && (
                            <span className="text-xs text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{question.answers.length}</TableCell>
                      <TableCell>
                        {question.answers.find(a => a.id === question.correctAnswerId)?.text || 'N/A'}
                      </TableCell>
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

        {/* Create Question Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Question</DialogTitle>
              <DialogDescription>
                Enter the question content, points, tags, and answer options
              </DialogDescription>
            </DialogHeader>
            <QuestionForm
              question={null}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              existingTags={availableTags}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>Update the question details below</DialogDescription>
            </DialogHeader>
            {currentQuestion && (
              <QuestionForm
                question={currentQuestion}
                onSubmit={handleEdit}
                onCancel={() => {
                  setIsEditOpen(false);
                  setCurrentQuestion(null);
                }}
                existingTags={availableTags}
              />
            )}
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
                <strong>Question:</strong> &quot;{currentQuestion?.text}&quot;
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

export default QuestionBankListPage;

