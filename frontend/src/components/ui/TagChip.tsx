import { X } from 'lucide-react';

type TagChipProps = {
  tag: string;
  onRemove?: () => void;
  variant?: 'default' | 'primary';
};

export const TagChip = ({ tag, onRemove, variant = 'default' }: TagChipProps) => {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs';
  
  const variantClasses = variant === 'primary'
    ? 'bg-primary text-primary-foreground'
    : 'bg-primary/10 text-primary';

  return (
    <span className={`${baseClasses} ${variantClasses}`}>
      #{tag}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-primary/20 rounded p-0.5 ml-1"
          aria-label={`Remove tag ${tag}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

