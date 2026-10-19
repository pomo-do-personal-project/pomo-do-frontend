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
  private isWaitingForServer = false;

  public async start(onFrame: (frameBase64: string) => void, fps = 6): Promise<boolean> {
    if (this.isStreaming) return true;

    try {
      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ mở Camera.");
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { max: 12 },
          facingMode: "user",
        },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.srcObject = this.stream;
      this.video.playsInline = true;
      this.video.muted = true;
      await this.video.play();

      // Tối ưu tỉ lệ 4:3 sắc nét (440x330): Khớp hoàn hảo khung widget (350px), siêu nhẹ (~15KB) giúp triệt tiêu độ trễ mạng
      this.canvas = document.createElement("canvas");
      this.canvas.width = 440;
      this.canvas.height = 330;

      const ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return false;

      this.isStreaming = true;
      this.isWaitingForServer = false;
      const intervalMs = Math.round(1000 / fps);

      this.timer = setInterval(() => {
        if (!this.isStreaming || !this.video || !this.canvas) return;

        // Cơ chế Backpressure: Chỉ gửi frame mới khi server Render đã xử lý xong frame trước
        if (this.isWaitingForServer) return;

        if (this.video.readyState >= 2) {
          try {
            this.isWaitingForServer = true;
            ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            // Chất lượng 0.65 cân bằng tuyệt đối giữa độ nét cao và độ trễ siêu thấp
            const dataUrl = this.canvas.toDataURL("image/jpeg", 0.65);
            onFrame(dataUrl);

            // Timeout an toàn: Nếu sau 700ms server chưa phản hồi thì tự cho phép gửi frame kế tiếp
            setTimeout(() => {
              this.isWaitingForServer = false;
            }, 700);
          } catch (e) {
            this.isWaitingForServer = false;
            console.error("[CameraStreamer] Lỗi chụp frame:", e);
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

  // Báo cho CameraStreamer biết server đã phản hồi xong, sẵn sàng gửi frame mới
  public notifyServerReady(): void {
    this.isWaitingForServer = false;
  }

  public stop(): void {
    this.isStreaming = false;
    this.isWaitingForServer = false;
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
