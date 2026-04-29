/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import ContentCard from "./ContentCard";
import { ContentItem } from "../types";

interface SearchScreenProps {
  onClose: () => void;
  onSelect: (item: ContentItem) => void;
}

export default function SearchScreen({ onClose, onSelect }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 bg-roku-dark z-50 flex flex-col p-12">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex-1 max-w-2xl focus-within:ring-2 focus-within:ring-roku-gold ring-offset-2 ring-offset-roku-dark transition-all">
          <SearchIcon className="w-6 h-6 text-white/40" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, channels, or sports..."
            className="bg-transparent border-none outline-none text-xl w-full placeholder:text-white/20"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-5 h-5 text-white/40" />
            </button>
          )}
        </div>
        <button 
          onClick={onClose}
          className="ml-8 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all"
        >
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-roku-gold animate-spin" />
          </div>
        ) : query && results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40 space-y-4">
             <SearchIcon className="w-20 h-20 opacity-10" />
             <p className="text-xl">No results found for "{query}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {results.map((item) => (
              <ContentCard key={item.id} item={item} onClick={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
