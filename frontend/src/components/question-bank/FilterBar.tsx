import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/services/api';
import { X } from 'lucide-react';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: Tag[];
  onTagInputChange: (tagInput: string) => void;
  onTagRemove: (tag: Tag) => void;
};

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagInputChange,
  onTagRemove,
}: FilterBarProps) => {
  const [tagInput, setTagInput] = useState('');
  const onTagInputChangeRef = useRef(onTagInputChange);

  useEffect(() => {
    onTagInputChangeRef.current = onTagInputChange;
  }, [onTagInputChange]);

  useEffect(() => {
    onTagInputChangeRef.current(tagInput);
  }, [tagInput]);

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
            placeholder="Type tags like #math #advanced..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />

          {/* Selected Tags as Chips */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => {
                const handleChipRemove = () => {
                  // Remove tag from input string
                  const tagName = tag.name.toLowerCase();
                  const updatedInput = tagInput
                    .split(/\s+/)
                    .filter(part => {
                      const normalized = part.trim().toLowerCase();
                      return !normalized.startsWith('#') || normalized.slice(1) !== tagName;
                    })
                    .join(' ')
                    .trim();
                  
                  setTagInput(updatedInput);
                  onTagRemove(tag);
                };

                return (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm cursor-pointer hover:bg-primary/90"
                    onClick={handleChipRemove}
                  >
                    <span>#{tag.name}</span>
                    <X className="h-3 w-3" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

