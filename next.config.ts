import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // GitHub Pages 部署配置
  // 如果部署在子路径下（如 username.github.io/repo-name），取消下面的注释并修改
  // basePath: '/your-repo-name',
  
  // 静态导出配置（用于 GitHub Pages）
  output: 'export',
  
  // 图片优化配置
  images: {
    unoptimized: true, // 静态导出需要禁用图片优化
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // 开发环境允许的源
  allowedDevOrigins: ['*.dev.coze.site'],
  
  // 尾部斜杠配置
  trailingSlash: true,
};

export default nextConfig;
