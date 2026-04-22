import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';

export default function HomePage() {
  const recentPosts = getAllPosts();

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* 引用语录 */}
        <div className="bg-secondary border-l-4 border-accent p-6 mb-8">
          <p className="text-lg text-primary italic">
            芥子须臾，俯拾皆是。
          </p>
          <p className="text-sm text-gray-600 mt-2">——《灵笼》白月魁</p>
        </div>

        {/* 文章列表 - 双列布局 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">全部文章</h2>
            <span className="text-gray-500 text-sm">共 {recentPosts.length} 篇</span>
          </div>
          
          {recentPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 border-2 border-primary text-center">
              <p className="text-gray-600">暂无文章，敬请期待！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
