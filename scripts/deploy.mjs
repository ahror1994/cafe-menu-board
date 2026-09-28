// Деплой: build → сохранить живые данные облака в dist → опубликовать dist в ветку gh-pages.
// gh-pages заменяет ветку целиком, поэтому data/menu.json нужно пронести через деплой.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LIVE = 'https://ahror1994.github.io/cafe-menu-board/data/menu.json';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status || 1);
}

run('npx', ['vite', 'build']);

// --- пронести живые данные облака через деплой (gh-pages заменяется целиком) ---
async function ghApi(path) {
  const { execSync } = await import('node:child_process');
  const out = execSync(`gh api "${path}"`, { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' });
  return JSON.parse(out);
}

try {
  // 1) данные меню
  const res = await fetch(`${LIVE}?t=${Date.now()}`);
  if (res.ok) {
    const txt = await res.text();
    JSON.parse(txt);
    mkdirSync('dist/data', { recursive: true });
    writeFileSync('dist/data/menu.json', txt);
    console.log(`[deploy] живые данные облака сохранены в dist (${Math.round(txt.length / 1024)}KB)`);
  } else {
    console.log(`[deploy] в облаке ещё нет данных (${res.status}) — уйдёт seed из public/data`);
  }
  // 2) все файлы данных облака (data/img/*, data/video/* и т.д.)
  const treeRes = await ghApi('repos/ahror1994/cafe-menu-board/git/trees/gh-pages?recursive=1');
  const dataFiles = (treeRes.tree || []).filter((t) => t.type === 'blob' && t.path.startsWith('data/') && t.path !== 'data/menu.json');
  for (const t of dataFiles) {
    const dest = 'dist/' + t.path;
    mkdirSync(path.dirname(dest), { recursive: true });
    const r = await fetch(`https://ahror1994.github.io/cafe-menu-board/${t.path}`);
    if (r.ok) writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  }
  if (dataFiles.length) console.log(`[deploy] файлы облака перенесены: ${dataFiles.length} шт.`);
} catch (e) {
  console.warn('[deploy] не смог получить живые данные:', e.message);
}

run('npx', ['gh-pages', '-d', 'dist']);
