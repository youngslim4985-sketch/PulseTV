/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface LeagueTabsProps {
  leagues: string[];
  activeLeague: string;
  onSelect: (league: string) => void;
}

export default function LeagueTabs({ leagues, activeLeague, onSelect }: LeagueTabsProps) {
  return (
    <div className="flex items-center gap-4 px-16 py-8 overflow-x-auto no-scrollbar">
      {leagues.map((league) => (
        <motion.button
          key={league}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(league)}
          className={`px-8 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-[0.2em] transition-all whitespace-nowrap
            ${activeLeague === league 
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
              : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/5'}`}
        >
          {league}
        </motion.button>
      ))}
    </div>
  );
}
