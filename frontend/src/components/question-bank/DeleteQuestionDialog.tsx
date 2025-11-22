import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { BankQuestion } from '@/services/api';

type DeleteQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: BankQuestion | null;
  onConfirm: () => Promise<void>;
};

export const DeleteQuestionDialog = ({
  open,
  onOpenChange,
  question,
  onConfirm,
}: DeleteQuestionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question?
            <br />
            <br />
            <strong>Question:</strong> &quot;{question?.text}&quot;
            <br />
            <br />
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

