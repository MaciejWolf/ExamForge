import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Tag } from '@/services/api';
import { X } from 'lucide-react';

type FilterBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: Tag[];
  availableTags: Tag[];
  onTagToggle: (tag: Tag) => void;
  onTagRemove: (tag: Tag) => void;
};

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTags,
  availableTags,
  onTagToggle,
  onTagRemove,
}: FilterBarProps) => {
  const unselectedTags = availableTags.filter(
    tag => !selectedTags.some(selected => selected.id === tag.id)
  );

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
        <Label>Filter by Tags</Label>
        <div className="space-y-2">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm cursor-pointer hover:bg-primary/90"
                  onClick={() => onTagRemove(tag)}
                >
                  <span>{tag.name}</span>
                  <X className="h-3 w-3" />
                </div>
              ))}
            </div>
          )}

          {/* Available Tags */}
          {unselectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/50">
              {unselectedTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {availableTags.length === 0 && (
            <p className="text-sm text-muted-foreground">No tags available</p>
          )}
        </div>
      </div>
    </div>
  );
};

