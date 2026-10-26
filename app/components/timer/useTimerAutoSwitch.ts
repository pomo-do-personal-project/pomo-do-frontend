"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { FocusMode, ModeDurationInfo } from "./types";
import { RingtoneType } from "../settings/hooks/useSettingsAudio";

interface UseTimerAutoSwitchProps {
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  focusMode: FocusMode;
  setFocusMode: (mode: FocusMode) => void;
  isOvertime: boolean;
  modeDurations: Record<FocusMode, ModeDurationInfo>;
  resetTimer: (secs: number) => void;
  playRingtone: (ringtone: RingtoneType, volume: number) => void;
  playTickSound: (volume: number) => void;
  onTimerTick: (isWork: boolean) => void;
  tickTimer: (mins: number) => void;
  executeSaveSession: () => Promise<void>;
  autoStartBreaksSetting?: boolean;
}

export function useTimerAutoSwitch({
  isRunning,
  setIsRunning,
  focusMode,
  setFocusMode,
  isOvertime,
  modeDurations,
  resetTimer,
  playRingtone,
  playTickSound,
  onTimerTick,
  tickTimer,
  executeSaveSession,
  autoStartBreaksSetting,
}: UseTimerAutoSwitchProps) {
  const [localSettingsVersion, setLocalSettingsVersion] = useState(0);

  useEffect(() => {
    const handleSettingsChange = () => setLocalSettingsVersion((v) => v + 1);
    window.addEventListener("storage", handleSettingsChange);
    window.addEventListener("pomodo_settings_changed", handleSettingsChange);
    return () => {
      window.removeEventListener("storage", handleSettingsChange);
      window.removeEventListener("pomodo_settings_changed", handleSettingsChange);
    };
  }, []);

  const isAutoBreak = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodo_auto_start_breaks");
      if (saved !== null) return saved === "true";
    }
    return Boolean(autoStartBreaksSetting);
  }, [autoStartBreaksSetting, localSettingsVersion]);

  const isAutoFocus = useMemo(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pomodo_auto_start_focus");
      if (saved !== null) return saved === "true";
    }
    return false;
  }, [localSettingsVersion]);

  const tickTimerRef = useRef(tickTimer);
  tickTimerRef.current = tickTimer;
  const onTimerTickRef = useRef(onTimerTick);
  onTimerTickRef.current = onTimerTick;
  const playTickSoundRef = useRef(playTickSound);
  playTickSoundRef.current = playTickSound;
  const playRingtoneRef = useRef(playRingtone);
  playRingtoneRef.current = playRingtone;
  const modeDurationsRef = useRef(modeDurations);
  modeDurationsRef.current = modeDurations;
  const focusModeRef = useRef(focusMode);
  focusModeRef.current = focusMode;
  const executeSaveSessionRef = useRef(executeSaveSession);
  executeSaveSessionRef.current = executeSaveSession;

  // Stable Tick interval: only restarts when isRunning toggles
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        const mode = focusModeRef.current;
        tickTimerRef.current(modeDurationsRef.current[mode].minutes);
        onTimerTickRef.current(mode === "W");

        if (typeof window !== "undefined") {
          const isTicking = localStorage.getItem("pomodo_ticking_enabled") === "true";
          if (isTicking) {
            const vol = Number(localStorage.getItem("pomodo_ticking_volume") || "60");
            playTickSoundRef.current(vol);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const isAutoSwitchingRef = useRef(false);

  // Auto transition when reaching overtime
  useEffect(() => {
    if (!isRunning || isAutoSwitchingRef.current) return;

    if (focusMode === "W" && isOvertime) {
      isAutoSwitchingRef.current = true;
      executeSaveSessionRef.current().finally(() => {
        setTimeout(() => { isAutoSwitchingRef.current = false; }, 1000);
      });
    } else if (focusMode !== "W" && isOvertime) {
      isAutoSwitchingRef.current = true;
      const nextDuration = modeDurationsRef.current["W"].minutes * 60;
      setFocusMode("W");
      resetTimer(nextDuration);

      if (typeof window !== "undefined") {
        const isSoundEnabled = localStorage.getItem("pomodo_sound_enabled") !== "false";
        if (isSoundEnabled) {
          const ring = (localStorage.getItem("pomodo_break_ringtone") || "zen") as RingtoneType;
          const soundVol = Number(localStorage.getItem("pomodo_sound_volume") || "80");
          playRingtoneRef.current(ring, soundVol);
        }
      }

      setIsRunning(isAutoFocus);
      setTimeout(() => { isAutoSwitchingRef.current = false; }, 1000);
    }
  }, [isOvertime, isRunning, focusMode, isAutoFocus, resetTimer, setFocusMode, setIsRunning]);

  return { isAutoBreak, isAutoFocus };
}
