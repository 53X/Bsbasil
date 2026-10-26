import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = resolve(root, 'dist/client');
const indexPath = resolve(clientDir, 'index.html');
const shellPath = resolve(clientDir, 'shell.html');

copyFileSync(indexPath, shellPath);

try {
  const mod = await import(pathToFileURL(resolve(root, 'dist/prerender/prerender.mjs')).href);
  const render = mod.render;
  const result = await render('/', 'https://bsbasil.vercel.app');
  let body = result.html || '';
  const hydration = body.match(/<script[^>]*>\s*window\.__staticRouterHydrationData[\s\S]*?<\/script>/);
  if (hydration) body = body.replace(hydration[0], '');
  // React 19 emits image preloads inside the render container. Hydration
  // expects those in <head>, and leaving them in #app makes React discard
  // the server HTML (error 418) and paint the hero only after JavaScript.
  const hoisted = [];
  body = body.replace(/<link\b[^>]*\brel="preload"[^>]*>/gi, (tag) => {
    hoisted.push(tag);
    return '';
  });

  const hosts = new Set(['https://cdn.shopify.com']);
  for (const match of body.matchAll(/https:\/\/[a-z0-9.-]+\.myshopify\.com/g)) {
    hosts.add(match[0]);
  }
  const preconnects = [...hosts]
    .map((origin) => `<link rel="preconnect" href="${origin}" crossorigin />`)
    .join('\n');

  const template = readFileSync(shellPath, 'utf8');
  const head = [preconnects, ...hoisted, result.head || ''].filter(Boolean).join('\n');
  let page = template
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-html-->', () => body);
  const stylesheet = page.match(/<link rel="stylesheet"[^>]*>/);
  if (stylesheet) {
    page = page.replace(stylesheet[0], '');
    page = page.replace('</style>', `</style>\n    ${stylesheet[0]}`);
  }
  if (hydration) {
    page = page.replace('</body>', `${hydration[0]}\n  </body>`);
  }
  writeFileSync(indexPath, page);
  console.log(`prerendered homepage (${page.length} bytes)`);
} catch (error) {
  console.error('prerender failed, serving the app shell for /', error);
  copyFileSync(shellPath, indexPath);
  process.exitCode = 1;
}
