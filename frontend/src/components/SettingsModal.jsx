import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function SettingsModal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="glass-strong relative w-full max-w-lg rounded-2xl p-5 neon-border"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-lg gradient-text">{title}</div>
          <button onClick={onClose} className="btn-ghost" aria-label="Close">
            <X size={14} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
