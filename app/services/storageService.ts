import { supabase } from "../lib/supabaseClient";

export const storageService = {
  /**
   * Tải ảnh trực tiếp lên Supabase Storage bucket workspace-assets
   */
  async uploadWorkspaceAsset(file: Blob | File, fileName: string): Promise<string> {
    const cleanName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .slice(0, 30);
    const filePath = `wallpapers/${Date.now()}_${cleanName || "asset"}.jpg`;

    const { error } = await supabase.storage
      .from("workspace-assets")
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error(`Upload Supabase Storage thất bại: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from("workspace-assets")
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  },

  /**
   * Tải ảnh từ một URL từ xa (ví dụ AI URL), chuyển thành Blob và đẩy vào Supabase Storage.
   * Áp dụng dual-strategy: fetch trực tiếp hoặc fallback qua Canvas Blob nếu fetch bị chặn.
   */
  async uploadFromUrl(imageUrl: string, fileName: string): Promise<string> {
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
