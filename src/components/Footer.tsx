import Link from 'next/link';
import { Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/" className="hover:text-accent transition-colors">
              首页
            </Link>
            <Link href="/blog" className="hover:text-accent transition-colors">
              博客
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              关于
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-gray-800 hover:bg-accent transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:hello@example.com"
              className="p-2 bg-gray-800 hover:bg-accent transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-400">
            <p>© {currentYear} 技术博客. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500" /> using Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
