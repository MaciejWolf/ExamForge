import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuestionForm } from './QuestionForm';
import type { BankQuestion } from '@/services/api';

type QuestionFormData = {
  text: string;
  answers: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  tags: string[];
};

type EditQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: BankQuestion | null;
  onSubmit: (formData: QuestionFormData) => Promise<void>;
  onCancel: () => void;
};

export const EditQuestionDialog = ({
  open,
  onOpenChange,
  question,
  onSubmit,
  onCancel,
}: EditQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Update the question details below</DialogDescription>
        </DialogHeader>
        {question && (
          <QuestionForm
            question={question}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

