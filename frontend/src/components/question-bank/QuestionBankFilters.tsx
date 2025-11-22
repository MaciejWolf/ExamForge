import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from './FilterBar';

type QuestionBankFiltersProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
};

export const QuestionBankFilters = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
}: QuestionBankFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
        />
      </CardContent>
    </Card>
  );
};

