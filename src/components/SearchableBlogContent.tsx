"use client";

import { useState, useMemo } from "react";
import { Search, X, FileText } from "lucide-react";
import PostCard from "@/components/PostCard";
import TagCloud from "@/components/TagCloud";
import { PostMeta } from "@/lib/posts";

interface SearchableBlogContentProps {
  posts: PostMeta[];
  tags: { tag: string; count: number }[];
}

export default function SearchableBlogContent({ posts, tags }: SearchableBlogContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(query);
      const excerptMatch = post.excerpt.toLowerCase().includes(query);
      const tagMatch = post.tags.some((tag) => tag.toLowerCase().includes(query));
      return titleMatch || excerptMatch || tagMatch;
    });
  }, [posts, searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

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
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文章标题或标签..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 focus:border-accent focus:outline-none transition-colors bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 transition-colors"
                    aria-label="清除搜索"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-sm text-gray-500">
                  找到 {filteredPosts.length} 篇与 &quot;{searchQuery}&quot; 相关的文章
                </p>
              )}
            </div>

            {/* Posts */}
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 border-2 border-primary text-center">
                <p className="text-gray-600 mb-4">未找到匹配的文章</p>
                <button
                  onClick={clearSearch}
                  className="text-accent hover:text-primary transition-colors"
                >
                  清除搜索
                </button>
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
