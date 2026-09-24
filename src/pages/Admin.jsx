import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStore, saveStore, resetStore, TRANSITIONS, createEmptyItem, hexToRgba } from '../lib/store';
import CanvasStage from '../components/CanvasStage';

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function Admin() {
  const [store, setStore] = useState(() => loadStore());
  const [activeScreenId, setActiveScreenId] = useState(store.screens[0]?.id);
  const [activeSlideId, setActiveSlideId] = useState(store.screens[0]?.slides[0]?.id);
  const [selectedId, setSelectedId] = useState(store.screens[0]?.slides[0]?.items[0]?.id || null);

  useEffect(() => { saveStore(store); }, [store]);

  const screen = store.screens.find((s) => s.id === activeScreenId);
  const slide = screen?.slides.find((s) => s.id === activeSlideId);
  const selected = slide?.items.find((x) => x.id === selectedId) || null;

  // keep selection in sync when switching
  useEffect(() => {
    if (!slide) return;
    if (!selectedId || !slide.items.find((x) => x.id === selectedId)) {
      setSelectedId(slide.items[0]?.id || null);
    }
  }, [activeSlideId, slide, selectedId]);

  function updateStore(fn) {
    setStore((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  function patchItem(itemId, patch) {
    updateStore((d) => {
      const it = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.find((x) => x.id === itemId);
      Object.assign(it, patch);
    });
  }
  function patchStyle(itemId, patch) {
    updateStore((d) => {
      const it = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.find((x) => x.id === itemId);
      it.style = { ...it.style, ...patch };
    });
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1480px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cafe Menu Board — Админка</h1>
            <p className="text-xs text-zinc-400">Figma-холст: тяни плашки мышкой куда хочешь → на ТВ будет 1-в-1. Прозрачность / блюр / цвет — всё настраивается.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const s = resetStore(); setStore(s); setActiveScreenId(s.screens[0].id); setActiveSlideId(s.screens[0].slides[0].id); setSelectedId(s.screens[0].slides[0].items[0]?.id || null); }} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm border border-zinc-700">Сбросить демо</button>
            <Link to={`/tv/${activeScreenId}`} target="_blank" className="px-4 py-2 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100">Открыть ТВ ▶</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1480px] mx-auto w-full flex flex-1 min-h-0">
        <aside className="w-[320px] shrink-0 border-r border-zinc-800 p-4 flex flex-col gap-4 bg-zinc-900/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Экраны</h2>
              <button onClick={() => updateStore((d) => { const id = 'tv' + (d.screens.length + 1); d.screens.push({ id, name: `Экран ${d.screens.length + 1}`, slides: [{ id: uid(), type: 'image', bg: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1920', duration: 7, transition: 'fade', items: [{ ...createEmptyItem(), x: 6, y: 68, w: 52 }] }] }); })} className="text-xs px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">+ Экран</button>
            </div>
            <div className="flex flex-col gap-2">
              {store.screens.map((s) => (
                <button key={s.id} onClick={() => { setActiveScreenId(s.id); setActiveSlideId(s.slides[0]?.id); }} className={`text-left px-3 py-3 rounded-xl border flex items-center justify-between ${activeScreenId === s.id ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                  <span className="font-medium text-sm">{s.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${activeScreenId === s.id ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'}`}>{s.slides.length} листов</span>
                </button>
              ))}
            </div>
          </div>

          {screen && (
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Листы экрана</h2>
                <button onClick={() => updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); const ns = { id: uid(), type: 'image', bg: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1920', duration: 7, transition: 'fade', items: [{ ...createEmptyItem(), x: 6, y: 48, w: 48 }] }; sc.slides.push(ns); setActiveSlideId(ns.id); setSelectedId(ns.items[0].id); })} className="text-xs px-2 py-1 rounded-lg bg-white text-zinc-900 font-semibold hover:bg-zinc-100">+ Лист</button>
              </div>
              <div className="flex flex-col gap-2 overflow-auto pr-1">
                {screen.slides.map((sl, i) => (
                  <div key={sl.id} onClick={() => { setActiveSlideId(sl.id); setSelectedId(sl.items[0]?.id || null); }} className={`group relative rounded-xl overflow-hidden border cursor-pointer ${activeSlideId === sl.id ? 'border-white ring-2 ring-white/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="h-[110px] bg-zinc-800 relative">
                      {sl.type === 'video' ? <video src={sl.bg} muted className="w-full h-full object-cover opacity-80" /> : <img src={sl.bg} alt="" className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold bg-black/60 backdrop-blur px-2 py-1 rounded-full text-white">#{i + 1} • {sl.transition} • {sl.duration}с</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={(e) => { e.stopPropagation(); updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); const idx = sc.slides.findIndex((x) => x.id === sl.id); if (idx > 0) [sc.slides[idx - 1], sc.slides[idx]] = [sc.slides[idx], sc.slides[idx - 1]]; }); }} className="w-7 h-7 grid place-items-center rounded-lg bg-black/70 text-white text-xs">↑</button>
                        <button onClick={(e) => { e.stopPropagation(); updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); const idx = sc.slides.findIndex((x) => x.id === sl.id); if (idx < sc.slides.length - 1) [sc.slides[idx + 1], sc.slides[idx]] = [sc.slides[idx], sc.slides[idx + 1]]; }); }} className="w-7 h-7 grid place-items-center rounded-lg bg-black/70 text-white text-xs">↓</button>
                        <button onClick={(e) => { e.stopPropagation(); if (!confirm('Удалить лист?')) return; updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); sc.slides = sc.slides.filter((x) => x.id !== sl.id); }); const nxt = screen.slides.find((x) => x.id !== sl.id); if (nxt) { setActiveSlideId(nxt.id); setSelectedId(nxt.items[0]?.id || null); } }} className="w-7 h-7 grid place-items-center rounded-lg bg-red-600 text-white text-xs">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed text-amber-200">
                На ТВ открой <code className="bg-black/40 px-1.5 py-0.5 rounded">#/tv/{screen.id}</code> на весь экран. Ссылки:<br />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {store.screens.map((s) => <Link key={s.id} to={`/tv/${s.id}`} target="_blank" className="px-2 py-1 rounded-full bg-white text-zinc-900 font-bold text-[11px]">TV {s.id} ↗</Link>)}
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 min-w-0 p-6 flex flex-col gap-6 overflow-auto">
          {!slide ? <div className="flex-1 grid place-items-center text-zinc-500">Выбери лист слева</div> : (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Холст — тяни плашки как в Figma (16:9 = 1-в-1 с ТВ)</h3>
                  <div className="flex gap-2">
                    <button onClick={() => updateStore((d) => { const sl = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId); sl.items.push({ ...createEmptyItem(), x: 28, y: 42 }); setSelectedId(sl.items[sl.items.length - 1].id); })} className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 font-bold text-sm">+ Плашка</button>
                    <Link to={`/tv/${activeScreenId}`} target="_blank" className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">Открыть на ТВ</Link>
                  </div>
                </div>

                <CanvasStage
                  slide={slide}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onMoveItem={(id, x, y) => patchItem(id, { x, y })}
                  onResizeItem={(id, w, x) => patchItem(id, { w, x })}
                />
                <p className="text-xs text-zinc-500 mt-2">Куда поставил — там и на ТВ. Координаты в % сохраняются, поэтому на любом экране одинаково. Выделяй плашку на холсте или в списке справа.</p>
              </div>

              <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
                <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
                  <h4 className="font-semibold">Лист</h4>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">Название экрана</span>
                    <input value={screen.name} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).name = e.target.value; })} className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500" />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-widest uppercase text-zinc-400">Тип</span>
                      <select value={slide.type} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).type = e.target.value; })} className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
                        <option value="image">Фото</option>
                        <option value="video">Видео (MP4 muted)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-widest uppercase text-zinc-400">Длительность (сек)</span>
                      <input type="number" min={2} max={60} value={slide.duration} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).duration = Number(e.target.value) || 7; })} className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700" />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">Переход</span>
                    <select value={slide.transition} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).transition = e.target.value; })} className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700">
                      {TRANSITIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">{slide.type === 'video' ? 'Ссылка на MP4' : 'Ссылка на фото'}</span>
                    <input value={slide.bg} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).bg = e.target.value; })} placeholder="https://... или /my-photo.jpg" className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 outline-none" />
                    <span className="text-[11px] text-zinc-500">Кинь файл в <code className="bg-zinc-800 px-1 py-0.5 rounded">public/</code> и укажи <code className="bg-zinc-800 px-1 py-0.5 rounded">/file.jpg</code>. Видео MP4 H.264 1920×1080.</span>
                  </label>
                </section>

                <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Плашки — выбери на холсте</h4>
                    <span className="text-xs text-zinc-500">{slide.items.length} шт.</span>
                  </div>

                  {/* small list to select */}
                  <div className="flex flex-wrap gap-2">
                    {slide.items.map((it) => (
                      <button key={it.id} onClick={() => setSelectedId(it.id)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${selectedId === it.id ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'}`}>
                        {it.title || it.name || '—'} {selectedId === it.id ? '●' : ''}
                      </button>
                    ))}
                  </div>

                  {!selected ? (
                    <p className="text-sm text-zinc-500 py-6 text-center">Выбери плашку на холсте или нажми + Плашка</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl bg-zinc-800 border border-zinc-700 p-3 flex flex-col gap-3">
                        <input value={selected.title} onChange={(e) => patchItem(selected.id, { title: e.target.value })} placeholder="Заголовок" className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 outline-none font-semibold" />
                        <input value={selected.desc || ''} onChange={(e) => patchItem(selected.id, { desc: e.target.value })} placeholder="Описание (необязательно)" className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 outline-none text-sm" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={selected.price} onChange={(e) => patchItem(selected.id, { price: e.target.value })} placeholder="Цена" className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700" />
                          <button onClick={() => { if (!confirm('Удалить плашку?')) return; updateStore((d) => { const sl = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId); sl.items = sl.items.filter((x) => x.id !== selected.id); }); setSelectedId(slide.items.find((x) => x.id !== selected.id)?.id || null); }} className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold">Удалить</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <label className="flex flex-col gap-1">X
                            <input type="range" min={0} max={88} step={0.5} value={selected.x} onChange={(e) => patchItem(selected.id, { x: Number(e.target.value) })} />
                            <span className="text-zinc-400 font-mono">{selected.x.toFixed(1)}%</span>
                          </label>
                          <label className="flex flex-col gap-1">Y
                            <input type="range" min={0} max={88} step={0.5} value={selected.y} onChange={(e) => patchItem(selected.id, { y: Number(e.target.value) })} />
                            <span className="text-zinc-400 font-mono">{selected.y.toFixed(1)}%</span>
                          </label>
                          <label className="flex flex-col gap-1">Ширина
                            <input type="range" min={14} max={88} value={selected.w} onChange={(e) => patchItem(selected.id, { w: Number(e.target.value) })} />
                            <span className="text-zinc-400 font-mono">{selected.w.toFixed(0)}%</span>
                          </label>
                        </div>
                      </div>

                      {/* Figma-like style panel */}
                      <div className="rounded-xl bg-zinc-800 border border-zinc-700 p-3 flex flex-col gap-3">
                        <div className="text-xs font-semibold tracking-widest uppercase text-zinc-400">Стиль как в Figma</div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1 text-xs">Фон
                            <input type="color" value={selected.style.bg} onChange={(e) => patchStyle(selected.id, { bg: e.target.value })} className="h-9 w-full rounded-lg bg-transparent border border-zinc-700 p-1" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs">Цена — фон
                            <input type="color" value={selected.style.priceBg} onChange={(e) => patchStyle(selected.id, { priceBg: e.target.value })} className="h-9 w-full rounded-lg bg-transparent border border-zinc-700 p-1" />
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1 text-xs">Текст
                            <input type="color" value={selected.style.textColor} onChange={(e) => patchStyle(selected.id, { textColor: e.target.value })} className="h-9 w-full rounded-lg bg-transparent border border-zinc-700 p-1" />
                          </label>
                          <label className="flex flex-col gap-1 text-xs">Цена — текст
                            <input type="color" value={selected.style.priceColor} onChange={(e) => patchStyle(selected.id, { priceColor: e.target.value })} className="h-9 w-full rounded-lg bg-transparent border border-zinc-700 p-1" />
                          </label>
                        </div>

                        <label className="flex flex-col gap-1 text-xs">Прозрачность фона — {Math.round(selected.style.bgOpacity * 100)}%
                          <input type="range" min={0} max={1} step={0.02} value={selected.style.bgOpacity} onChange={(e) => patchStyle(selected.id, { bgOpacity: Number(e.target.value) })} />
                          <span className="h-2 rounded-full border border-zinc-700 block" style={{ background: hexToRgba(selected.style.bg, selected.style.bgOpacity), backdropFilter: `blur(${selected.style.blur}px)` }} />
                        </label>

                        <label className="flex flex-col gap-1 text-xs">Блюр за плашкой — {selected.style.blur}px
                          <input type="range" min={0} max={24} step={1} value={selected.style.blur} onChange={(e) => patchStyle(selected.id, { blur: Number(e.target.value) })} />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex flex-col gap-1 text-xs">Скругление — {selected.style.radius}px
                            <input type="range" min={0} max={32} step={1} value={selected.style.radius} onChange={(e) => patchStyle(selected.id, { radius: Number(e.target.value) })} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs">Граница — {Math.round(selected.style.borderOpacity * 100)}%
                            <input type="range" min={0} max={1} step={0.05} value={selected.style.borderOpacity} onChange={(e) => patchStyle(selected.id, { borderOpacity: Number(e.target.value) })} />
                          </label>
                        </div>

                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={selected.style.shadow} onChange={(e) => patchStyle(selected.id, { shadow: e.target.checked })} />
                          Тень
                        </label>

                        <div className="flex gap-2">
                          <button onClick={() => patchItem(selected.id, { x: 6, y: 68, w: 36 })} className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-700 text-xs hover:bg-zinc-600">Сбросить позицию</button>
                          <button onClick={() => { const c = structuredClone(selected); c.id = uid(); c.x = Math.min(70, c.x + 4); c.y = Math.min(78, c.y + 4); updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.push(c); }); setSelectedId(c.id); }} className="flex-1 px-3 py-1.5 rounded-xl bg-white text-zinc-900 font-semibold text-xs">Дублировать</button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
                <div className="text-sm text-zinc-400">Сохранение автоматическое. Клиенту дашь только ссылку <code className="bg-zinc-800 px-1.5 py-0.5 rounded">#/admin</code>.</div>
                <button onClick={() => { saveStore(store); alert('Сохранено! На ТВ обновится за 2 сек.'); }} className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-900 font-bold hover:bg-emerald-400">Сохранить</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
