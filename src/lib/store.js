// Simple localStorage store - easily swappable to Supabase/Firebase later
const KEY = 'cafe-menu-v1';

function uid() { return Math.random().toString(36).slice(2, 9); }

function defaultStyle() {
  return {
    bg: '#ffffff',
    bgOpacity: 0.82,
    blur: 14,
    radius: 20,
    borderOpacity: 0.5,
    shadow: true,
    textColor: '#18181b',
    priceBg: '#18181b',
    priceColor: '#ffffff',
  };
}

function normalizeItem(raw, i) {
  const cols = [46, 30, 32];
  return {
    id: raw.id || uid(),
    title: raw.title || raw.name || 'Блюдо',
    desc: raw.desc || raw.subtitle || '',
    weight: raw.weight || raw.gram || raw.grams || raw.gramm || '',
    price: raw.price || '0 ₽',
    // % coords, Figma-like free placement
    x: typeof raw.x === 'number' ? raw.x : (i === 0 ? 6 : i === 1 ? 52 : 10 + i * 30) % 60,
    y: typeof raw.y === 'number' ? raw.y : 68,
    w: typeof raw.w === 'number' ? raw.w : raw.w ? Number(raw.w) : cols[i % cols.length],
    style: { ...defaultStyle(), ...(raw.style || {}) },
  };
}

const RAW_DEFAULT = {
  screens: [
    {
      id: 'tv1',
      name: 'Экран 1 — Касса',
      slides: [
        {
          id: 's1',
          type: 'image',
          bg: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=1920&q=80',
          duration: 7,
          transition: 'fade',
          items: [
            { name: 'Сочный Бургер', price: '450 ₽', x: 4, y: 62, w: 38 },
            { name: 'Картофель Фри', price: '180 ₽', x: 46, y: 62, w: 34 },
            { name: 'Соус на выбор', price: '40 ₽', x: 4, y: 78, w: 76 },
          ],
        },
        {
          id: 's2',
          type: 'video',
          bg: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 8,
          transition: 'slide',
          items: [
            { name: 'Комбо Обед', desc: 'Бургер + фри + напиток', price: '590 ₽', x: 6, y: 70, w: 52 },
          ],
        },
        {
          id: 's3',
          type: 'image',
          bg: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1920&q=80',
          duration: 7,
          transition: 'zoom',
          items: [
            { name: 'Латте', price: '220 ₽', x: 4, y: 62, w: 28 },
            { name: 'Капучино', price: '210 ₽', x: 36, y: 62, w: 28 },
            { name: 'Матча', price: '250 ₽', x: 68, y: 62, w: 24 },
          ],
        },
      ],
    },
    {
      id: 'tv2',
      name: 'Экран 2 — Бар',
      slides: [
        {
          id: 's4',
          type: 'image',
          bg: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&q=80',
          duration: 7,
          transition: 'blinds',
          items: [{ name: 'Мохито', desc: 'Классический', price: '350 ₽', x: 6, y: 68, w: 54 }],
        },
      ],
    },
    {
      id: 'tv3',
      name: 'Экран 3 — Витрина',
      slides: [
        {
          id: 's5',
          type: 'image',
          bg: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1920&q=80',
          duration: 7,
          transition: 'fade',
          items: [{ name: 'Цезарь с курицей', desc: 'Свежий салат', price: '420 ₽', x: 6, y: 70, w: 54 }],
        },
      ],
    },
  ],
};

function normalizeStore(raw) {
  if (!raw || !raw.screens) return normalizeStore(RAW_DEFAULT);
  const screens = raw.screens.map((sc) => ({
    id: sc.id,
    name: sc.name,
    slides: (sc.slides || []).map((sl) => ({
      id: sl.id,
      type: sl.type || 'image',
      bg: sl.bg,
      duration: sl.duration || 7,
      transition: sl.transition || 'fade',
      items: (sl.items || []).map((it, idx) => normalizeItem(it, idx)),
    })),
  }));
  return { screens };
}

const DEFAULT = normalizeStore(RAW_DEFAULT);

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    // migrate old shape if needed
    return normalizeStore(parsed);
  } catch { return structuredClone(DEFAULT); }
}

export function saveStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  localStorage.setItem(KEY + '_ts', Date.now().toString());
}

export function resetStore() {
  const d = structuredClone(DEFAULT);
  saveStore(d);
  return d;
}

export function createEmptyItem() {
  return normalizeItem({ title: 'Новое блюдо', desc: '', price: '300 ₽', x: 30, y: 36, w: 36 }, 0);
}

export function makeId() { return uid(); }

export const TRANSITIONS = [
  { id: 'fade', label: 'Fade + Scale (дорого)' },
  { id: 'slide', label: 'Slide влево' },
  { id: 'zoom', label: 'Zoom + Blur' },
  { id: 'blinds', label: 'Жалюзи' },
  { id: 'cube', label: '3D Cube' },
  { id: 'pixel', label: 'Pixelate' },
];

export const DEFAULT_STYLE = defaultStyle();

export function hexToRgba(hex, opacity = 1) {
  try {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
  } catch { return `rgba(255,255,255,${opacity})`; }
}
