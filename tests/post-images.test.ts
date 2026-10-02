import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { remark } from 'remark';
import html from 'remark-html';
import { resolvePostImage, syncPostAssets } from '../scripts/post-assets.mjs';
import remarkPostImages from '../src/lib/remark-post-images';
import { getPostBySlug } from '../src/lib/posts';

test('publishes attachments, encodes URLs and removes stale generated files', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-assets-'));
  try {
    const attachments = path.join(root, 'content/posts/attachments');
    fs.mkdirSync(path.join(attachments, '子目录'), { recursive: true });
    fs.writeFileSync(path.join(attachments, '子目录/图片 名称.jpg'), 'fixture');
    syncPostAssets(root);
    assert.equal(fs.readFileSync(path.join(root, 'public/post-assets/attachments/子目录/图片 名称.jpg'), 'utf8'), 'fixture');
    const expected = '/post-assets/attachments/%E5%AD%90%E7%9B%AE%E5%BD%95/%E5%9B%BE%E7%89%87%20%E5%90%8D%E7%A7%B0.jpg';
    assert.equal(resolvePostImage('./attachments/子目录/图片 名称.jpg', 'sample', root), expected);
    assert.equal(resolvePostImage('./attachments/子目录/图片 名称.jpg?v=1#preview', 'sample', root), `${expected}?v=1#preview`);
    assert.equal(resolvePostImage('attachments/%E5%AD%90%E7%9B%AE%E5%BD%95/%E5%9B%BE%E7%89%87%20%E5%90%8D%E7%A7%B0.jpg', 'sample', root), expected);
    assert.throws(() => resolvePostImage('attachments/missing.jpg', 'sample', root), /sample.md.*missing.jpg/);
    fs.writeFileSync(path.join(attachments, 'Photo.jpg'), 'fixture');
    assert.throws(() => resolvePostImage('attachments/photo.jpg', 'sample', root), /大小写/);
    assert.throws(() => resolvePostImage('attachments/../../private.jpg', 'sample', root), /attachments/);
    assert.throws(() => resolvePostImage('attachments/%zz.jpg', 'sample', root), /编码无效/);
    fs.unlinkSync(path.join(attachments, '子目录/图片 名称.jpg'));
    syncPostAssets(root);
    assert.equal(fs.existsSync(path.join(root, 'public/post-assets/attachments/子目录/图片 名称.jpg')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('preserves external and root-relative images', () => {
  for (const url of ['https://example.com/photo.jpg', '//example.com/photo.jpg', '/images/photo.jpg']) {
    assert.equal(resolvePostImage(url, 'sample'), url);
  }
});

test('converts actual article images and reference images, leaving code examples alone', async () => {
  const source = '![](attachments/omap-add-bingmap_1.jpg)\n\n![map][photo]\n\n[photo]: attachments/omap-add-bingmap_1.jpg\n\n```md\n![](attachments/missing.jpg)\n```';
  const result = String(await remark().use(remarkPostImages, { slug: 'sample' }).use(html).process(source));
  assert.equal((result.match(/src="\/post-assets\/attachments\/omap-add-bingmap_1.jpg"/g) ?? []).length, 2);
  assert.match(result, /!\[\]\(attachments\/missing.jpg\)/);
});

test('missing images reject rendering instead of producing a silent 404', async () => {
  await assert.rejects(remark().use(remarkPostImages, { slug: 'sample' }).use(html).process('![](attachments/missing.jpg)'), /sample.md.*missing.jpg/);
  assert.equal(await getPostBySlug('__missing_article__'), null);
  assert.match((await getPostBySlug('omap-add-bingmap'))!.content, /src="\/post-assets\/attachments\/omap-add-bingmap_1.jpg"/);
});
