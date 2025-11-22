import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus, X } from 'lucide-react';
import type { BankQuestion } from '@/services/api';
import { toast } from 'sonner';

type QuestionFormData = {
  text: string;
  answers: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  tags: string[];
};

type QuestionFormProps = {
  question?: BankQuestion | null;
  onSubmit: (data: QuestionFormData) => void | Promise<void>;
  onCancel: () => void;
};

export const QuestionForm = ({ question, onSubmit, onCancel }: QuestionFormProps) => {
  const [text, setText] = useState('');
  const [answers, setAnswers] = useState<Array<{ id: string; text: string }>>([
    { id: 'temp-1', text: '' },
    { id: 'temp-2', text: '' },
  ]);
  const [correctAnswerId, setCorrectAnswerId] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (question) {
      setText(question.text);
      setAnswers(question.answers);
      setCorrectAnswerId(question.correctAnswerId);
      setTags(question.tags);
    } else {
      resetForm();
    }
  }, [question]);

  const resetForm = () => {
    const initialAnswers = [
      { id: `temp-${Date.now()}-1`, text: '' },
      { id: `temp-${Date.now()}-2`, text: '' },
    ];
    setText('');
    setAnswers(initialAnswers);
    setCorrectAnswerId(initialAnswers[0].id);
    setTags([]);
    setTagInput('');
  };

  const handleAddAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { id: `temp-${Date.now()}-${answers.length + 1}`, text: '' }]);
    }
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      // If we removed the correct answer, set first answer as correct
      if (correctAnswerId === answers[index].id && newAnswers.length > 0) {
        setCorrectAnswerId(newAnswers[0].id);
      }
      setAnswers(newAnswers);
    }
  };

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers(answers.map(a => a.id === id ? { ...a, text } : a));
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    setTagSuggestions([]);
  };

  const handleAddTag = (tag: string) => {
    const tagNameLower = tag.toLowerCase();
    if (!tags.some(t => t.toLowerCase() === tagNameLower)) {
      setTags([...tags, tag.trim()]);
      setTagInput('');
      setTagSuggestions([]);
    }
  };

  const handleCreateTag = () => {
    const tagName = tagInput.trim();
    if (tagName) {
      const tagNameLower = tagName.toLowerCase();
      if (!tags.some(t => t.toLowerCase() === tagNameLower)) {
        setTags([...tags, tagName]);
        setTagInput('');
        setTagSuggestions([]);
      }
    }
  };

  const handleRemoveTag = (tagName: string) => {
    setTags(tags.filter(t => t !== tagName));
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      toast.error('Question content is required');
      return;
    }
    if (answers.length < 2 || answers.length > 6) {
      toast.error('Question must have between 2 and 6 answers');
      return;
    }
    if (!correctAnswerId) {
      toast.error('Please select a correct answer');
      return;
    }
    if (answers.some(a => !a.text.trim())) {
      toast.error('All answers must have non-empty text');
      return;
    }
    if (!answers.some(a => a.id === correctAnswerId)) {
      toast.error('Selected correct answer is invalid');
      return;
    }

    onSubmit({
      text: text.trim(),
      answers,
      correctAnswerId,
      tags: tags.map(tag => tag.trim()),
    });
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="questionText">Question Content</Label>
        <textarea
          id="questionText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your question here..."
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => handleTagInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (tagSuggestions.length > 0) {
                    handleAddTag(tagSuggestions[0]);
                  } else if (tagInput.trim()) {
                    handleCreateTag();
                  }
                }
              }}
              placeholder="Type to search or create tags..."
            />
          </div>
          {tagSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-background">
              {tagSuggestions.map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/20 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Answer Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Answer Options (2-6)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAnswer}
            disabled={answers.length >= 6}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Answer
          </Button>
        </div>

        <div className="space-y-3">
          {answers.map((answer, index) => (
            <div key={answer.id} className="flex items-start gap-3 p-3 border rounded-md">
              <div className="flex items-center pt-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={answer.id === correctAnswerId}
                  onChange={() => setCorrectAnswerId(answer.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`answer-${answer.id}`} className="text-sm">
                    Answer {index + 1}
                    {answer.id === correctAnswerId && (
                      <span className="ml-2 text-xs text-primary font-medium">(Correct)</span>
                    )}
                  </Label>
                </div>
                <Input
                  id={`answer-${answer.id}`}
                  value={answer.text}
                  onChange={(e) => handleAnswerChange(answer.id, e.target.value)}
                  placeholder={`Enter answer option ${index + 1}`}
                />
              </div>
              {answers.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAnswer(index)}
                  className="mt-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {question ? 'Update Question' : 'Save Question'}
        </Button>
      </div>
    </div>
  );
};

