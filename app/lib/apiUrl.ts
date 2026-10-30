/**
 * Dynamic URL resolvers for API and WebSocket
 * Automatically detects whether running in browser on a domain (ALB / minhdevs.click)
 * or local dev, ensuring zero CORS and zero configuration issues.
 */

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return window.location.origin;
    }
  }
  const rawBase = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7051";
  return rawBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export function getAiWsUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${proto}//${window.location.host}/ws`;
    }
  }
  return process.env.NEXT_PUBLIC_AI_WS_URL || "ws://localhost:8001/ws";
}

export function getAiHttpUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `${window.location.origin}/ai`;
    }
  }
  return process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001";
}

