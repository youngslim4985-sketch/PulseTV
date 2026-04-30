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
  initialTime?: number;
  onProgressUpdate?: (seconds: number) => void;
}

export default function SportsPlayer({ item, onClose, initialTime = 0, onProgressUpdate }: SportsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const controlsTimeout = useRef<number | null>(null);

  // Load bookmark
  useEffect(() => {
    if (videoRef.current && initialTime > 0 && !item.isLive) {
       videoRef.current.currentTime = initialTime;
    }
  }, [item.id, item.isLive, initialTime]);

  // Save bookmark every 5s and on close
  useEffect(() => {
    if (item.isLive) return;
    const interval = setInterval(() => {
      if (videoRef.current && onProgressUpdate) {
        onProgressUpdate(videoRef.current.currentTime);
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      if (videoRef.current && onProgressUpdate) {
        onProgressUpdate(videoRef.current.currentTime);
      }
    };
  }, [item.id, item.isLive, onProgressUpdate]);

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

  const seek = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + amount));
    }
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
            className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/40 flex flex-col justify-between p-12"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold tracking-tight">{item.title}</h1>
                {item.isLive ? (
                  <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Live Stream
                  </div>
                ) : (
                  <div className="text-white/40 text-xs font-mono tracking-widest uppercase">4K • Dolby Vision</div>
                )}
              </div>
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/10"
                id="close-player"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Controls (tvOS Style) */}
            <div className="max-w-4xl mx-auto w-full space-y-8 glass rounded-2xl p-8 border-none bg-apple-midnight/60">
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                      <button onClick={() => seek(-15)} className="p-2 text-white hover:opacity-60 transition-opacity">
                        <Rewind className="w-5 h-5" />
                      </button>
                      <button onClick={togglePlay} className="p-2 text-white hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                      </button>
                      <button onClick={() => seek(15)} className="p-2 text-white hover:opacity-60 transition-opacity">
                        <FastForward className="w-5 h-5" />
                      </button>
                   </div>
                   <div className="flex-1 space-y-2">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-white transition-all duration-150"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono font-bold text-white/30 tracking-widest uppercase">
                        <span>{videoRef.current ? formatTime(videoRef.current.currentTime) : "0:00"}</span>
                        <span>{videoRef.current ? formatTime(videoRef.current.duration) : "0:00"}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-white hover:opacity-60 transition-opacity">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <button className="p-2 text-white hover:opacity-60 transition-opacity">
                        <Maximize className="w-5 h-5" />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
