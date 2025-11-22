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

type QuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  question?: BankQuestion | null;
  onSubmit: (formData: QuestionFormData) => Promise<void>;
  onCancel?: () => void;
};

export const QuestionDialog = ({
  open,
  onOpenChange,
  title,
  description,
  question = null,
  onSubmit,
  onCancel,
}: QuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <QuestionForm
          question={question}
          onSubmit={onSubmit}
          onCancel={onCancel || (() => onOpenChange(false))}
        />
      </DialogContent>
    </Dialog>
  );
};

