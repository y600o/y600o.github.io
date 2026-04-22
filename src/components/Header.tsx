'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Github, Mail } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '博客' },
  { href: '/about', label: '关于' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-primary text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="w-8 h-8">
              <img src="/typicon.ico" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:inline">个人博客</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent text-white'
                    : 'hover:bg-accent/80'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Social Links - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="https://github.com/y600o"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent/80 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:crescentmere@outlook.com"
              className="p-2 hover:bg-accent/80 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-accent/80 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-accent/30 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'block px-4 py-3 font-medium transition-colors',
                  pathname === link.href
                    ? 'bg-accent text-white'
                    : 'hover:bg-accent/80'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 py-3 border-t border-accent/30 mt-2">
              <a
                href="https://github.com/y600o"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:crescentmere@outlook.com"
                className="p-2 hover:bg-accent/80 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
