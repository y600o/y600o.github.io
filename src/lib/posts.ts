import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  coverImage?: string;
}

export interface Post extends PostMeta {
  content: string;
}

function getPostSlugs(): string[] {
  try {
    return fs.readdirSync(postsDirectory).filter((file) => {
      return file.endsWith('.md');
    }).map((file) => {
      // 移除 .md 后缀
      return file.replace(/\.md$/, '');
    });
  } catch {
    return [];
  }
}

function parsePostFile(slug: string): PostMeta {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title || 'Untitled',
    date: data.date || new Date().toISOString().split('T')[0],
    excerpt: data.excerpt || '',
    tags: data.tags || [],
    coverImage: data.coverImage,
  };
}

export function getAllPosts(): PostMeta[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => parsePostFile(slug));

  return posts.sort((postA, postB) => {
    const dateA = new Date(postA.date);
    const dateB = new Date(postB.date);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(remarkGfm)
      .use(remarkHtml, { sanitize: false })
      .process(content);

    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      coverImage: data.coverImage,
      content: contentHtml,
    };
  } catch {
    return null;
  }
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByTag(tag: string): PostMeta[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}

export function getRelatedPosts(currentSlug: string, tags: string[], limit = 3): PostMeta[] {
  const posts = getAllPosts();
  const scored = posts
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      const commonTags = post.tags.filter((tag) => tags.includes(tag));
      return { post, score: commonTags.length };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.post);
}
