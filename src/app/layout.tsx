import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: '技术博客 - 分享技术心得',
    template: '%s | 技术博客',
  },
  description: '分享技术心得，记录成长历程。这里有关于前端开发、全栈架构和效率工具的实用内容。',
  keywords: ['博客', '技术', '前端', 'React', 'Next.js', 'TypeScript'],
  authors: [{ name: '技术博主' }],
  icons: {
    icon: '/typicon.ico',
  },
  openGraph: {
    title: '技术博客 - 分享技术心得',
    description: '分享技术心得，记录成长历程。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
