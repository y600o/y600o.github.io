import type { Metadata } from 'next';
import { getAllPosts, getAllTags } from '@/lib/posts';
import SearchableBlogContent from '@/components/SearchableBlogContent';

export const metadata: Metadata = {
  title: '博客',
  description: '浏览所有技术文章，涵盖前端开发、全栈架构和效率工具',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return <SearchableBlogContent posts={posts} tags={tags} />;
}
