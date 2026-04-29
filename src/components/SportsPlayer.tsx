/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, 
  Maximize, Minimize, X, Settings, FastForward, Rewind 
} from "lucide-react";
import { ContentItem } from "../types";

interface SportsPlayerProps {
  item: ContentItem;
  onClose: () => void;
}

export default function SportsPlayer({ item, onClose }: SportsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const controlsTimeout = useRef<number | null>(null);

  // Load bookmark
  useEffect(() => {
    const saved = localStorage.getItem(`bookmark-${item.id}`);
    if (saved && videoRef.current && !item.isLive) {
       videoRef.current.currentTime = parseFloat(saved);
    }
  }, [item.id, item.isLive]);

  // Save bookmark every 10s
  useEffect(() => {
    if (item.isLive) return;
    const interval = setInterval(() => {
      if (videoRef.current) {
        localStorage.setItem(`bookmark-${item.id}`, videoRef.current.currentTime.toString());
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [item.id, item.isLive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) window.clearTimeout(controlsTimeout.current);
    controlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      id="video-player-container"
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        autoPlay
        src={item.url}
        className="w-full h-full max-h-screen"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      />

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-display font-bold">{item.title}</h1>
                {item.isLive && (
                  <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-tighter">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Live Streaming
                  </div>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                id="close-player"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Middle Controls (Optional large icons) */}
            <div className="flex-1 flex items-center justify-center gap-12">
               <button onClick={() => videoRef.current && (videoRef.current.currentTime -= 10)} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                  <Rewind className="w-10 h-10" />
               </button>
               <button onClick={togglePlay} className="p-6 bg-white rounded-full text-black hover:scale-110 transition-transform">
                  {isPlaying ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current" />}
               </button>
               <button onClick={() => videoRef.current && (videoRef.current.currentTime += 10)} className="p-4 hover:bg-white/10 rounded-full transition-colors">
                  <FastForward className="w-10 h-10" />
               </button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden relative group cursor-pointer">
                  <div 
                    className="h-full bg-roku-gold transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm font-mono text-white/70">
                  <span>{videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"}</span>
                  <span>{videoRef.current ? formatTime(videoRef.current.duration) : "0:00"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/10 rounded-full">
                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full">
                    <RotateCcw className="w-6 h-6" onClick={() => videoRef.current && (videoRef.current.currentTime = 0)} />
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <button className="p-2 hover:bg-white/10 rounded-full">
                    <Settings className="w-6 h-6" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-full">
                    <Maximize className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
