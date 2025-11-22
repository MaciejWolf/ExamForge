import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/services/api';
import { X } from 'lucide-react';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: Tag[];
  onTagsAdd: (tagInput: string) => void;
  onTagRemove: (tag: Tag) => void;
};

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsAdd,
  onTagRemove,
}: FilterBarProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        onTagsAdd(tagInput);
        setTagInput('');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search questions by content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Tag Filter */}
      <div className="space-y-2">
        <Label htmlFor="tag-filter">Filter by Tags</Label>
        <div className="space-y-2">
          {/* Tag Input */}
          <Input
            id="tag-filter"
            type="text"
            placeholder="Type tags like #math #advanced and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Selected Tags as Chips */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm cursor-pointer hover:bg-primary/90"
                  onClick={() => onTagRemove(tag)}
                >
                  <span>#{tag.name}</span>
                  <X className="h-3 w-3" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

