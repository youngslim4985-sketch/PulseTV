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
import ProfilePicker from "./components/ProfilePicker";
import LeagueTabs from "./components/LeagueTabs";
import { ContentData, ContentItem, View, Profile } from "./types";
import { getRecommendations } from "./services/recommendationService";

const DEFAULT_PROFILES: Profile[] = [
  { id: "p1", name: "Guest", avatar: "bg-purple-600", favorites: [], resumePositions: {} },
  { id: "p2", name: "Kids", avatar: "bg-blue-500", favorites: [], resumePositions: {} },
];

export default function App() {
  const [view, setView] = useState<View>("profiles");
  const [data, setData] = useState<ContentData | null>(null);
  const [recommendations, setRecommendations] = useState<ContentItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<ContentItem[]>([]);
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Sport specific state
  const [activeSport, setActiveSport] = useState<"Basketball" | "Soccer">("Basketball");
  const [activeLeague, setActiveLeague] = useState<string>("All Basketball");
  const [myList, setMyList] = useState<ContentItem[]>([]);

  // Profile state
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/content")
      .then(res => res.json())
      .then(setData)
      .catch(console.error);

    // Load profiles
    const savedProfiles = localStorage.getItem("roku-profiles");
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }

    // Load active profile
    const savedActiveId = localStorage.getItem("roku-active-profile-id");
    if (savedActiveId && savedProfiles) {
      const allProfiles = JSON.parse(savedProfiles) as Profile[];
      const found = allProfiles.find(p => p.id === savedActiveId);
      if (found) {
        handleProfileSelect(found);
      }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync recommendations whenever data or activeProfile/history changes
  useEffect(() => {
    if (data && activeProfile) {
      const recs = getRecommendations(data, viewingHistory);
      setRecommendations(recs);

      // Calculate recently watched
      const bbItems = data.basketball ? Object.values(data.basketball).flat() : [];
      const soccerItems = data.soccer ? Object.values(data.soccer).flat() : [];
      const allContent = [...data.movies, ...data.sports, ...data.live_tv, ...bbItems, ...soccerItems];
      const recent = viewingHistory
        .map(id => allContent.find(item => item.id === id))
        .filter((item): item is ContentItem => !!item)
        .slice(0, 10);
      setRecentlyWatched(recent);

      // Calculate My List
      const favoriteItems = (activeProfile.favorites || [])
        .map(id => allContent.find(item => item.id === id))
        .filter((item): item is ContentItem => !!item);
      setMyList(favoriteItems);
    }
  }, [data, activeProfile, viewingHistory]);

  const handleProfileSelect = (profile: Profile) => {
    setActiveProfile(profile);
    localStorage.setItem("roku-active-profile-id", profile.id);
    
    // Load history for this specific profile
    const savedHistory = localStorage.getItem(`roku-history-${profile.id}`);
    if (savedHistory) {
      setViewingHistory(JSON.parse(savedHistory));
    } else {
      setViewingHistory([]);
    }
    
    setView("home");
  };

  const handleAddProfile = () => {
    const name = prompt("Enter profile name:");
    if (name) {
      const newProfile: Profile = {
        id: `p-${Date.now()}`,
        name,
        avatar: ["bg-red-500", "bg-green-500", "bg-yellow-500", "bg-pink-500"][Math.floor(Math.random() * 4)],
        favorites: [],
        resumePositions: {}
      };
      const updated = [...profiles, newProfile];
      setProfiles(updated);
      localStorage.setItem("roku-profiles", JSON.stringify(updated));
    }
  };

  const toggleFavorite = (itemId: string) => {
    if (!activeProfile) return;
    
    const isFavorite = activeProfile.favorites.includes(itemId);
    const updatedFavorites = isFavorite 
      ? activeProfile.favorites.filter(id => id !== itemId)
      : [...activeProfile.favorites, itemId];
    
    const updatedProfile = { ...activeProfile, favorites: updatedFavorites };
    setActiveProfile(updatedProfile);
    
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    localStorage.setItem("roku-profiles", JSON.stringify(updatedProfiles));
  };

  const updateResumePosition = (itemId: string, seconds: number) => {
    if (!activeProfile) return;
    
    const updatedPositions = { ...activeProfile.resumePositions, [itemId]: seconds };
    const updatedProfile = { ...activeProfile, resumePositions: updatedPositions };
    
    setActiveProfile(updatedProfile);
    
    const updatedProfiles = profiles.map(p => p.id === activeProfile.id ? updatedProfile : p);
    setProfiles(updatedProfiles);
    localStorage.setItem("roku-profiles", JSON.stringify(updatedProfiles));
  };

  const handleSelect = (item: ContentItem) => {
    if (!activeProfile) return;
    setSelectedItem(item);
    setView("player");

    // Update history for active profile
    const newHistory = [item.id, ...viewingHistory.filter(id => id !== item.id)].slice(0, 50);
    setViewingHistory(newHistory);
    localStorage.setItem(`roku-history-${activeProfile.id}`, JSON.stringify(newHistory));
  };

  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "shows", icon: Tv, label: "Live TV" },
    { id: "movies", icon: Film, label: "Movies" },
    { id: "sports", icon: Trophy, label: "Sports" },
    { id: "search", icon: SearchIcon, label: "Search" },
  ];

  if (!data) return (
    <div className="h-screen bg-apple-midnight flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-apple-midnight overflow-hidden select-none relative">
      {/* Immersive radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e3a8a_0%,transparent_70%)] opacity-30 pointer-events-none"></div>

      {/* Top Navigation Bar (Apple TV Style) */}
      <nav className="h-24 px-12 flex items-center justify-between z-30 fixed top-0 left-0 right-0 glass border-none bg-apple-midnight/40 blur-none">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 text-white">
            <span className="font-black text-xl italic tracking-tighter"></span>
          </div>

          <ul className="flex items-center gap-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id === "search" ? "search" : "home")}
                  className={`px-6 py-2 rounded-full font-display font-bold text-sm tracking-wide transition-all duration-300
                    ${view === item.id && item.id !== 'search' ? 'bg-white text-black scale-105' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-display font-medium text-white/40 tracking-widest uppercase">tv+</div>
            </div>
            
            <button 
              onClick={() => setView("profiles")}
              className="flex items-center gap-4 hover:scale-105 transition-transform"
            >
              <div className={`w-11 h-11 rounded-full ${activeProfile?.avatar || "bg-zinc-800"} flex items-center justify-center shadow-2xl border-2 border-white/10`}>
                 <User className="w-5 h-5 text-white/80" />
              </div>
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 pt-24 overflow-hidden">
        {/* Secondary Header / Stats */}
        <div className="h-12 flex items-center justify-between px-16 relative z-10">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/30 uppercase">Dolby Vision • Atmos • 4K</span>
            <div className="h-3 w-px bg-white/10"></div>
            <span className="text-[10px] font-mono text-apple-blue font-bold tracking-widest">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-widest">
            <Wifi className="w-3 h-3" />
            Gigabit Connection
          </div>
        </div>

        {/* Cinematic Hero Area */}
        <div className="flex-1 px-16 flex flex-col justify-center relative pb-40">
          {(activeLeague === "All Basketball" || activeLeague === "NBA") && data.basketball?.["NBA"]?.[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold border border-white/10 tracking-[0.2em] uppercase text-white/80">
                  Global Basketball Spotlight
                </div>
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  Live EuroLeague
                </div>
              </div>
              <h1 className="text-8xl font-display font-extrabold tracking-tight max-w-4xl leading-[0.85] text-white">
                EUROPEAN  HOOPS
              </h1>
              <p className="max-w-2xl text-xl text-white/40 leading-relaxed font-medium">
                From Madrid to Istanbul. Experience the intensity of European basketball in stunning 4K.
              </p>
              <div className="flex gap-6 pt-6">
                <button 
                  onClick={() => handleSelect(data.basketball?.["EuroLeague"]?.[0] || data.sports[0])}
                  className="px-12 py-5 bg-white text-black font-display font-black text-sm uppercase tracking-[0.2em] rounded-xl hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-white/20"
                >
                  Watch EuroLeague
                </button>
                <button 
                  onClick={() => {
                    const heroItem = data.basketball?.["EuroLeague"]?.[0] || data.sports[0];
                    if (heroItem) toggleFavorite(heroItem.id);
                  }}
                  className={`px-12 py-5 rounded-xl font-display font-black text-sm uppercase tracking-[0.2em] transition-all
                    ${activeProfile?.favorites.includes(data.basketball?.["EuroLeague"]?.[0]?.id || data.sports[0].id)
                      ? 'bg-apple-blue text-white shadow-[0_0_40px_rgba(0,122,255,0.4)]'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10'}`}
                >
                  {activeProfile?.favorites.includes(data.basketball?.["EuroLeague"]?.[0]?.id || data.sports[0].id) 
                    ? 'In My List' 
                    : 'Add to My List'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Shelves (Rows) at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-96 pt-8 bg-linear-to-t from-apple-midnight via-apple-midnight/90 to-transparent z-20 overflow-y-auto no-scrollbar">
          <div className="space-y-8 pb-12">
            {view === "home" && (
              <>
                <div className="flex px-16 gap-4 border-b border-white/5 mb-2">
                  {["Basketball", "Soccer"].map(sport => (
                    <button
                      key={sport}
                      onClick={() => {
                        setActiveSport(sport as "Basketball" | "Soccer");
                        setActiveLeague(sport === "Basketball" ? "All Basketball" : "World Cup");
                      }}
                      className={`px-6 py-2 font-display font-black text-sm uppercase tracking-widest transition-all
                        ${activeSport === sport ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                <LeagueTabs 
                  leagues={activeSport === "Basketball" 
                    ? ["All Basketball", "NBA", "EuroLeague", "NCAA", "Other"] 
                    : ["World Cup", "Champions League", "Premier League", "MLS"]} 
                  activeLeague={activeLeague} 
                  onSelect={setActiveLeague} 
                />
                
                {activeSport === "Basketball" ? (
                  activeLeague === "All Basketball" ? (
                    <>
                      {recentlyWatched.length > 0 && <ContentRow title="Continue Watching" items={recentlyWatched} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />}
                      {myList.length > 0 && <ContentRow title="My List" items={myList} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />}
                      {recommendations.length > 0 && <ContentRow title="Up Next" items={recommendations} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />}
                      {data.basketball && Object.entries(data.basketball).map(([league, leagueItems]) => (
                        <div key={league}>
                          <ContentRow title={league} items={leagueItems as ContentItem[]} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                        </div>
                      ))}
                      <ContentRow title="Global Sports" items={data.sports} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                    </>
                  ) : (
                    <>
                      {data.basketball?.[activeLeague] && (
                        <ContentRow title={`${activeLeague} Live & Upcoming`} items={data.basketball[activeLeague] as ContentItem[]} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                      )}
                    </>
                  )
                ) : (
                  activeLeague === "World Cup" ? (
                    <div className="space-y-8 bg-linear-to-b from-green-900/20 to-transparent py-8 -mt-4">
                      <div className="px-16 flex items-center gap-4">
                         <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                           <Trophy className="text-black w-6 h-6" />
                         </div>
                         <div>
                            <h2 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase">World Cup Hub</h2>
                            <p className="text-white/40 text-xs font-mono tracking-widest uppercase">The Road to Glory</p>
                         </div>
                      </div>
                      <ContentRow title="Live Matches" items={data.soccer ? data.soccer["World Cup"] : []} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                      <ContentRow title="Popular Highlights" items={data.soccer ? data.soccer["Champions League"] : []} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                    </div>
                  ) : (
                    <>
                       {data.soccer?.[activeLeague] && (
                        <ContentRow title={`${activeLeague} Excellence`} items={data.soccer[activeLeague] as ContentItem[]} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                      )}
                    </>
                  )
                )}
                <ContentRow title="Blockbuster Movies" items={data.movies} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
                <ContentRow title="Featured Channels" items={data.live_tv} onSelect={handleSelect} resumePositions={activeProfile?.resumePositions} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {view === "profiles" && (
          <ProfilePicker 
            profiles={profiles} 
            onSelect={handleProfileSelect} 
            onAdd={handleAddProfile} 
          />
        )}
        {view === "search" && (
          <SearchScreen onClose={() => setView("home")} onSelect={handleSelect} />
        )}
        {view === "player" && selectedItem && (
          <SportsPlayer 
            item={selectedItem} 
            onClose={() => setView("home")} 
            initialTime={activeProfile?.resumePositions[selectedItem.id] || 0}
            onProgressUpdate={(seconds) => updateResumePosition(selectedItem.id, seconds)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
