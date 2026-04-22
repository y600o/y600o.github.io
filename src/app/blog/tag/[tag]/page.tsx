import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FileText } from 'lucide-react';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/TagCloud';
import { getAllPosts, getAllTags, getPostsByTag } from '@/lib/posts';

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((item) => ({
    tag: encodeURIComponent(item.tag),
  }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `标签: ${decodedTag}`,
    description: `浏览所有带有「${decodedTag}」标签的文章`,
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);
  const tags = getAllTags();

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">
              标签: {decodedTag}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            共 {posts.length} 篇带有「{decodedTag}」标签的文章
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 gap-6">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TagCloud tags={tags} selectedTag={decodedTag} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
