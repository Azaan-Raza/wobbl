import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ toast }) {
  const assertive = toast?.type === 'error';
  return (
    // Persistent live region: it must already exist (empty) before its content
    // changes, or screen readers won't reliably announce the toast.
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex justify-center px-4"
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`pointer-events-auto rounded-full px-5 py-3 text-sm font-medium shadow-float ${
              toast.type === 'error' ? 'bg-white text-[#B3261E] ring-1 ring-[#B3261E]/30' : 'bg-graphite text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
