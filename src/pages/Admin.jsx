import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadStore, saveStore, resetStore, TRANSITIONS } from '../lib/store';

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function Admin() {
  const [store, setStore] = useState(() => loadStore());
  const [activeScreenId, setActiveScreenId] = useState(store.screens[0]?.id);
  const [activeSlideId, setActiveSlideId] = useState(store.screens[0]?.slides[0]?.id);

  useEffect(() => { saveStore(store); }, [store]);

  const screen = store.screens.find((s) => s.id === activeScreenId);
  const slide = screen?.slides.find((s) => s.id === activeSlideId);

  function updateStore(fn) {
    setStore((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#0f0f10] text-zinc-100 flex flex-col">
      {/* header */}
      <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cafe Menu Board — Админка</h1>
            <p className="text-xs text-zinc-400">Поменял → нажал Сохранить → через 2 сек на ТВ обновилось. Нон-стоп, без перерендера видео.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { const s = resetStore(); setStore(s); setActiveScreenId(s.screens[0].id); setActiveSlideId(s.screens[0].slides[0].id); }} className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm border border-zinc-700">Сбросить демо</button>
            <Link to={`/tv/${activeScreenId}`} target="_blank" className="px-4 py-2 rounded-xl bg-white text-zinc-900 font-semibold text-sm hover:bg-zinc-100">Открыть ТВ ▶</Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto w-full flex flex-1 min-h-0">
        {/* left: screens + slides */}
        <aside className="w-[320px] shrink-0 border-r border-zinc-800 p-4 flex flex-col gap-4 bg-zinc-900/30">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Экраны</h2>
              <button
                onClick={() => updateStore((d) => {
                  const id = 'tv' + (d.screens.length + 1);
                  d.screens.push({ id, name: `Экран ${d.screens.length + 1}`, slides: [{ id: uid(), type: 'image', bg: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=1920', duration: 7, transition: 'fade', items: [{ id: uid(), name: 'Новое блюдо', price: '300 ₽', w: 88 }] }] });
                })}
                className="text-xs px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
              >+ Экран</button>
            </div>
            <div className="flex flex-col gap-2">
              {store.screens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveScreenId(s.id); setActiveSlideId(s.slides[0]?.id); }}
                  className={`text-left px-3 py-3 rounded-xl border flex items-center justify-between ${activeScreenId === s.id ? 'bg-white text-zinc-900 border-white' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
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
                <button
                  onClick={() => updateStore((d) => {
                    const sc = d.screens.find((x) => x.id === activeScreenId);
                    const ns = { id: uid(), type: 'image', bg: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1920', duration: 7, transition: 'fade', items: [{ id: uid(), name: 'Блюдо', price: '0 ₽', w: 88 }] };
                    sc.slides.push(ns);
                    setActiveSlideId(ns.id);
                  })}
                  className="text-xs px-2 py-1 rounded-lg bg-white text-zinc-900 font-semibold hover:bg-zinc-100"
                >+ Лист</button>
              </div>

              <div className="flex flex-col gap-2 overflow-auto pr-1">
                {screen.slides.map((sl, i) => (
                  <div key={sl.id} onClick={() => setActiveSlideId(sl.id)} className={`group relative rounded-xl overflow-hidden border cursor-pointer ${activeSlideId === sl.id ? 'border-white ring-2 ring-white/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="h-[110px] bg-zinc-800 relative">
                      {sl.type === 'video' ? (
                        <video src={sl.bg} muted className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <img src={sl.bg} alt="" className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold bg-black/60 backdrop-blur px-2 py-1 rounded-full text-white">#{i + 1} • {sl.transition} • {sl.duration}с • {sl.type}</span>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); const idx = sc.slides.findIndex((x) => x.id === sl.id); if (idx > 0) [sc.slides[idx - 1], sc.slides[idx]] = [sc.slides[idx], sc.slides[idx - 1]]; }); }}
                          className="w-7 h-7 grid place-items-center rounded-lg bg-black/70 text-white text-xs">↑</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); const idx = sc.slides.findIndex((x) => x.id === sl.id); if (idx < sc.slides.length - 1) [sc.slides[idx + 1], sc.slides[idx]] = [sc.slides[idx], sc.slides[idx + 1]]; }); }}
                          className="w-7 h-7 grid place-items-center rounded-lg bg-black/70 text-white text-xs">↓</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (!confirm('Удалить лист?')) return; updateStore((d) => { const sc = d.screens.find((x) => x.id === activeScreenId); sc.slides = sc.slides.filter((x) => x.id !== sl.id); }); setActiveSlideId(screen.slides.find((x) => x.id !== sl.id)?.id); }}
                          className="w-7 h-7 grid place-items-center rounded-lg bg-red-600 text-white text-xs">✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs leading-relaxed text-amber-200">
                <b>Подсказка:</b> На каждом ТВ открой <code className="bg-black/40 px-1.5 py-0.5 rounded">/tv/{screen.id}</code> в браузере ТВ на полный экран. Ссылки:<br />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {store.screens.map((s) => (
                    <Link key={s.id} to={`/tv/${s.id}`} target="_blank" className="px-2 py-1 rounded-full bg-white text-zinc-900 font-bold text-[11px]">TV {s.id} ↗</Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* center: editor */}
        <main className="flex-1 min-w-0 p-6 flex flex-col gap-6 overflow-auto">
          {!slide ? (
            <div className="flex-1 grid place-items-center text-zinc-500">Выбери лист слева</div>
          ) : (
            <>
              {/* preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Превью (как на ТВ 16:9)</h3>
                  <div className="flex gap-2">
                    <Link to={`/tv/${activeScreenId}`} target="_blank" className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm hover:bg-zinc-700">Открыть на ТВ</Link>
                  </div>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
                  {slide.type === 'video' ? (
                    <video src={slide.bg} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <img src={slide.bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 p-[2.5%] flex flex-col justify-end">
                    <div className="flex gap-3 flex-wrap">
                      {slide.items.map((it) => (
                        <div key={it.id} className="backdrop-blur-[12px] bg-white/85 rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-xl border border-white/50" style={{ flexBasis: `${it.w}%`, flexGrow: 1, minWidth: 220 }}>
                          <span className="font-semibold text-zinc-900">{it.name}</span>
                          <span className="font-extrabold bg-zinc-900 text-white px-3 py-1 rounded-full text-sm">{it.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Плашки — <b>glass</b> с <code>backdrop-blur + полупрозрачный белый</code>: размывают фото позади, читаются на любом фоне. Это то, что ты просил.</p>
              </div>

              {/* controls */}
              <div className="grid lg:grid-cols-2 gap-6">
                <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
                  <h4 className="font-semibold">Лист</h4>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">Название экрана</span>
                    <input
                      value={screen.name}
                      onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).name = e.target.value; })}
                      className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-zinc-500"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-widest uppercase text-zinc-400">Тип</span>
                      <select
                        value={slide.type}
                        onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).type = e.target.value; })}
                        className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
                      >
                        <option value="image">Фото</option>
                        <option value="video">Видео (MP4, автоплей muted)</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs tracking-widest uppercase text-zinc-400">Длительность (сек)</span>
                      <input type="number" min={2} max={60} value={slide.duration} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).duration = Number(e.target.value) || 7; })} className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700" />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">Переход к следующему листу</span>
                    <select
                      value={slide.transition}
                      onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).transition = e.target.value; })}
                      className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700"
                    >
                      {TRANSITIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-zinc-400">{slide.type === 'video' ? 'Ссылка на MP4 (или загрузи файл в /public)' : 'Ссылка на фото (или загрузи в /public)'}</span>
                    <input value={slide.bg} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).bg = e.target.value; })} placeholder="https://... или /my-photo.jpg" className="px-3 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 outline-none" />
                    <span className="text-[11px] text-zinc-500">Для локальных файлов кинь JPG/MP4 в папку <code className="bg-zinc-800 px-1 py-0.5 rounded">public/</code> и укажи <code className="bg-zinc-800 px-1 py-0.5 rounded">/file.jpg</code>. Видео: MP4 H.264, 1920×1080, до 15 сек.</span>
                  </label>

                  <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-3 text-xs leading-relaxed text-sky-200">
                    <b>Видео автоплей:</b> на ТВ видео стартует само только если <code className="bg-black/30 px-1 rounded">muted</code>. Звук — только после одного клика пультом (ограничение браузеров). Для кафе лучше без звука.
                  </div>
                </section>

                <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Плашки (блюда/цены)</h4>
                    <button
                      onClick={() => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.push({ id: uid(), name: 'Новое блюдо', price: '0 ₽', w: 88 }); })}
                      className="px-3 py-1.5 rounded-xl bg-white text-zinc-900 font-semibold text-sm"
                    >+ Плашка</button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[420px] overflow-auto pr-1">
                    {slide.items.map((it) => (
                      <div key={it.id} className="rounded-xl bg-zinc-800 border border-zinc-700 p-3 flex flex-col gap-3">
                        <div className="grid grid-cols-[1fr_auto] gap-2">
                          <input value={it.name} onChange={(e) => updateStore((d) => { const item = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.find((x) => x.id === it.id); item.name = e.target.value; })} placeholder="Название" className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 outline-none" />
                          <button onClick={() => updateStore((d) => { const sl = d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId); sl.items = sl.items.filter((x) => x.id !== it.id); })} className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm">Удалить</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={it.price} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.find((x) => x.id === it.id).price = e.target.value; })} placeholder="Цена" className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700" />
                          <label className="flex items-center gap-2 text-xs text-zinc-400">
                            Ширина
                            <input type="range" min={20} max={100} value={it.w} onChange={(e) => updateStore((d) => { d.screens.find((x) => x.id === activeScreenId).slides.find((x) => x.id === activeSlideId).items.find((x) => x.id === it.id).w = Number(e.target.value); })} className="flex-1" />
                            <span className="w-10 text-right text-zinc-200">{it.w}%</span>
                          </label>
                        </div>
                      </div>
                    ))}
                    {slide.items.length === 0 && <p className="text-sm text-zinc-500">Добавь хотя бы одну плашку</p>}
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs leading-relaxed text-zinc-300">
                    <b>Как сделать красиво:</b> не больше 3 плашек на лист, ширина 28–42% для нескольких, 88% для одной. Они автоматически <b>размывают фон</b> за собой (<code className="bg-zinc-800 px-1 rounded">backdrop-blur</code>), поэтому читаются на любом фото.
                  </div>
                </section>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
                <div className="text-sm text-zinc-400">Изменения сохраняются автоматически (localStorage). Позже подключим Supabase — будет синхронизация между устройствами.</div>
                <button
                  onClick={() => { saveStore(store); alert('Сохранено! Открой /tv/' + activeScreenId + ' на телевизоре — обновится за 2 сек.'); }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-900 font-bold hover:bg-emerald-400"
                >Сохранить</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
