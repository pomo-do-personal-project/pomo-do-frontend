"use client";

import { useState, useRef, useEffect } from "react";

interface UseResizablePanelOptions {
  storageKey?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  marginRight?: number;
}

export function useResizablePanel({
  storageKey = "pomo-resizable-panel-width",
  defaultWidth = 384,
  minWidth = 300,
  maxWidth = 750,
  marginRight = 350,
}: UseResizablePanelOptions = {}) {
  const [width, setWidth] = useState<number>(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef<number>(defaultWidth);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          setWidth(parsed);
          widthRef.current = parsed;
        }
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        const newWidth = window.innerWidth - e.clientX;
        const clamped = Math.max(minWidth, Math.min(newWidth, Math.min(maxWidth, window.innerWidth - marginRight)));
        widthRef.current = clamped;
        setWidth(clamped);
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
        if (storageKey) {
          localStorage.setItem(storageKey, widthRef.current.toString());
        }
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth, marginRight, storageKey]);

  const startResizing = () => setIsResizing(true);

  return {
    width,
    isResizing,
    panelRef,
    startResizing,
  };
}
