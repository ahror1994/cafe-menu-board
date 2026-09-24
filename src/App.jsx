import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Admin from './pages/Admin';
import TvPlayer from './pages/TvPlayer';

function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white grid place-items-center p-6">
      <div className="max-w-[640px] w-full rounded-[24px] bg-zinc-900 border border-zinc-800 p-8 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Cafe Menu Board</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Живое меню для ТВ без перерендера видео. Админка → правишь цены/фото → на ТВ обновляется за 2 сек.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/admin" className="px-5 py-3 rounded-xl bg-white text-zinc-900 font-bold">Открыть админку → /admin</Link>
          <Link to="/tv/tv1" className="px-5 py-3 rounded-xl bg-zinc-800 border border-zinc-700 font-semibold">Плеер ТВ1 → /tv/tv1</Link>
        </div>
        <div className="flex gap-2 text-xs pt-2">
          <Link to="/tv/tv1" className="px-3 py-1.5 rounded-full bg-white text-zinc-900 font-bold">TV1</Link>
          <Link to="/tv/tv2" className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">TV2</Link>
          <Link to="/tv/tv3" className="px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">TV3</Link>
        </div>
        <p className="text-[11px] text-zinc-500">На телевизоре открой <code className="bg-zinc-800 px-1.5 py-0.5 rounded">/tv/tv1</code> на полный экран (F). Видео — muted автоплей, иначе нужен один клик.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/tv/:id" element={<TvPlayer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
