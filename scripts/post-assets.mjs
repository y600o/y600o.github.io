import fs from 'node:fs';
import path from 'node:path';

export const projectRoot = process.cwd();

/** Convert an article-relative image URL without changing the Markdown source. */
export function resolvePostImage(url, slug, root = projectRoot) {
  if (url.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(url)) return url;

  const suffixIndex = url.search(/[?#]/);
  const pathname = suffixIndex < 0 ? url : url.slice(0, suffixIndex);
  const suffix = suffixIndex < 0 ? '' : url.slice(suffixIndex);
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new Error(`文章 ${slug}.md 的图片地址编码无效：${url}`);
  }
  const relative = path.posix.normalize(decoded);
  if (!relative.startsWith('attachments/')) {
    throw new Error(`文章 ${slug}.md 的本地图片必须放在 attachments/：${url}`);
  }

  // Compare exact directory entries even on case-insensitive Windows filesystems.
  let directory = path.join(root, 'content/posts');
  for (const segment of relative.split('/')) {
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory() ||
        !fs.readdirSync(directory).includes(segment)) {
      throw new Error(`文章 ${slug}.md 的图片不存在或大小写不一致：${url}`);
    }
    directory = path.join(directory, segment);
  }
  if (!fs.statSync(directory).isFile()) {
    throw new Error(`文章 ${slug}.md 的图片不是文件：${url}`);
  }
  return `/post-assets/${relative.split('/').map(encodeURIComponent).join('/')}${suffix}`;
}

export function syncPostAssets(root = projectRoot) {
  const source = path.join(root, 'content/posts/attachments');
  const target = path.resolve(root, 'public/post-assets/attachments');
  const managedRoot = path.resolve(root, 'public/post-assets');
  if (path.dirname(target) !== managedRoot) throw new Error('Invalid asset destination');
  fs.rmSync(target, { recursive: true, force: true });
  if (fs.existsSync(source)) {
    fs.mkdirSync(managedRoot, { recursive: true });
    fs.cpSync(source, target, { recursive: true });
  }
}
