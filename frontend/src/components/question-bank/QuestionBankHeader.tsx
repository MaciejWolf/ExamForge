import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type QuestionBankHeaderProps = {
  totalQuestions: number;
  onBackClick: () => void;
};

export const QuestionBankHeader = ({ totalQuestions, onBackClick }: QuestionBankHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBackClick}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          Question Bank {totalQuestions > 0 && `(${totalQuestions} questions)`}
        </h1>
      </div>
    </>
  );
};

