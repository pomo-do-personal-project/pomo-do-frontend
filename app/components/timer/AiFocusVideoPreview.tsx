"use client";

import React, { useEffect, useRef } from "react";
import { Camera, RefreshCw, Sparkles } from "lucide-react";
import { cameraStreamer } from "../../lib/cameraStreamer";
import { useAiOverlayStore, FRAME_W, FRAME_H, AiOverlayData } from "../../lib/aiOverlay";
import { useAiFocusStore } from "../../stores/useAiFocusStore";

interface AiFocusVideoPreviewProps {
  isAiEnabled: boolean;
  image: string | null;
  isConnecting: boolean;
  borderClass: string;
  countdown: number | null;
  onEnable: () => void;
}

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

/** Vẽ khung mặt / bàn tay / điện thoại lên canvas trong suốt đặt trên video (toạ độ FRAME_W x FRAME_H). */
function drawOverlay(ctx: CanvasRenderingContext2D, d: AiOverlayData | null) {
  ctx.clearRect(0, 0, FRAME_W, FRAME_H);
  if (!d) return;
  ctx.lineWidth = 2;
  ctx.font = "bold 13px system-ui, sans-serif";

  if (d.faceBox) {
    const [x1, y1, x2, y2] = d.faceBox;
    const col = d.isFocused ? GREEN : RED;
    ctx.strokeStyle = col;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.fillStyle = col;
    ctx.fillText(d.isFocused ? "Focused" : d.detail || "Distracted", x1, Math.max(y1 - 6, 14));
  }

  for (const h of d.hands) {
    const pts = h.points;
    if (!pts || pts.length !== 21) continue;
    const holding = (h.holding_phone || h.is_calling) && d.hasPhone;
    ctx.strokeStyle = holding ? RED : AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.moveTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
    }
    ctx.stroke();

    ctx.fillStyle = holding ? RED : "#ffffff";
    ctx.beginPath();
    for (const [px, py] of pts) {
      ctx.moveTo(px + 2, py);
      ctx.arc(px, py, 2, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  ctx.lineWidth = 2;
  for (const p of d.phoneBoxes) {
    const [x1, y1, x2, y2] = p.box;
    const col = d.hasPhone ? RED : AMBER;
    ctx.strokeStyle = col;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.fillStyle = col;
    const label = `${p.is_call ? "PHONE CALL" : "PHONE"} ${Math.round((p.conf || 0) * 100)}%`;
    ctx.fillText(label, x1 + 2, Math.max(y1 - 6, 14));
  }

  // HUD góc trên trái
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.fillStyle = d.hasPhone ? RED : GREEN;
  ctx.fillText(d.hasPhone ? (d.hasCall ? "Phone: YES (CALL)" : "Phone: YES") : "Phone: NO", 10, 20);
  ctx.fillStyle = d.hasFace ? GREEN : RED;
  ctx.fillText(d.hasFace ? "Face: YES" : "Face: NO", 10, 38);
}

export function AiFocusVideoPreview({
  isAiEnabled,
  image,
  isConnecting,
  borderClass,
  countdown,
  onEnable,
}: AiFocusVideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isLive = isAiEnabled && Boolean(image);
  const blurBackground = useAiFocusStore((s) => s.blurBackground);
  const setBlurBackground = useAiFocusStore((s) => s.setBlurBackground);
  const blurredImage = useAiFocusStore((s) => s.blurredImage);

  // Gắn trực tiếp luồng webcam vào thẻ <video> -> hình ảnh mượt 30 FPS, không phụ thuộc tốc độ server
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const stream = isLive ? cameraStreamer.getStream() : null;
    if (video.srcObject !== stream) {
      video.srcObject = stream;
      if (stream) video.play().catch(() => {});
    }
  }, [isLive]);

  // Vẽ lại overlay mỗi khi server trả kết quả mới (không re-render React)
  useEffect(() => {
    if (!isLive) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawOverlay(ctx, useAiOverlayStore.getState().data);
    return useAiOverlayStore.subscribe((s) => drawOverlay(ctx, s.data));
  }, [isLive]);

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-neutral-950 border-2 transition-all duration-200 flex items-center justify-center ${borderClass}`}
    >
      {isLive ? (
        <>
          {blurBackground && blurredImage ? (
            <img
              src={blurredImage}
              alt="Live AI Blurred Preview"
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ transform: "scaleX(-1)" }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={FRAME_W}
            height={FRAME_H}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Nút bấm nhanh bật/tắt làm mờ nền */}
          <button
            type="button"
            onClick={() => setBlurBackground(!blurBackground)}
            title={blurBackground ? "Tắt làm mờ nền" : "Bật làm mờ nền (bảo vệ riêng tư, loại bỏ đồ đạc ở background)"}
            className={`absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md border cursor-pointer transition-all ${
              blurBackground
                ? "bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-xs"
                : "bg-black/60 border-white/10 text-neutral-300 hover:text-white hover:bg-black/80"
            }`}
          >
            <Sparkles size={12} className={blurBackground ? "text-amber-400 animate-pulse" : "text-neutral-400"} />
            <span>{blurBackground ? "Mờ nền: BẬT" : "Mờ nền: TẮT"}</span>
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
          {isConnecting ? (
            <>
              <RefreshCw size={22} className="animate-spin text-emerald-400" />
              <span className="text-xs text-neutral-400">Đang khởi động webcam...</span>
            </>
          ) : (
            <>
              <Camera size={26} className="text-neutral-600" />
              <span className="text-xs text-neutral-400">Camera AI đang tắt</span>
              {!isAiEnabled && (
                <button
                  type="button"
                  onClick={onEnable}
                  className="mt-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Bật camera ngay
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Đếm ngược khi hiệu chuẩn thêm màn hình */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-1.5">
          <span className="text-4xl font-extrabold text-amber-400 animate-bounce">
            {countdown}
          </span>
          <span className="text-xs text-white px-2.5 py-1 bg-neutral-900 rounded-full font-medium">
            Hãy quay sang màn hình phụ...
          </span>
        </div>
      )}
    </div>
  );
}
