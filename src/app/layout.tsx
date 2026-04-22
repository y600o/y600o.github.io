import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: '个人博客 - 记录学习所得',
    template: '%s | 个人博客',
  },
  description: '记录学习所得，整理技术笔记。时间久了容易遗忘或散乱，因此搭建了这个博客，方便随时查阅。',
  keywords: ['博客', '学习', 'GIS', 'Remote Sensing', 'Python', 'Machine Learning'],
  authors: [{ name: 'y600' }],
  icons: {
    icon: '/typicon.ico',
  },
  openGraph: {
    title: '个人博客 - 记录学习所得',
    description: '记录学习所得，整理技术笔记。',
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
