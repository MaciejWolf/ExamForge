import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { BankQuestion } from '@/services/api';
import { TagChip } from '@/components/ui/TagChip';

type QuestionsListProps = {
  questions: BankQuestion[];
  totalQuestions: number;
  loading: boolean;
  onEditClick: (questionId: string) => void;
  onDeleteClick: (questionId: string) => void;
};

export const QuestionsList = ({
  questions,
  totalQuestions,
  loading,
  onEditClick,
  onDeleteClick,
}: QuestionsListProps) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {totalQuestions === 0
              ? 'No questions in your bank yet. Create your first question to get started!'
              : 'No questions match your filters.'}
          </p>
        ) : (
          <Table style={{ tableLayout: 'fixed' }}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Question</TableHead>
                <TableHead className="w-[25%]">Tags</TableHead>
                <TableHead className="w-[10%]">Answers</TableHead>
                <TableHead className="w-[25%]">Correct Answer</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="w-[30%] whitespace-normal">
                    <div className="break-words">{question.text}</div>
                  </TableCell>
                  <TableCell className="w-[25%] whitespace-normal">
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag) => (
                        <TagChip key={tag} tag={tag} />
                      ))}
                      {question.tags.length === 0 && (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[10%]">{question.answers.length}</TableCell>
                  <TableCell className="w-[25%] whitespace-normal">
                    <div className="break-words">
                      {question.answers.find(a => a.id === question.correctAnswerId)?.text || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="w-[10%] text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClick(question.id)}
                        title="Edit question"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(question.id)}
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
  );
};

