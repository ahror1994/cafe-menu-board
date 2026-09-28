// Деплой: build → сохранить живые данные облака в dist → опубликовать dist в ветку gh-pages.
// gh-pages заменяет ветку целиком, поэтому data/menu.json нужно пронести через деплой.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const LIVE = 'https://ahror1994.github.io/cafe-menu-board/data/menu.json';

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true });
  if (r.status !== 0) process.exit(r.status || 1);
}

run('npx', ['vite', 'build']);

try {
  const res = await fetch(`${LIVE}?t=${Date.now()}`);
  if (res.ok) {
    const txt = await res.text();
    JSON.parse(txt); // проверка целостности
    mkdirSync('dist/data', { recursive: true });
    writeFileSync('dist/data/menu.json', txt);
    console.log(`[deploy] живые данные облака сохранены в dist (${Math.round(txt.length / 1024)}KB)`);
  } else {
    console.log(`[deploy] в облаке ещё нет данных (${res.status}) — уйдёт seed из public/data`);
  }
} catch (e) {
  console.warn('[deploy] не смог получить живые данные:', e.message);
}

run('npx', ['gh-pages', '-d', 'dist']);
