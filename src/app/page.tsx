import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { browserTools } from '@/lib/tools';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';

export default function HomePage() {
  const allPosts = getAllPosts();
  const recentPosts = allPosts.slice(0, 4);
  const recentTools = [...browserTools].sort((a, b) => b.addedOn.localeCompare(a.addedOn)).slice(0, 2);

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
            <h2 className="text-2xl font-bold text-primary">最新文章</h2>
            <Link 
              href="/blog" 
              className="text-sm text-accent hover:text-primary transition-colors"
            >
              查看全部 {allPosts.length} 篇 →
            </Link>
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

        <section className="mb-8" aria-labelledby="recent-tools-heading">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 id="recent-tools-heading" className="text-2xl font-bold text-primary">最新工具</h2>
            <Link href="/tools" className="text-sm text-accent hover:text-primary transition-colors">
              查看全部工具箱 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentTools.map((tool) => (
              <article key={tool.slug} className="bg-white border-2 border-primary p-6 hover:shadow-lg transition-shadow">
                <ul className="mb-4 flex flex-wrap gap-2">
                  {tool.features.map((feature) => <li key={feature} className="bg-secondary px-2 py-1 text-sm text-accent">{feature}</li>)}
                </ul>
                <h3 className="mb-3 text-xl font-bold">{tool.name}</h3>
                <p className="mb-4 text-gray-600">{tool.description}</p>
                <a href={`/tools/${tool.slug}/`} className="inline-flex items-center gap-1 text-sm text-accent hover:text-primary transition-colors">
                  打开工具 <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
