// Simple localStorage store - easily swappable to Supabase/Firebase later
const KEY = 'cafe-menu-v1';

const DEFAULT = {
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
            { id: 'i1', name: 'Сочный Бургер', price: '450 ₽', x: 6, y: 68, w: 42 },
            { id: 'i2', name: 'Картофель Фри', price: '180 ₽', x: 52, y: 68, w: 42 },
          ],
        },
        {
          id: 's2',
          type: 'video',
          bg: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration: 8,
          transition: 'slide',
          items: [
            { id: 'i3', name: 'Комбо Обед', price: '590 ₽', x: 6, y: 72, w: 88 },
          ],
        },
        {
          id: 's3',
          type: 'image',
          bg: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1920&q=80',
          duration: 7,
          transition: 'zoom',
          items: [
            { id: 'i4', name: 'Латте', price: '220 ₽', x: 6, y: 68, w: 28 },
            { id: 'i5', name: 'Капучино', price: '210 ₽', x: 36, y: 68, w: 28 },
            { id: 'i6', name: 'Матча', price: '250 ₽', x: 66, y: 68, w: 28 },
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
          items: [{ id: 'i7', name: 'Мохито', price: '350 ₽', x: 6, y: 70, w: 88 }],
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
          items: [{ id: 'i8', name: 'Цезарь с курицей', price: '420 ₽', x: 6, y: 70, w: 88 }],
        },
      ],
    },
  ],
};

export function loadStore() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    return JSON.parse(raw);
  } catch { return structuredClone(DEFAULT); }
}

export function saveStore(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
  // notify other tabs / TVs
  localStorage.setItem(KEY + '_ts', Date.now().toString());
}

export function resetStore() {
  saveStore(structuredClone(DEFAULT));
  return structuredClone(DEFAULT);
}

export const TRANSITIONS = [
  { id: 'fade', label: 'Fade + Scale (дорого)' },
  { id: 'slide', label: 'Slide влево' },
  { id: 'zoom', label: 'Zoom + Blur' },
  { id: 'blinds', label: 'Жалюзи' },
  { id: 'cube', label: '3D Cube' },
  { id: 'pixel', label: 'Pixelate' },
];
