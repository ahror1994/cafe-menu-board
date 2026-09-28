// Cloud sync: данные лежат в самом репозитории (ветка gh-pages, файл data/menu.json).
// Чтение — публично с того же GitHub Pages (работает на ТВ и любом ПК без токена).
// Запись — коммит через GitHub API, нужен токен (хранится только в браузере админа).
import { normalizeStore } from './store.js';

const REPO = 'ahror1994/cafe-menu-board';
const BRANCH = 'gh-pages';
const PATH = 'data/menu.json';
export const TOKEN_KEY = 'cafe-menu-gh-token';

const API = `https://api.github.com/repos/${REPO}`;

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}
export function setToken(t) {
  try { localStorage.setItem(TOKEN_KEY, (t || '').trim()); } catch {}
}
export function hasToken() { return Boolean(getToken()); }

// публичная ссылка на данные (отдаются вместе с сайтом)
export function cloudFileUrl() { return `${import.meta.env.BASE_URL}${PATH}`; }

// bust=true — всегда свежая копия (админка); bust=false — кэш браузера с дешёвой
// перепроверкой по ETag (ТВ: изменение приходит само, без лишнего трафика)
export async function fetchCloud(timeoutMs = 8000, bust = true) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(bust ? `${cloudFileUrl()}?t=${Date.now()}` : cloudFileUrl(), {
      cache: bust ? 'no-store' : 'default',
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = await res.json();
    if (!j || !j.data || !Array.isArray(j.data.screens)) return null;
    return { updatedAt: j.updatedAt || '', data: normalizeStore(j.data) };
  } catch { return null; }
}

function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

async function gh(path, method = 'GET', body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `GitHub ${res.status}`;
    try { msg += `: ${(await res.json()).message}`; } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Публикует данные коммитом в gh-pages. Возвращает ISO-время публикации.
export async function pushCloud(data) {
  if (!hasToken()) throw new Error('NO_TOKEN');
  const updatedAt = new Date().toISOString();
  const blob = await gh('/git/blobs', 'POST', {
    content: b64utf8(JSON.stringify({ updatedAt, data })),
    encoding: 'base64',
  });
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ref = await gh(`/git/ref/heads/${BRANCH}`);
      const commit = await gh(`/git/commits/${ref.object.sha}`);
      const tree = await gh('/git/trees', 'POST', {
        base_tree: commit.tree.sha,
        tree: [{ path: PATH, mode: '100644', type: 'blob', sha: blob.sha }],
      });
      const newCommit = await gh('/git/commits', 'POST', {
        message: `menu update ${updatedAt}`,
        tree: tree.sha,
        parents: [ref.object.sha],
      });
      await gh(`/git/refs/heads/${BRANCH}`, 'PATCH', { sha: newCommit.sha });
      return updatedAt;
    } catch (e) {
      lastErr = e;
      // гонка при обновлении ref — повторяем сборку коммита от свежей головы
      if (!/409|422/.test(String(e.message))) throw e;
    }
  }
  throw lastErr;
}
