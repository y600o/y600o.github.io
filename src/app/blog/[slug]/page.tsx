import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, Tag, Clock } from 'lucide-react';
import BackToList from '@/components/BackToList';
import TagCloud from '@/components/TagCloud';
import PostCard from '@/components/PostCard';
import ShareButton from '@/components/ShareButton';
import { getAllPosts, getPostBySlug, getAllTags, getRelatedPosts } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  
  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tags = getAllTags();
  const relatedPosts = getRelatedPosts(slug, post.tags, 2);

  // 计算阅读时间
  const wordCount = post.content.replace(/<[^>]*>/g, '').length;
  const readingTime = Math.ceil(wordCount / 400);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <BackToList />

        {/* Article Header */}
        <article className="bg-white border-2 border-primary mb-8">
          <div className="p-8">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent text-sm font-medium hover:bg-accent hover:text-white transition-colors"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                约 {readingTime} 分钟阅读
              </span>
            </div>

            {/* Excerpt */}
            <p className="text-lg text-gray-600 mb-6 p-4 bg-secondary/50 border-l-4 border-accent">
              {post.excerpt}
            </p>

            {/* Content */}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Share Section */}
        <div className="bg-secondary/30 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-3">分享这篇文章</h3>
          <div className="flex gap-3">
            <ShareButton />
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-primary mb-6">相关文章</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.slug} post={relatedPost} />
              ))}
            </div>
          </div>
        )}

        {/* Tags Sidebar */}
        <div className="mb-8">
          <TagCloud tags={tags} />
        </div>
      </div>
    </div>
  );
}
