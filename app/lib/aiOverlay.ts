/**
 * aiOverlay.ts - Lưu kết quả nhận diện (toạ độ khung mặt / tay / điện thoại) từ server AI
 * để vẽ đè (overlay) lên video webcam hiển thị trực tiếp trên trình duyệt (không trễ).
 * Toạ độ nằm trong không gian khung hình gửi lên server (FRAME_W x FRAME_H, đã lật gương).
 */
import { create } from "zustand";

export const FRAME_W = 400;
export const FRAME_H = 300;

export type Box = [number, number, number, number];

export interface AiOverlayHand {
  points?: [number, number][];
  box?: Box;
  holding_phone?: boolean;
  is_calling?: boolean;
}

export interface AiOverlayPhoneBox {
  box: Box;
  conf: number;
  is_call?: boolean;
}

export interface AiOverlayData {
  faceBox: Box | null;
  phoneBoxes: AiOverlayPhoneBox[];
  hands: AiOverlayHand[];
  hasFace: boolean;
  hasPhone: boolean;
  hasCall: boolean;
  isFocused: boolean;
  detail: string;
  activeScreen: number | null;
}

interface AiOverlayState {
  data: AiOverlayData | null;
  setData: (d: AiOverlayData | null) => void;
}

export const useAiOverlayStore = create<AiOverlayState>()((set) => ({
  data: null,
  setData: (d) => set({ data: d }),
}));

