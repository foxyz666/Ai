import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

import { useUIStore } from "../store/ui.js";

const iconFor = (kind) => {
  switch (kind) {
    case "success":
      return CheckCircle2;
    case "error":
      return AlertTriangle;
    default:
      return Info;
  }
};

const colorFor = (kind) => {
  switch (kind) {
    case "success":
      return "border-emerald-400/30 text-emerald-300";
    case "error":
      return "border-red-400/30 text-red-300";
    default:
      return "border-neon-blue/30 text-neon-blue";
  }
};

export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = iconFor(t.kind);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20, y: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto glass rounded-xl border ${colorFor(t.kind)} p-3 shadow-glass`}
            >
              <div className="flex items-start gap-2">
                <Icon size={16} className="mt-0.5" />
                <div className="min-w-0 flex-1 text-sm text-slate-200">{t.message}</div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-slate-400 hover:text-white transition"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
