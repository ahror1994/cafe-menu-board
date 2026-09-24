import { motion } from 'framer-motion';

export default function GlassPill({ item, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.25 + index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="backdrop-blur-[14px] bg-white/[0.82] rounded-[20px] px-6 py-4 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-white/50"
    >
      <span className="text-[22px] font-semibold tracking-tight text-zinc-900 leading-none">
        {item.name}
      </span>
      <span className="ml-4 text-[22px] font-extrabold text-zinc-900 bg-zinc-900 text-white px-4 py-1.5 rounded-full whitespace-nowrap">
        {item.price}
      </span>
    </motion.div>
  );
}
