/**
 * cameraStreamer.ts - Quản lý mở webcam trên trình duyệt của người dùng (navigator.mediaDevices.getUserMedia)
 * và truyền từng khung hình (frame) qua WebSocket tới server AI.
 */

class CameraStreamer {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private nextFrameTimer: ReturnType<typeof setTimeout> | null = null;
  private safetyTimer: ReturnType<typeof setTimeout> | null = null;
  private onFrameCallback: ((frameBase64: string) => void) | null = null;
  private minIntervalMs = 42;
  private lastSendTime = 0;
  private isStreaming = false;
  private isWaitingForServer = false;

  public async start(onFrame: (frameBase64: string) => void, fps = 24): Promise<boolean> {
    if (this.isStreaming) return true;

    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ mở Camera.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: "user",
        },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.srcObject = this.stream;
      this.video.playsInline = true;
      this.video.muted = true;
      await this.video.play();

      // Khung hình 400x300 (tỉ lệ 4:3 khớp với yolov8s_fast.onnx 320x416)
      this.canvas = document.createElement("canvas");
      this.canvas.width = 400;
      this.canvas.height = 300;

      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;
      this.ctx = ctx;

      this.onFrameCallback = onFrame;
      this.minIntervalMs = Math.max(25, Math.round(1000 / fps));
      this.isStreaming = true;
      this.isWaitingForServer = false;
      this.lastSendTime = 0;

      this.scheduleNextFrame(0);
      return true;
    } catch (err) {
      console.error("[CameraStreamer] Không thể khởi động Camera:", err);
      this.stop();
      return false;
    }
  }

  private scheduleNextFrame(delayMs: number): void {
    if (!this.isStreaming) return;
    if (this.nextFrameTimer) {
      clearTimeout(this.nextFrameTimer);
      this.nextFrameTimer = null;
    }
    this.nextFrameTimer = setTimeout(() => {
      this.nextFrameTimer = null;
      this.captureAndSend();
    }, Math.max(0, delayMs));
  }

  private captureAndSend(): void {
    if (!this.isStreaming || !this.video || !this.canvas || !this.ctx || !this.onFrameCallback) return;
    if (this.isWaitingForServer) return;

    if (this.video.readyState >= 2) {
      try {
        this.isWaitingForServer = true;
        this.lastSendTime = performance.now();
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        const dataUrl = this.canvas.toDataURL("image/jpeg", 0.55);
        this.onFrameCallback(dataUrl);

        if (this.safetyTimer) clearTimeout(this.safetyTimer);
        this.safetyTimer = setTimeout(() => {
          this.notifyServerReady();
        }, 300);
      } catch (e) {
        this.isWaitingForServer = false;
        console.error("[CameraStreamer] Lỗi chụp frame:", e);
        this.scheduleNextFrame(this.minIntervalMs);
      }
    } else {
      this.scheduleNextFrame(16);
    }
  }

  // Báo cho CameraStreamer biết server đã phản hồi xong, gửi ngay frame kế tiếp không chờ đợi
  public notifyServerReady(): void {
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    this.isWaitingForServer = false;
    if (!this.isStreaming) return;
    const elapsed = performance.now() - this.lastSendTime;
    const remaining = Math.max(0, this.minIntervalMs - elapsed);
    this.scheduleNextFrame(remaining);
  }

  public stop(): void {
    this.isStreaming = false;
    this.isWaitingForServer = false;
    this.onFrameCallback = null;
    if (this.nextFrameTimer) {
      clearTimeout(this.nextFrameTimer);
      this.nextFrameTimer = null;
    }
    if (this.safetyTimer) {
      clearTimeout(this.safetyTimer);
      this.safetyTimer = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
    this.canvas = null;
    this.ctx = null;
  }

  public get active(): boolean {
    return this.isStreaming;
  }

  // MediaStream gốc của webcam để hiển thị trực tiếp trên trình duyệt (không qua server, không trễ)
  public getStream(): MediaStream | null {
    return this.stream;
  }
}

export const cameraStreamer = new CameraStreamer();
