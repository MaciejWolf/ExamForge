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

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
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
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="max-w-md">{truncateText(question.text)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {question.tags.map((tag) => (
                        <TagChip key={tag} tag={tag} />
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

