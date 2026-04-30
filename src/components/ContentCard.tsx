/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { PlayCircle } from "lucide-react";
import { ContentItem } from "../types";

interface ContentCardProps {
  item: ContentItem;
  onClick: (item: ContentItem) => void;
  progress?: number; // 0 to 100
  key?: string | number;
}

export default function ContentCard({ item, onClick, progress }: ContentCardProps) {
  return (
    <motion.button
      id={`card-${item.id}`}
      whileHover={{ 
        scale: 1.1,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className="relative group flex-shrink-0 w-80 aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/40 cursor-pointer text-left transition-all duration-300"
    >
      <img
        src={item.thumb}
        alt={item.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
      />
      
      {/* Live Badge */}
      {item.isLive && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-[0.1em] text-white shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Live
        </div>
      )}

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
        <div className="flex flex-col transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-lg font-display font-bold text-white tracking-tight">{item.title}</span>
          <span className="text-xs text-white/60 font-medium uppercase tracking-widest">
            {item.league ? `${item.league} • ${item.region}` : (item.isLive ? 'Live Event' : '4K Ultra HD')}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-5 group-hover:opacity-0 transition-opacity">
         <span className="text-sm font-semibold text-white/90 drop-shadow-md tracking-tight">{item.title}</span>
      </div>

      {progress !== undefined && progress > 0 && progress < 95 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-apple-blue shadow-[0_0_10px_rgba(0,122,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}
