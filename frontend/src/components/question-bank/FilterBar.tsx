import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
};

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
}: FilterBarProps) => {
  const [tagInput, setTagInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        // Parse tags from input: #math #advanced -> ['math', 'advanced']
        const tagNames = tagInput
          .split(/\s+/)
          .map(part => part.trim())
          .filter(part => part.startsWith('#'))
          .map(part => part.slice(1).trim())
          .filter(part => part.length > 0);

        // Add tags for filtering
        const newTags: string[] = [];
        tagNames.forEach(tagName => {
          const normalizedTagName = tagName.trim().toLowerCase();
          // Check if already selected
          if (!selectedTags.some(t => t.trim().toLowerCase() === normalizedTagName)) {
            newTags.push(tagName.trim());
          }
        });

        if (newTags.length > 0) {
          onTagsChange([...selectedTags, ...newTags]);
        }
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t.toLowerCase() !== tag.toLowerCase()));
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
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm cursor-pointer hover:bg-primary/90"
                  onClick={() => handleTagRemove(tag)}
                >
                  <span>#{tag}</span>
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

