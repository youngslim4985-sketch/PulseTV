/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Home, Search as SearchIcon, Play, Tv, Trophy, Film, 
  Settings, User, Info, Wifi 
} from "lucide-react";
import ContentRow from "./components/ContentRow";
import SportsPlayer from "./components/SportsPlayer";
import SearchScreen from "./components/SearchScreen";
import { ContentData, ContentItem, View } from "./types";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [data, setData] = useState<ContentData | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (item: ContentItem) => {
    setSelectedItem(item);
    setView("player");
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "search", icon: SearchIcon, label: "Search" },
    { id: "shows", icon: Tv, label: "Live TV" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "sports", icon: Trophy, label: "Sports" },
  ];

  if (!data) return (
    <div className="h-screen bg-roku-dark flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-roku-purple border-t-roku-gold rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex bg-roku-dark overflow-hidden select-none relative">
      {/* Immersive radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b0a64_0%,transparent_60%)] opacity-40 pointer-events-none"></div>

      {/* Side Navigation */}
      <nav className="w-24 h-full bg-roku-sidebar border-r border-white/5 flex flex-col items-center py-10 z-20">
        <div className="flex flex-col items-center gap-12 w-full">
          {/* Logo */}
          <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <span className="font-black text-xl italic">R</span>
          </div>

          <ul className="flex flex-col gap-10">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id === "search" ? "search" : "home")}
                  className={`p-2 transition-all duration-200 group relative
                    ${view === item.id ? 'text-purple-400 opacity-100' : 'text-white opacity-40 hover:opacity-100'}`}
                >
                  <item.icon className="w-6 h-6" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto mb-4">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono tracking-[0.2em] text-white/40 uppercase">Roku Web Streamer v1.0.4</span>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-xs font-mono text-green-400">SERVER: {currentTime.getSeconds() % 2 === 0 ? "192.168.1.52:3000" : "AIS-DEV-SERVER:3000"}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-white/30">Current Bandwidth</div>
              <div className="text-xs font-mono">58.4 Mbps (720p Floor)</div>
            </div>
            <div className="text-right border-l border-white/10 pl-6">
              <div className="text-xl font-display font-bold text-white">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest">{currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </header>

        {/* Hero Banner Area */}
        <div className="flex-1 px-10 flex flex-col justify-center relative pb-32">
          {data.sports.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 uppercase text-white">
                  <span className="animate-pulse">●</span> Live
                </div>
                <span className="text-sm text-white/60 tracking-wider uppercase">Formula 1 Monaco GP</span>
              </div>
              <h1 className="text-7xl font-display font-bold tracking-tight max-w-3xl leading-[0.9] text-white">PORTUGAL VS FRANCE</h1>
              <p className="max-w-xl text-lg text-white/50 leading-relaxed font-light italic">
                Experience high-fidelity streaming from Estádio da Luz. High-bitrate stream enabled via ABR SportsPlayer. Auto-bookmarking active every 10s.
              </p>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleSelect(data.sports[0])}
                  className="px-10 py-4 bg-white text-black font-bold text-sm uppercase tracking-[0.2em] hover:bg-roku-gold transition-colors focus:ring-4 ring-white/20 outline-none"
                >
                  Watch Now
                </button>
                <button className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/10 font-bold text-sm uppercase tracking-[0.2em] hover:bg-white/20 transition-colors text-white">
                  Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Architecture Logs Overlay */}
        <div className="absolute top-24 right-10 w-64 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl z-30 hidden lg:block">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-3">System Metrics</div>
          <div className="space-y-3 font-mono text-[9px]">
            <div className="flex justify-between items-center text-white">
              <span className="text-blue-400">DataLoader.brs</span>
              <span className="text-green-500">SUCCESS</span>
            </div>
            <div className="flex justify-between items-center text-white">
              <span className="text-blue-400">SportsPlayer.brs</span>
              <span className="text-green-500">OPTIMAL</span>
            </div>
            <div className="flex justify-between items-center text-white">
              <span className="text-blue-400">Registry.brs</span>
              <span className="text-white/40">SYNCED</span>
            </div>
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="text-white/60 mb-1">Deep Linking Payload:</div>
              <div className="bg-white/5 p-2 rounded text-[8px] text-white/40 leading-tight">
                contentId: "pts_fra_2024"<br/>
                mediaType: "live_sports"
              </div>
            </div>
          </div>
        </div>

        {/* Categories / Rows at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-72 pt-4 bg-linear-to-t from-roku-dark via-roku-dark/95 to-transparent z-20 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <ContentRow title="Live Now in Sports" items={data.sports} onSelect={handleSelect} />
            <ContentRow title="Featured Movies" items={data.movies} onSelect={handleSelect} />
            <ContentRow title="Channel Guide" items={data.live_tv} onSelect={handleSelect} />
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {view === "search" && (
          <SearchScreen onClose={() => setView("home")} onSelect={handleSelect} />
        )}
        {view === "player" && selectedItem && (
          <SportsPlayer item={selectedItem} onClose={() => setView("home")} />
        )}
      </AnimatePresence>
    </div>
  );
}
