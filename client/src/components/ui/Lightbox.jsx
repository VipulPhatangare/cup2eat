import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

// item = { src, alt, caption } | null
export default function Lightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/85 p-4"
          onClick={onClose} role="dialog" aria-modal="true" aria-label={item.alt || 'Photo'}
        >
          <button onClick={onClose} aria-label="Close photo" className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="size-6" />
          </button>
          <motion.figure initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }} className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={item.src} alt={item.alt || ''} className="max-h-[80svh] w-auto max-w-full rounded-2xl object-contain" />
            {item.caption && <figcaption className="mt-3 text-center text-sm text-white/80">{item.caption}</figcaption>}
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
