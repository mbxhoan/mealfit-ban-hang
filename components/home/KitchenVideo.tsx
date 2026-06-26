'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles } from 'lucide-react';

export function KitchenVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Play/pause based on scrolling into/out of view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering play/pause
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  return (
    <section id="video" className="relative mx-auto my-16 max-w-5xl scroll-mt-20 px-4 sm:px-6">
      {/* Ambient background glow behind the video container */}
      <div 
        className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-r from-meal-green/15 via-meal-orange/10 to-meal-yellow/15 opacity-70 blur-2xl animate-pulse" 
        style={{ animationDuration: '6s' }}
      />

      {/* Floating ingredients around the player (using the global meal-float class) */}
      <span
        className="meal-float pointer-events-none absolute -left-6 -top-6 text-4xl select-none z-10"
        style={{ ['--dur' as string]: '7s', ['--r' as string]: '-8deg' }}
      >
        🥦
      </span>
      <span
        className="meal-float pointer-events-none absolute -right-6 -bottom-6 text-4xl select-none z-10"
        style={{ ['--dur' as string]: '8s', ['--r' as string]: '10deg' }}
      >
        🥑
      </span>
      <span
        className="meal-float pointer-events-none absolute right-4 -top-8 text-3xl select-none z-10"
        style={{ ['--dur' as string]: '6.5s', ['--r' as string]: '6deg' }}
      >
        ✨
      </span>
      <span
        className="meal-float pointer-events-none absolute -left-10 bottom-12 text-3xl select-none z-10"
        style={{ ['--dur' as string]: '7.5s', ['--r' as string]: '-6deg' }}
      >
        🥩
      </span>

      {/* Video Container - No border, rounded, deep shadow */}
      <div 
        onClick={handlePlayPause}
        className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-meal-cream/40 shadow-[0_32px_80px_-24px_rgba(47,95,52,0.3)] animate-fade-in"
      >
        <video
          ref={videoRef}
          src="/video.mp4"
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-auto aspect-video object-cover"
        />

        {/* Dynamic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

        {/* Live Indicator Tag */}
        <div className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/45 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white/95">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-meal-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-meal-orange"></span>
          </span>
          <span className="font-display tracking-wider text-[11px]">MEALFIT KITCHEN</span>
        </div>

        {/* Center Hover Action Controls */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white ml-0.5" />}
          </div>
        </div>

        {/* Bottom Bar: Mute control and progress bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between gap-4 z-10">
          {/* Subtle text message */}
          <p className="text-white/90 text-sm font-semibold flex items-center gap-1.5 drop-shadow-md">
            <Sparkles className="h-4 w-4 text-meal-yellow animate-spin" style={{ animationDuration: '4s' }} />
            Món ngon, khoẻ, chế biến nhanh mỗi ngày
          </p>

          {/* Sound wave icon & Mute button */}
          <div className="flex items-center gap-3">
            {isPlaying && !isMuted && (
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-white rounded-full animate-bounce h-2" style={{ animationDuration: '0.6s', animationDelay: '0.1s' }} />
                <span className="w-0.5 bg-white rounded-full animate-bounce h-3" style={{ animationDuration: '0.7s', animationDelay: '0.3s' }} />
                <span className="w-0.5 bg-white rounded-full animate-bounce h-2.5" style={{ animationDuration: '0.5s', animationDelay: '0.2s' }} />
                <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5" style={{ animationDuration: '0.8s', animationDelay: '0.4s' }} />
              </div>
            )}
            <button
              onClick={handleMuteToggle}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur-md text-white hover:bg-black/65 transition-colors"
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-gradient-to-r from-meal-green to-meal-orange transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
