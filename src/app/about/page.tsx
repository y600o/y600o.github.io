import type { Metadata } from 'next';
import { User, Code, BookOpen, Heart, Mail, Github } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '关于作者',
  description: '了解技术博客作者的个人信息和背景',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">关于作者</h1>
          <p className="text-gray-600 text-lg">热爱技术，专注前端，享受分享</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border-2 border-primary p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-secondary flex items-center justify-center border-4 border-primary mx-auto md:mx-0">
                <User className="h-16 w-16 text-primary" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">技术博主</h2>
              <p className="text-gray-600 mb-4">
                全栈开发工程师，专注于现代前端技术栈的探索与实践。
                热衷于开源项目和技术分享，相信代码改变世界。
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-accent transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="mailto:hello@example.com"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-accent transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  联系我
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white border-2 border-primary p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Code className="h-6 w-6 text-accent" />
            技术栈
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'React', 'Next.js', 'TypeScript', 'Node.js',
              'Tailwind CSS', 'PostgreSQL', 'Docker', 'Git'
            ].map((skill) => (
              <div key={skill} className="px-4 py-3 bg-secondary text-secondary-foreground text-center font-medium">
                {skill}
              </div>
            ))}
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-white border-2 border-primary p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent" />
            兴趣爱好
          </h3>
          <ul className="space-y-3">
            {[
              '探索新技术，特别是前端领域的创新',
              '阅读技术书籍和论文',
              '参与开源项目，贡献代码',
              '写技术博客，分享经验',
              '旅行和摄影'
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-accent text-white flex items-center justify-center flex-shrink-0 text-sm">
                  {index + 1}
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Section */}
        <div className="bg-accent text-white p-8">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6" />
            联系我
          </h3>
          <p className="mb-6 text-white/90">
            如果你有任何问题、合作意向或者只是想打个招呼，欢迎联系我！
          </p>
          <div className="space-y-2 text-white/90">
            <p>邮箱: hello@example.com</p>
            <p>GitHub: github.com/username</p>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold hover:bg-accent transition-colors"
          >
            返回博客
          </Link>
        </div>
      </div>
    </div>
  );
}
