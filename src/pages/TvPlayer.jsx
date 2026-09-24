import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { loadStore } from '../lib/store';
import GlassPill from '../components/GlassPill';

const variants = {
  fade: {
    initial: { opacity: 0, scale: 1.04, filter: 'blur(6px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.98, filter: 'blur(6px)' },
  },
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-30%', opacity: 0 },
  },
  zoom: {
    initial: { scale: 1.25, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
  },
  blinds: {
    initial: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    animate: { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
    exit: { clipPath: 'inset(0 0 0 100%)', opacity: 0 },
  },
  cube: {
    initial: { rotateY: 90, opacity: 0, transformOrigin: 'right center' },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0, transformOrigin: 'left center' },
  },
  pixel: {
    initial: { opacity: 0, filter: 'blur(10px) contrast(1.5)' },
    animate: { opacity: 1, filter: 'blur(0px) contrast(1)' },
    exit: { opacity: 0, filter: 'blur(12px)' },
  },
};

function Slide({ slide }) {
  const isVideo = slide.type === 'video';
  return (
    <motion.div
      key={slide.id}
      variants={variants[slide.transition] || variants.fade}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 overflow-hidden bg-black"
      style={{ perspective: 1200 }}
    >
      {/* bg */}
      {isVideo ? (
        <video
          src={slide.bg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <motion.img
          src={slide.bg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: slide.duration + 1, ease: 'linear' }}
        />
      )}
      {/* subtle vignette for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

      {/* glass pills overlay */}
      <div className="absolute inset-0 p-[3.5vw] flex flex-col justify-end">
        <div className="flex gap-4 flex-wrap items-end">
          {slide.items?.map((item, idx) => (
            <div
              key={item.id}
              style={{ flexBasis: `${item.w}%`, flexGrow: 1, minWidth: 280 }}
            >
              <GlassPill item={item} index={idx} />
            </div>
          ))}
        </div>
      </div>

      {/* ken burns micro on bg already, items stagger already */}
    </motion.div>
  );
}

export default function TvPlayer() {
  const { id } = useParams();
  const [store, setStore] = useState(() => loadStore());
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const screen = store.screens.find((s) => s.id === id) || store.screens[0];
  const slides = screen?.slides?.length ? screen.slides : [];

  // live sync: poll localStorage timestamp + storage event
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key?.startsWith('cafe-menu')) setStore(loadStore());
    };
    window.addEventListener('storage', onStorage);
    const iv = setInterval(() => setStore(loadStore()), 2000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv); };
  }, []);

  // reset idx when screen changes
  useEffect(() => { setIdx(0); }, [id, screen?.id]);

  // autoplay loop
  useEffect(() => {
    if (!slides.length) return;
    const dur = (slides[idx]?.duration || 7) * 1000;
    timerRef.current = setTimeout(() => {
      setIdx((v) => (v + 1) % slides.length);
    }, dur);
    return () => clearTimeout(timerRef.current);
  }, [idx, slides]);

  // keep screen awake + fullscreen hint
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIdx((v) => (v + 1) % slides.length);
      if (e.key === 'ArrowLeft') setIdx((v) => (v - 1 + slides.length) % slides.length);
      if (e.key === 'f' || e.key === 'F') document.documentElement.requestFullscreen?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  if (!slides.length) {
    return <div className="w-screen h-screen grid place-items-center text-white/60">Нет слайдов — добавь в /admin</div>;
  }

  const current = slides[idx];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative select-none">
      {/* top bar for setup */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 py-2 bg-black/35 backdrop-blur text-white/80 text-xs tracking-wide">
        <span>{screen.name} • {idx + 1} / {slides.length} • {current.transition} • {current.duration}с</span>
        <span className="opacity-60">← → листать • F фуллскрин • Открой /admin для редактирования</span>
      </div>

      <div className="absolute inset-0 pt-8" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait" initial={false}>
          <Slide key={current.id + idx} slide={current} />
        </AnimatePresence>
      </div>

      {/* progress dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-8 bg-white' : 'w-5 bg-white/35'}`} />
        ))}
      </div>

      {/* subtle reload each hour for kiosk stability */}
      <ReloadEachHour />
    </div>
  );
}

function ReloadEachHour() {
  useEffect(() => {
    const iv = setInterval(() => window.location.reload(), 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);
  return null;
}
