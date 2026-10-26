"use client";

import React, { useState, useEffect, useRef } from "react";
import { Waves, Play, Pause, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { SystemAssetDto } from "../../types/asset";
import { assetService } from "../../services/assetService";
import { useSettingsStore } from "../../stores/useSettingsStore";

export function AmbientSoundWidget() {
  const { settings, updateSettings } = useSettingsStore();
  const [ambients, setAmbients] = useState<SystemAssetDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Load ambient sound tracks
  useEffect(() => {
    let isMounted = true;
    assetService
      .getActiveAssets("audio_ambient")
      .then((res) => {
        if (isMounted) setAmbients(res);
      })
      .catch((err) => console.error("Failed to load ambient sounds:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Handle outside click to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Determine current active track
  const currentTrack =
    ambients.find((a) => a.url === settings.ambientSoundUrl) ||
    ambients.find((a) => a.isDefault) ||
    ambients[0];

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Ambient playback error:", err));
    }
  };

  const handleSelectTrack = (track: SystemAssetDto) => {
    updateSettings({ ambientSoundUrl: track.url });
    if (audioRef.current) {
      audioRef.current.src = track.url;
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error(e));
      }
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Hidden looped audio element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          loop
          onError={() => setIsPlaying(false)}
          preload="none"
        />
      )}

      {/* Header Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Âm thanh môi trường tập trung"
        className={`flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          isPlaying
            ? "bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-400"
            : "bg-white/80 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
        }`}
      >
        <Waves size={15} className={isPlaying ? "animate-pulse text-teal-500" : "text-neutral-400"} />
        <span className="hidden md:inline max-w-24 truncate">
          {isPlaying && currentTrack ? currentTrack.name : "Âm môi trường"}
        </span>
        <ChevronDown size={12} className="opacity-60" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white dark:bg-[#1c1d21] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Waves size={14} className="text-teal-500" />
              Âm thanh môi trường
            </span>
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`p-1.5 rounded-lg text-white font-semibold transition-transform cursor-pointer ${
                isPlaying ? "bg-rose-500 hover:bg-rose-600" : "bg-teal-600 hover:bg-teal-500"
              }`}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} className="translate-x-0.5" />}
            </button>
          </div>

          {/* Volume Control Slider */}
          <div className="flex items-center gap-2 pt-1 pb-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setVolume((v) => (v === 0 ? 60 : 0))}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer h-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700"
            />
            <span className="w-7 text-right font-mono text-[11px] text-neutral-500">
              {volume}%
            </span>
          </div>

          {/* Track List */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
              Chọn âm thanh
            </span>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {ambients.map((track) => {
                const active = currentTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => handleSelectTrack(track)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                      active
                        ? "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-semibold"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <span className="truncate">{track.name}</span>
                    {track.category && (
                      <span className="text-[9px] text-neutral-400 ml-1.5 shrink-0">
                        {track.category}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
