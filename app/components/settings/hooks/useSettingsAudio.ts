"use client";

export type RingtoneType = "bell" | "zen" | "digital" | "marimba";

// Reusable singleton AudioContext to adhere to browser autoplay policy
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!globalAudioCtx || globalAudioCtx.state === "closed") {
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

import { useSettingsStore } from "../../../stores/useSettingsStore";

export function useSettingsAudio() {
  // 1. Bộ phát âm thanh chuông kết thúc phiên (Ringtone)
  const playRingtone = (type: RingtoneType, vol = 80) => {
    try {
      const customAlarmUrl = useSettingsStore.getState().settings.alarmSoundUrl;
      if (customAlarmUrl) {
        const audio = new Audio(customAlarmUrl);
        audio.volume = Math.max(0.05, Math.min(1, vol / 100));
        audio.play().catch(() => {});
        return;
      }

      const ctx = getAudioContext();
      if (!ctx) return;

      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.05, Math.min(1, (vol / 100) * 0.75));
      gainNode.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === "bell") {
        const freqs = [880, 1760, 2640];
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now);
          oscGain.gain.setValueAtTime(1 / (idx + 1), now);
          oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(oscGain);
          oscGain.connect(gainNode);
          osc.start(now);
          osc.stop(now + 1.25);
        });
      } else if (type === "zen") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const bowlGain = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(261.63, now);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(523.25, now);
        bowlGain.gain.setValueAtTime(0.8, now);
        bowlGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc1.connect(bowlGain);
        osc2.connect(bowlGain);
        bowlGain.connect(gainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 2.05);
        osc2.stop(now + 2.05);
      } else if (type === "digital") {
        [0, 0.12].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const beepGain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(idx === 0 ? 700 : 950, now + offset);
          beepGain.gain.setValueAtTime(0.35, now + offset);
          beepGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(beepGain);
          beepGain.connect(gainNode);
          osc.start(now + offset);
          osc.stop(now + offset + 0.12);
        });
      } else if (type === "marimba") {
        [523.25, 659.25, 783.99].forEach((f, idx) => {
          const offset = idx * 0.09;
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + offset);
          noteGain.gain.setValueAtTime(0.7, now + offset);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.4);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(now + offset);
          osc.stop(now + offset + 0.45);
        });
      }
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  // 2. Tiếng tích tắc đồng hồ (Ticking sound) rõ ràng, giòn tan như đồng hồ cơ
  const playTickSound = (vol = 60) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.05, Math.min(1, (vol / 100) * 0.7));
      gainNode.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;

      // Âm Tick (đanh, gỗ nhẹ)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);

      oscGain.gain.setValueAtTime(0.8, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (err) {
      console.error("Tick audio error:", err);
    }
  };

  // 3. Cảnh báo quá giờ (+OT Alert)
  const playOvertimeAlert = (vol = 80) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.05, Math.min(1, (vol / 100) * 0.75));
      gainNode.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      [0, 0.18].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(idx === 0 ? 659.25 : 880, now + offset);
        oscGain.gain.setValueAtTime(0.7, now + offset);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.28);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now + offset);
        osc.stop(now + offset + 0.3);
      });
    } catch (err) {
      console.error("Overtime audio error:", err);
    }
  };

  return { playRingtone, playTickSound, playOvertimeAlert };
}
