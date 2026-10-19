/**
 * cameraStreamer.ts - Quản lý mở webcam trên trình duyệt của người dùng (navigator.mediaDevices.getUserMedia)
 * và truyền từng khung hình (frame) qua WebSocket tới server AI.
 */

class CameraStreamer {
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private timer: NodeJS.Timeout | null = null;
  private isStreaming = false;

  public async start(onFrame: (frameBase64: string) => void, fps = 8): Promise<boolean> {
    if (this.isStreaming) return true;

    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ mở Camera.");
      }

      // Yêu cầu quyền truy cập Camera từ người dùng
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { max: 15 },
          facingMode: "user",
        },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.srcObject = this.stream;
      this.video.playsInline = true;
      this.video.muted = true;
      await this.video.play();

      this.canvas = document.createElement("canvas");
      this.canvas.width = 480;
      this.canvas.height = 360;

      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;

      this.isStreaming = true;
      const intervalMs = Math.round(1000 / fps);

      let isBusy = false;
      this.timer = setInterval(() => {
        if (!this.isStreaming || !this.video || !this.canvas || isBusy) return;

        if (this.video.readyState >= 2) {
          isBusy = true;
          try {
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            // Nén ảnh JPEG chất lượng vừa đủ (0.55) để truyền siêu nhanh qua mạng
            const dataUrl = this.canvas.toDataURL("image/jpeg", 0.55);
            onFrame(dataUrl);
          } catch (e) {
            console.error("[CameraStreamer] Lỗi chụp frame:", e);
          } finally {
            isBusy = false;
          }
        }
      }, intervalMs);

      return true;
    } catch (err) {
      console.error("[CameraStreamer] Không thể khởi động Camera:", err);
      this.stop();
      return false;
    }
  }

  public stop(): void {
    this.isStreaming = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
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
  }

  public get active(): boolean {
    return this.isStreaming;
  }
}

export const cameraStreamer = new CameraStreamer();
