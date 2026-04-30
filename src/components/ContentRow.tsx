/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ContentCard from "./ContentCard";
import { ContentItem } from "../types";

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
  resumePositions?: Record<string, number>;
}

export default function ContentRow({ title, items, onSelect, resumePositions }: ContentRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between px-10">
        <h2 className="text-xs font-display font-bold uppercase tracking-[0.3em] text-white/40">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll("left")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll("right")}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-10 pb-6 scrollbar-hide scroll-smooth no-scrollbar"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
        {items.map((item) => {
          const resumeTime = resumePositions?.[item.id] || 0;
          // Estimate progress: assume 2 hour duration (7200s) if missing
          const progress = item.duration ? (resumeTime / item.duration) * 100 : (resumeTime / 7200) * 100;
          
          return (
            <ContentCard 
              key={item.id} 
              item={item} 
              onClick={onSelect} 
              progress={progress > 0 ? progress : undefined} 
            />
          );
        })}
      </div>
    </div>
  );
}
