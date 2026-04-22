import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import PostCard from '@/components/PostCard';
import TagCloud from '@/components/TagCloud';
import { getAllPosts, getAllTags } from '@/lib/posts';

export const metadata: Metadata = {
  title: '博客',
  description: '浏览所有技术文章，涵盖前端开发、全栈架构和效率工具',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary">博客文章</h1>
          </div>
          <p className="text-gray-600 text-lg">
            共 {posts.length} 篇文章，持续更新中
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 border-2 border-primary text-center">
                <p className="text-gray-600">暂无文章，敬请期待！</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TagCloud tags={tags} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
