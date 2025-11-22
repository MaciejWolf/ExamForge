import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { questionBankApi } from '@/services/api';
import type { BankQuestion } from '@/services/api';
import { toast } from 'sonner';
import { QuestionBankHeader } from '@/components/question-bank/QuestionBankHeader';
import { QuestionBankFilters } from '@/components/question-bank/QuestionBankFilters';
import { QuestionsList } from '@/components/question-bank/QuestionsList';
import { QuestionDialog } from '@/components/question-bank/QuestionDialog';
import { DeleteQuestionDialog } from '@/components/question-bank/DeleteQuestionDialog';

const QuestionBankListPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<BankQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const filterQuestions = (allQuestions: BankQuestion[], searchQuery: string, selectedTags: string[]) => {
    const queryFilter = searchQuery.trim() === ''
      ? () => true
      : (q: BankQuestion) => q.text.toLowerCase().includes(searchQuery.toLowerCase());

    const tagFilter = selectedTags.length === 0
      ? () => true
      : (q: BankQuestion) => selectedTags.every(tag => q.tags.includes(tag));

    return allQuestions.filter(queryFilter).filter(tagFilter);
  }

  const handleCreate = async (formData: {
    text: string;
    answers: Array<{ id: string; text: string }>;
    correctAnswerId: string;
    tags: string[];
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
    tags: string[];
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

  const openEditDialog = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setCurrentQuestion(question);
      setIsEditOpen(true);
    }
  };

  const openDeleteDialog = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      setCurrentQuestion(question);
      setIsDeleteOpen(true);
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <QuestionBankHeader
          totalQuestions={questions.length}
          onBackClick={() => navigate('/dashboard')}
        />

        <QuestionBankFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
        />

        <div className="flex justify-end">
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Question
          </Button>
        </div>

        <QuestionsList
          questions={filterQuestions(questions, searchQuery, selectedTags)}
          totalQuestions={questions.length}
          loading={loading}
          onEditClick={openEditDialog}
          onDeleteClick={openDeleteDialog}
        />

        <QuestionDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          title="Create New Question"
          description="Enter the question content, points, tags, and answer options"
          question={null}
          onSubmit={handleCreate}
        />

        <QuestionDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          title="Edit Question"
          description="Update the question details below"
          question={currentQuestion}
          onSubmit={handleEdit}
          onCancel={() => {
            setIsEditOpen(false);
            setCurrentQuestion(null);
          }}
        />

        <DeleteQuestionDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          question={currentQuestion}
          onConfirm={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default QuestionBankListPage;

