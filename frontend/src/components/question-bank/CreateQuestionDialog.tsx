import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuestionForm } from './QuestionForm';

type QuestionFormData = {
  text: string;
  answers: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  tags: string[];
};

type CreateQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: QuestionFormData) => Promise<void>;
};

export const CreateQuestionDialog = ({
  open,
  onOpenChange,
  onSubmit,
}: CreateQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>
            Enter the question content, points, tags, and answer options
          </DialogDescription>
        </DialogHeader>
        <QuestionForm
          question={null}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

