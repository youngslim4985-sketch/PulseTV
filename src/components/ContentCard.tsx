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
  key?: string | number;
}

export default function ContentCard({ item, onClick }: ContentCardProps) {
  return (
    <motion.button
      id={`card-${item.id}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(item)}
      className="relative group flex-shrink-0 w-72 aspect-video rounded-lg overflow-hidden bg-[#1a1a24] border border-white/10 hover:border-roku-gold hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] focus:focus-ring cursor-pointer text-left transition-all duration-300"
    >
      <img
        src={item.thumb}
        alt={item.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
      />
      
      {/* Live Badge */}
      {item.isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider text-white">
          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
          Live
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white group-hover:text-roku-gold transition-colors">{item.title}</span>
          <span className="text-[10px] text-white/60 uppercase tracking-tighter">High-bitrate Stream</span>
        </div>
      </div>
    </motion.button>
  );
}
