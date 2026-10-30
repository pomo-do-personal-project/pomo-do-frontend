import { apiClient } from "../lib/apiClient";

export const storageService = {
  /**
   * Tải ảnh trực tiếp lên AWS S3 thông qua Backend API an toàn (xác thực quyền Admin)
   */
  async uploadWorkspaceAsset(file: Blob | File, fileName: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file, fileName || "wallpaper.jpg");
    formData.append("fileName", fileName);

    const res = await apiClient<{ publicUrl: string }>("/api/admin/assets/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.data?.publicUrl) {
      throw new Error(res.message || "Tải ảnh lên AWS S3 thất bại: Không nhận được URL phản hồi.");
    }

    return res.data.publicUrl;
  },

  /**
   * Tải ảnh từ URL từ xa (AI URL hoặc link ngoài).
   * Gửi remoteUrl lên Backend để backend stream trực tiếp lên S3 (loại bỏ hoàn toàn lỗi CORS).
   * Có fallback chuyển qua Canvas Blob nếu backend yêu cầu gửi file nhị phân.
   */
  async uploadFromUrl(imageUrl: string, fileName: string): Promise<string> {
    try {
      // 1. Thử gửi remoteUrl trực tiếp cho Backend xử lý từ server
      const res = await apiClient<{ publicUrl: string }>("/api/admin/assets/upload-url", {
        method: "POST",
        body: JSON.stringify({
          remoteUrl: imageUrl,
          fileName,
        }),
      });

      if (res.data?.publicUrl) {
        return res.data.publicUrl;
      }
    } catch {
      // Fallback sang phía client nếu backend không tải được URL từ xa
    }

    // 2. Client-side fetch / canvas fallback
    let blob: Blob | null = null;
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        blob = await response.blob();
      }
    } catch {
      // Bỏ qua để thử fallback Canvas bên dưới
    }

    if (!blob && typeof window !== "undefined") {
      blob = await new Promise<Blob>((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 1280;
          canvas.height = img.naturalHeight || 720;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Không thể khởi tạo Canvas 2D"));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("Không thể chuyển ảnh Canvas thành Blob"))),
            "image/jpeg",
            0.92
          );
        };
        img.onerror = () => reject(new Error("Không thể tải ảnh qua trình duyệt"));
        img.src = imageUrl;
      });
    }

    if (!blob) {
      throw new Error("Không thể nạp dữ liệu ảnh từ URL được cung cấp.");
    }

    return this.uploadWorkspaceAsset(blob, fileName);
  },
};
