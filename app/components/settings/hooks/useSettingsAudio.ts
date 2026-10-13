"use client";

export type RingtoneType = "bell" | "zen" | "digital" | "marimba";

export function useSettingsAudio() {
  // Bộ phát âm thanh Web Audio API tổng hợp nhẹ nhàng (Zero-latency, 100% offline)
  const playRingtone = (type: RingtoneType, vol = 80) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.01, Math.min(1, (vol / 100) * 0.35));
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
          osc.stop(now + 1.2);
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
        osc1.stop(now + 2.0);
        osc2.stop(now + 2.0);
      } else if (type === "digital") {
        [0, 0.12].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const beepGain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(idx === 0 ? 700 : 950, now + offset);
          beepGain.gain.setValueAtTime(0.15, now + offset);
          beepGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
          osc.connect(beepGain);
          beepGain.connect(gainNode);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
      } else if (type === "marimba") {
        [523.25, 659.25, 783.99].forEach((f, idx) => {
          const offset = idx * 0.09;
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(f, now + offset);
          noteGain.gain.setValueAtTime(0.6, now + offset);
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

  // Tiếng tích tắc đồng hồ (Ticking sound) nhẹ nhàng
  const playTickSound = (vol = 40) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.01, Math.min(1, (vol / 100) * 0.22));
      gainNode.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      [0, 0.22].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(idx === 0 ? 1200 : 800, now + offset);
        oscGain.gain.setValueAtTime(0.3, now + offset);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now + offset);
        osc.stop(now + offset + 0.04);
      });
    } catch (err) {
      console.error("Tick audio error:", err);
    }
  };

  // Cảnh báo quá giờ (+OT Alert)
  const playOvertimeAlert = (vol = 80) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gainNode = ctx.createGain();
      const normalizedVol = Math.max(0.01, Math.min(1, (vol / 100) * 0.35));
      gainNode.gain.setValueAtTime(normalizedVol, ctx.currentTime);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      [0, 0.16].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(idx === 0 ? 587.33 : 659.25, now + offset);
        oscGain.gain.setValueAtTime(0.5, now + offset);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.25);
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start(now + offset);
        osc.stop(now + offset + 0.28);
      });
    } catch (err) {
      console.error("Overtime audio error:", err);
    }
  };

  return { playRingtone, playTickSound, playOvertimeAlert };
}
