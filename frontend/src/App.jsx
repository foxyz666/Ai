import { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";
import ToastHost from "./components/ToastHost.jsx";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import History from "./pages/History.jsx";
import Settings from "./pages/Settings.jsx";
import About from "./pages/About.jsx";
import { useChatStore } from "./store/chats.js";
import { useUIStore } from "./store/ui.js";

export default function App() {
  const hydrate = useChatStore((s) => s.hydrate);
  const hydrateUI = useUIStore((s) => s.hydrate);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  useEffect(() => {
    hydrate();
    hydrateUI();
  }, [hydrate, hydrateUI]);

  return (
    <div className="relative z-10 flex h-screen w-screen overflow-hidden text-slate-100">
      <Sidebar />
      <div
        className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-16"
        }`}
      >
        <Navbar />
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chat/:id?" element={<Chat />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
