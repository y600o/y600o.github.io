import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackToList() {
  return (
    <Link
      href="/blog"
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors mb-8"
    >
      <ArrowLeft className="h-4 w-4" />
      返回文章列表
    </Link>
  );
}
