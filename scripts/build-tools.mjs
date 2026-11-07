import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'out');
if (!existsSync(path.join(output, 'index.html'))) {
  throw new Error('请先构建博客，再构建工具。');
}
const tools = ['trip-report'];
for (const slug of tools) {
  const directory = path.join(root, 'tools', slug);
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: directory, stdio: 'inherit', shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  const target = path.join(output, 'tools', slug);
  if (existsSync(target)) throw new Error(`工具输出路径已存在：${target}`);
  mkdirSync(target, { recursive: true });
  cpSync(path.join(directory, 'dist'), target, { recursive: true });
}
