import Link from 'next/link';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">页面未找到</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          抱歉，你访问的页面不存在或已被移除。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold hover:bg-accent transition-colors"
          >
            <Home className="h-5 w-5" />
            返回首页
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <FileQuestion className="h-5 w-5" />
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
}
