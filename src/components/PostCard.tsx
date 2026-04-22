import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';
import { PostMeta } from '@/lib/posts';
import { formatDate, cn } from '@/lib/utils';

interface PostCardProps {
  post: PostMeta;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      className={cn(
        'bg-white border-2 border-primary transition-all hover:shadow-lg',
        featured ? 'md:flex' : ''
      )}
    >
      {featured && post.coverImage && (
        <div className="md:w-1/3 bg-muted flex items-center justify-center">
          <div className="w-full h-48 md:h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground text-sm">封面图片</span>
          </div>
        </div>
      )}
      <div className={cn('p-6', featured ? 'md:w-2/3' : '')}>
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent text-xs font-medium"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className={cn('font-bold text-gray-900 mb-2', featured ? 'text-2xl' : 'text-xl')}>
          <Link href={`/blog/${post.slug}`} className="hover:text-accent transition-colors">
            {post.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.date)}
          </span>
          <Link
            href={`/blog/${post.slug}`}
            className="text-accent font-medium hover:underline"
          >
            阅读全文 →
          </Link>
        </div>
      </div>
    </article>
  );
}
