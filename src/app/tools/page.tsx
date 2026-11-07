import type { Metadata } from 'next';
import { ArrowUpRight, Wrench } from 'lucide-react';
import { browserTools } from '@/lib/tools';

export const metadata: Metadata = {
  title: '工具箱',
  description: '日常使用的浏览器工具：出差报表、文件处理与更多实用工具。',
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 border-l-4 border-primary bg-secondary p-8">
          <Wrench className="mb-4 h-8 w-8 text-primary" aria-hidden="true" />
          <h1 className="mb-3 text-4xl font-bold text-primary">工具箱</h1>
          <p className="text-gray-600">把日常重复的小事，交给浏览器。</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {browserTools.map((tool) => (
            <article key={tool.slug} className="border-2 border-primary bg-white p-6">
              <h2 className="mb-3 text-2xl font-bold text-primary">{tool.name}</h2>
              <p className="mb-5 leading-relaxed text-gray-600">{tool.description}</p>
              <ul className="mb-6 flex flex-wrap gap-2">
                {tool.features.map((feature) => <li key={feature} className="bg-secondary px-3 py-1 text-sm text-primary">{feature}</li>)}
              </ul>
              <a href={`/tools/${tool.slug}/`} className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-medium text-white hover:bg-accent">
                打开{tool.name}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm leading-relaxed text-gray-600">从旧版出差报表迁移时，请先在旧站导出设置 JSON，再在新工具中导入。账单需重新选择，手机主屏幕快捷方式需从新地址重新添加。</p>
      </div>
    </div>
  );
}
