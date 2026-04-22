'use client';

import Link from 'next/link';
import { Tag as TagIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagCloudProps {
  tags: { tag: string; count: number }[];
  selectedTag?: string;
}

export default function TagCloud({ tags, selectedTag }: TagCloudProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 border-2 border-primary">
      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
        <TagIcon className="h-5 w-5" />
        标签云
      </h3>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={cn(
            'px-3 py-1 text-sm transition-colors',
            !selectedTag
              ? 'bg-primary text-white'
              : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-white'
          )}
        >
          全部
        </Link>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className={cn(
              'px-3 py-1 text-sm transition-colors',
              selectedTag === tag
                ? 'bg-primary text-white'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-white'
            )}
          >
            {tag}
            <span className="ml-1 text-xs opacity-70">({count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
